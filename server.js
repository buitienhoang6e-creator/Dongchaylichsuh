import 'dotenv/config';
import path from 'node:path';
import fs from 'node:fs';
import { fileURLToPath } from 'node:url';
import express from 'express';
import compression from 'compression';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { describeError, getProvider, streamAnswer, validateMessages } from './server/teacher.js';
import accountsRouter from './server/accounts.js';
import statsRouter from './server/stats.js';
import { dataLocation, initDb } from './server/db.js';

const here = path.dirname(fileURLToPath(import.meta.url));
const DIST = path.join(here, 'dist');
const PORT = Number(process.env.PORT) || 3000;
const isProd = process.env.NODE_ENV === 'production';

const app = express();
app.disable('x-powered-by');
app.set('trust proxy', 1); // Hostinger đặt máy chủ sau proxy

app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        // 'wasm-unsafe-eval': cho phép WebAssembly của bộ giải nén mô hình 3D (meshopt)
        scriptSrc: ["'self'", "'wasm-unsafe-eval'"],
        styleSrc: ["'self'", "'unsafe-inline'", 'https://fonts.googleapis.com'],
        fontSrc: ["'self'", 'https://fonts.gstatic.com', 'data:'],
        imgSrc: ["'self'", 'data:', 'blob:', 'https://i.ytimg.com', 'https://upload.wikimedia.org'],
        mediaSrc: ["'self'", 'blob:'],
        connectSrc: ["'self'", 'blob:', 'data:'],
        frameSrc: ['https://www.youtube-nocookie.com', 'https://www.youtube.com'],
        workerSrc: ["'self'", 'blob:'],
        objectSrc: ["'none'"],
        baseUri: ["'self'"],
        frameAncestors: ["'self'"],
        upgradeInsecureRequests: isProd ? [] : null,
      },
    },
    // YouTube cần biết trang nhúng video là trang nào
    referrerPolicy: { policy: 'strict-origin-when-cross-origin' },
    crossOriginEmbedderPolicy: false,
  }),
);

// Nén phản hồi, trừ luồng trò chuyện (cần gửi ngay từng đoạn chữ)
app.use(compression({ filter: (req, res) => !req.path.startsWith('/api/chat') && compression.filter(req, res) }));
app.use(express.json({ limit: '64kb' }));

// ───────────── API ─────────────
app.get('/api/health', (req, res) => {
  const provider = getProvider();
  res.json({ ok: true, ai: Boolean(provider), provider: provider?.id ?? null, model: provider?.model ?? null });
});

const chatLimiter = rateLimit({
  windowMs: 10 * 60 * 1000,
  limit: 30,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  message: { error: 'Bạn hỏi hơi nhanh rồi. Hãy nghỉ vài phút rồi hỏi tiếp nhé.' },
});

app.post('/api/chat', chatLimiter, async (req, res) => {
  if (!getProvider()) {
    return res.status(503).json({
      error: 'Giảng viên AI chưa được cấu hình trên máy chủ (thiếu khóa API). Hãy báo cho quản trị trang web.',
    });
  }
  const { messages, error } = validateMessages(req.body?.messages);
  if (error) return res.status(400).json({ error });
  const eventSlug = typeof req.body?.eventSlug === 'string' ? req.body.eventSlug.slice(0, 80) : undefined;

  res.writeHead(200, {
    'Content-Type': 'text/event-stream; charset=utf-8',
    'Cache-Control': 'no-cache, no-transform',
    Connection: 'keep-alive',
    'X-Accel-Buffering': 'no',
  });
  res.flushHeaders?.();

  const controller = new AbortController();
  res.on('close', () => controller.abort());
  const send = (obj) => res.write(`data: ${JSON.stringify(obj)}\n\n`);

  try {
    await streamAnswer({ messages, eventSlug, send, signal: controller.signal });
    send({ type: 'done' });
  } catch (err) {
    if (controller.signal.aborted) return res.end();
    console.error('[giang-vien-ai]', err?.status || '', err?.message || err);
    send({ type: 'error', message: describeError(err) });
  }
  res.end();
});

// Thống kê lượt truy cập (/api/stats/view, /api/stats/summary) — không cookie, không lưu IP
app.use('/api', statsRouter);

// Tài khoản người học và tiến độ học (/api/auth/..., /api/progress)
app.use('/api', accountsRouter);

app.use('/api', (req, res) => res.status(404).json({ error: 'Không tìm thấy' }));

// ───────────── Giao diện ─────────────
if (fs.existsSync(DIST)) {
  // File có mã băm trong tên (thư mục assets) được lưu đệm lâu dài
  app.use(
    '/assets',
    express.static(path.join(DIST, 'assets'), { immutable: true, maxAge: '1y', fallthrough: false }),
  );
  app.use(express.static(DIST, { maxAge: '7d', index: false }));
  // Đường dẫn có đuôi file (ảnh, mô hình…) mà không tồn tại thì trả 404, không trả trang web
  app.get(/\.[a-z0-9]{2,5}$/i, (req, res) => res.status(404).send('Không tìm thấy tệp'));
  app.get('*', (req, res) => {
    res.setHeader('Cache-Control', 'no-cache');
    res.sendFile(path.join(DIST, 'index.html'));
  });
} else {
  app.get('/', (req, res) =>
    res
      .status(200)
      .send('Chưa có bản build giao diện. Chạy "npm run build" rồi khởi động lại, hoặc dùng "npm run dev" khi phát triển.'),
  );
}

app.listen(PORT, () => {
  console.log(`Dòng chảy lịch sử đang chạy tại http://localhost:${PORT}`);
  const provider = getProvider();
  console.log(
    `Giảng viên AI: ${provider ? `đã bật (${provider.name}, model ${provider.model})` : 'chưa cấu hình (thiếu GROQ_API_KEY hoặc ANTHROPIC_API_KEY)'}`,
  );
  // Mở (và tạo bảng nếu chưa có) cơ sở dữ liệu tài khoản. Lỗi kết nối không làm sập trang:
  // các trang học vẫn chạy, riêng phần tài khoản sẽ thử kết nối lại ở lần dùng sau.
  initDb()
    .then(() => console.log(`Tài khoản người học: lưu tại ${dataLocation()}`))
    .catch((err) => console.error(`[tai-khoan] Chưa mở được cơ sở dữ liệu (${dataLocation()}):`, err?.message || err));
});
