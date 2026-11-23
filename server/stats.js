import crypto from 'node:crypto';
import express from 'express';
import rateLimit from 'express-rate-limit';
import { db } from './db.js';
import { EVENTS, getEventBySlug } from '../src/data/events.js';

/**
 * THỐNG KÊ LƯỢT TRUY CẬP — tự đếm, không dùng dịch vụ bên ngoài.
 *
 * Tôn trọng quyền riêng tư của học sinh:
 *  - Không dùng cookie, không lưu địa chỉ IP hay trình duyệt của người xem.
 *  - Để đếm "số người xem trong ngày", máy chủ tạo một mã băm từ (ngày + IP + trình duyệt) bằng khóa bí mật.
 *    Mã này đổi mỗi ngày nên không thể dùng để theo dõi một người qua nhiều ngày; sang ngày mới, các mã của
 *    ngày cũ bị xóa, chỉ giữ lại con số tổng.
 *  - Trình duyệt bật "Do Not Track" hoặc "Global Privacy Control" sẽ không được đếm.
 *
 * Xem số liệu: lệnh `npm run tai-khoan -- thong-ke`, hoặc trang /thong-ke (cần đặt STATS_PASSWORD).
 */

const TZ = 'Asia/Ho_Chi_Minh';
const DAY_MS = 24 * 60 * 60 * 1000;
/** Ngày theo giờ Việt Nam, dạng YYYY-MM-DD. */
export const dayOf = (date = new Date()) => new Intl.DateTimeFormat('en-CA', { timeZone: TZ }).format(date);
const daysAgo = (n) => dayOf(new Date(Date.now() - n * DAY_MS));

// ───────────── Tên trang ─────────────

const PAGE_NAMES = {
  '/': 'Trang chủ',
  '/tong-quan': 'Tổng quan',
  '/gioi-thieu': 'Giới thiệu lịch sử',
  '/muc-luc': 'Mục lục tiến trình',
  '/hoc-tap': 'Học tập',
  '/hoc-tap/viet-nam': 'Cuộn phim lịch sử Việt Nam',
  '/hoc-tap/the-gioi': 'Lịch sử thế giới',
  '/ban-do': 'Bản đồ sự kiện',
  '/giang-vien-ai': 'Giảng viên AI',
  '/tai-khoan': 'Tài khoản',
  '/dang-nhap': 'Đăng nhập',
  '/dang-ky': 'Đăng ký',
};
const OTHER = '(trang khác)';
const EVENT_SLUGS = new Set(EVENTS.map((e) => e.slug));

/** Chỉ đếm các trang có thật của web (tránh bị gửi đường dẫn rác làm đầy cơ sở dữ liệu). */
export function normalizePath(raw) {
  if (typeof raw !== 'string') return null;
  let p = raw.split(/[?#]/)[0].slice(0, 200);
  if (p.length > 1) p = p.replace(/\/+$/, '');
  if (p === '/thong-ke') return null; // không đếm chính trang thống kê
  if (PAGE_NAMES[p]) return p;
  const m = p.match(/^\/(su-kien|mo-phong)\/([a-z0-9-]{1,80})$/);
  if (m && EVENT_SLUGS.has(m[2])) return p;
  return OTHER;
}

export function pageName(path) {
  if (PAGE_NAMES[path]) return PAGE_NAMES[path];
  const m = path.match(/^\/(su-kien|mo-phong)\/(.+)$/);
  const ev = m && getEventBySlug(m[2]);
  if (ev) return `${m[1] === 'mo-phong' ? 'Mô phỏng 3D' : 'Sự kiện'}: ${ev.title}`;
  return path;
}

// ───────────── Ghi một lượt xem ─────────────

const BOT_RE = /bot|crawl|spider|slurp|headless|lighthouse|preview|facebookexternalhit|embedly|curl|wget|python|node-fetch|axios|go-http|java\//i;

let secretPromise = null;
/** Khóa bí mật để băm mã người xem — tạo một lần, lưu trong cơ sở dữ liệu. */
function visitorSecret() {
  secretPromise ||= (async () => {
    const row = await db.get("SELECT value FROM meta WHERE key = 'visitor_secret'");
    if (row) return row.value;
    await db.run("INSERT OR IGNORE INTO meta (key, value) VALUES ('visitor_secret', ?)", crypto.randomBytes(32).toString('hex'));
    return (await db.get("SELECT value FROM meta WHERE key = 'visitor_secret'")).value;
  })().catch((err) => {
    secretPromise = null;
    throw err;
  });
  return secretPromise;
}

let tidiedDay = null;
/** Sang ngày mới: chỉ giữ lại SỐ người xem của các ngày cũ, xóa các mã băm. */
async function tidyOldVisitors(today) {
  if (tidiedDay === today) return;
  await db.batch([
    ['INSERT OR REPLACE INTO visitor_days (day, visitors) SELECT day, COUNT(*) FROM daily_visitors WHERE day < ? GROUP BY day', today],
    ['DELETE FROM daily_visitors WHERE day < ?', today],
  ]);
  tidiedDay = today;
}

export async function recordView({ path, ip, userAgent }) {
  const day = dayOf();
  await tidyOldVisitors(day);
  const visitor = crypto
    .createHmac('sha256', await visitorSecret())
    .update(`${day}|${ip || ''}|${userAgent || ''}`)
    .digest('hex')
    .slice(0, 24);
  await db.batch([
    ['INSERT INTO page_views (day, path, views) VALUES (?, ?, 1) ON CONFLICT(day, path) DO UPDATE SET views = views + 1', day, path],
    ['INSERT OR IGNORE INTO daily_visitors (day, visitor) VALUES (?, ?)', day, visitor],
  ]);
}

// ───────────── Tổng hợp số liệu ─────────────

export async function getSummary({ days = 30 } = {}) {
  const today = dayOf();
  await tidyOldVisitors(today);
  const from = daysAgo(days - 1);

  const viewRows = await db.all('SELECT day, SUM(views) AS v FROM page_views WHERE day >= ? GROUP BY day', from);
  const visitorRows = await db.all(
    `SELECT day, visitors AS n FROM visitor_days WHERE day >= ?
     UNION ALL
     SELECT day, COUNT(*) AS n FROM daily_visitors WHERE day >= ? GROUP BY day`,
    from,
    from,
  );
  const views = new Map(viewRows.map((r) => [r.day, Number(r.v)]));
  const visitors = new Map();
  for (const r of visitorRows) visitors.set(r.day, (visitors.get(r.day) || 0) + Number(r.n));

  const series = [];
  for (let i = days - 1; i >= 0; i--) {
    const day = daysAgo(i);
    series.push({ day, views: views.get(day) || 0, visitors: visitors.get(day) || 0 });
  }
  const sum = (list, key) => list.reduce((s, d) => s + d[key], 0);
  const last = (n) => series.slice(-n);

  const top = await db.all(
    'SELECT path, SUM(views) AS v FROM page_views WHERE day >= ? GROUP BY path ORDER BY v DESC LIMIT 10',
    from,
  );
  const all = await db.get('SELECT COALESCE(SUM(views), 0) AS v, MIN(day) AS first FROM page_views');
  const users = await db.get('SELECT COUNT(*) AS n FROM users');
  const newUsers = await db.get('SELECT COUNT(*) AS n FROM users WHERE created_at >= ?', Date.now() - 7 * DAY_MS);

  return {
    today,
    since: all.first || null,
    totals: {
      today: { views: views.get(today) || 0, visitors: visitors.get(today) || 0 },
      week: { views: sum(last(7), 'views'), visitors: sum(last(7), 'visitors') },
      month: { views: sum(series, 'views'), visitors: sum(series, 'visitors') },
      allViews: Number(all.v),
    },
    series,
    topPages: top.map((r) => ({ path: r.path, name: pageName(r.path), views: Number(r.v) })),
    accounts: { total: Number(users.n), newThisWeek: Number(newUsers.n) },
  };
}

// ───────────── Định tuyến ─────────────

const router = express.Router();
const handle = (fn) => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);

router.use((req, res, next) => {
  res.set('Cache-Control', 'no-store');
  next();
});

// Một người không thể tự "bơm" lượt xem: tối đa 120 lượt mỗi 10 phút cho mỗi địa chỉ IP
const viewLimiter = rateLimit({ windowMs: 10 * 60 * 1000, limit: 120, standardHeaders: 'draft-7', legacyHeaders: false });

router.post(
  '/stats/view',
  viewLimiter,
  handle(async (req, res) => {
    const ua = req.get('user-agent') || '';
    const optedOut = req.get('dnt') === '1' || req.get('sec-gpc') === '1';
    const path = normalizePath(req.body?.path);
    if (path && !optedOut && !BOT_RE.test(ua)) await recordView({ path, ip: req.ip, userAgent: ua });
    res.status(204).end();
  }),
);

// Chặn dò mật khẩu trang thống kê
const statsLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 15,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  message: { error: 'Bạn thử quá nhiều lần. Hãy đợi khoảng 15 phút rồi thử lại.' },
});

const digest = (s) => crypto.createHash('sha256').update(String(s)).digest();

router.post(
  '/stats/summary',
  statsLimiter,
  handle(async (req, res) => {
    const expected = (process.env.STATS_PASSWORD || '').trim();
    if (!expected) {
      return res.status(404).json({
        error: 'Trang thống kê chưa được bật. Người quản trị cần đặt biến môi trường STATS_PASSWORD trên máy chủ.',
      });
    }
    const given = typeof req.body?.password === 'string' ? req.body.password : '';
    if (!crypto.timingSafeEqual(digest(given), digest(expected))) {
      return res.status(401).json({ error: 'Mật khẩu chưa đúng.' });
    }
    res.json(await getSummary());
  }),
);

// eslint-disable-next-line no-unused-vars
router.use((err, req, res, next) => {
  console.error('[thong-ke]', err?.message || err);
  res.status(500).json({ error: 'Chưa lấy được số liệu. Bạn thử lại sau ít phút nhé.' });
});

export default router;
