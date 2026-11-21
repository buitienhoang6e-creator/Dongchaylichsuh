import crypto from 'node:crypto';
import { promisify } from 'node:util';
import express from 'express';
import rateLimit from 'express-rate-limit';
import { getDb } from './db.js';
import { EMPTY_PROGRESS, sanitizeProgress } from '../src/lib/progressData.js';

/**
 * TÀI KHOẢN NGƯỜI HỌC — đăng ký, đăng nhập, lưu tiến độ học.
 *
 * Chỉ lưu những gì cần thiết: tên đăng nhập, tên hiển thị (có thể là biệt danh), mật khẩu đã băm và tiến độ học.
 * Không thu thập email, số điện thoại hay ngày sinh.
 *  - Mật khẩu băm bằng scrypt kèm "muối" ngẫu nhiên; máy chủ không bao giờ lưu mật khẩu thật.
 *  - Phiên đăng nhập là mã ngẫu nhiên trong cookie httpOnly (JavaScript của trang không đọc được);
 *    cơ sở dữ liệu chỉ lưu mã băm của nó.
 */

const scrypt = promisify(crypto.scrypt);
const COOKIE = 'dcls_phien';
const SESSION_MS = 30 * 24 * 60 * 60 * 1000; // 30 ngày
const USERNAME_RE = /^[a-z0-9._]{3,24}$/;
const PASSWORD_MIN = 8;
const PASSWORD_MAX = 128;

// ───────────── Mật khẩu ─────────────

export async function hashPassword(password) {
  const salt = crypto.randomBytes(16);
  const key = await scrypt(password.normalize('NFC'), salt, 64);
  return `scrypt$${salt.toString('base64')}$${key.toString('base64')}`;
}

async function verifyPassword(password, stored) {
  const [alg, salt, hash] = String(stored).split('$');
  if (alg !== 'scrypt' || !salt || !hash) return false;
  const key = await scrypt(password.normalize('NFC'), Buffer.from(salt, 'base64'), 64);
  const expected = Buffer.from(hash, 'base64');
  return expected.length === key.length && crypto.timingSafeEqual(expected, key);
}

// Băm thử một mật khẩu giả khi tên đăng nhập không tồn tại, để thời gian trả lời như nhau
// (không cho người ngoài dò xem tên đăng nhập nào đã có).
let dummyHash = null;
async function burnTime(password) {
  dummyHash ||= await hashPassword('mat-khau-gia-de-can-thoi-gian');
  await verifyPassword(password, dummyHash);
}

// ───────────── Phiên đăng nhập ─────────────

const sha256 = (s) => crypto.createHash('sha256').update(s).digest('hex');

function readCookie(req, name) {
  for (const part of (req.headers.cookie || '').split(';')) {
    const i = part.indexOf('=');
    if (i > 0 && part.slice(0, i).trim() === name) {
      try {
        return decodeURIComponent(part.slice(i + 1).trim());
      } catch {
        return null;
      }
    }
  }
  return null;
}

function cookieOptions(req) {
  // secure: chỉ gửi cookie qua HTTPS khi trang chạy HTTPS (Hostinger); chạy thử trên máy (http) vẫn dùng được
  return { httpOnly: true, sameSite: 'lax', secure: req.secure, path: '/' };
}

function startSession(req, res, userId) {
  const token = crypto.randomBytes(32).toString('base64url');
  const now = Date.now();
  const db = getDb();
  db.prepare('DELETE FROM sessions WHERE expires_at < ?').run(now);
  db.prepare('INSERT INTO sessions (token_hash, user_id, created_at, expires_at) VALUES (?, ?, ?, ?)').run(
    sha256(token),
    userId,
    now,
    now + SESSION_MS,
  );
  res.cookie(COOKIE, token, { ...cookieOptions(req), maxAge: SESSION_MS });
}

function endSession(req, res) {
  const token = readCookie(req, COOKIE);
  if (token) getDb().prepare('DELETE FROM sessions WHERE token_hash = ?').run(sha256(token));
  res.clearCookie(COOKIE, cookieOptions(req));
}

function currentUser(req) {
  const token = readCookie(req, COOKIE);
  if (!token || token.length > 100) return null;
  const row = getDb()
    .prepare(
      `SELECT u.id, u.username, u.display_name, u.password_hash, u.created_at, s.expires_at
       FROM sessions s JOIN users u ON u.id = s.user_id WHERE s.token_hash = ?`,
    )
    .get(sha256(token));
  return row && row.expires_at > Date.now() ? row : null;
}

const publicUser = (u) => ({ id: u.id, username: u.username, displayName: u.display_name, createdAt: u.created_at });

// ───────────── Kiểm tra dữ liệu ─────────────

const cleanUsername = (v) => (typeof v === 'string' ? v.trim().toLowerCase() : '');

function cleanDisplayName(v, fallback) {
  const s = typeof v === 'string' ? v.replace(/[\p{C}]/gu, '').replace(/\s+/g, ' ').trim().slice(0, 40) : '';
  return s || fallback;
}

function passwordError(p) {
  if (typeof p !== 'string' || p.length < PASSWORD_MIN) return `Mật khẩu cần ít nhất ${PASSWORD_MIN} ký tự.`;
  if (p.length > PASSWORD_MAX) return 'Mật khẩu quá dài.';
  return null;
}

// ───────────── Định tuyến ─────────────

const router = express.Router();

// Bọc hàm async để lỗi được chuyển tới bộ xử lý lỗi bên dưới (Express 4 không tự bắt lỗi của Promise)
const handle = (fn) => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);

// Chỉ nhận dữ liệu JSON cho các thao tác thay đổi — cùng với cookie SameSite, chặn việc trang web lạ gửi lệnh giả.
function jsonOnly(req, res, next) {
  if (!req.is('application/json')) return res.status(415).json({ error: 'Yêu cầu không hợp lệ.' });
  next();
}

function requireUser(req, res, next) {
  const user = currentUser(req);
  if (!user) return res.status(401).json({ error: 'Bạn cần đăng nhập để dùng chức năng này.' });
  req.user = user;
  next();
}

// Chặn dò mật khẩu: tối đa 20 lần đăng nhập / đăng ký mỗi 15 phút cho mỗi địa chỉ IP
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 20,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  message: { error: 'Bạn thử quá nhiều lần. Hãy đợi khoảng 15 phút rồi thử lại nhé.' },
});

router.use((req, res, next) => {
  res.set('Cache-Control', 'no-store');
  next();
});

router.get('/auth/me', (req, res) => {
  const user = currentUser(req);
  res.json({ user: user ? publicUser(user) : null });
});

router.post(
  '/auth/register',
  authLimiter,
  jsonOnly,
  handle(async (req, res) => {
    const username = cleanUsername(req.body?.username);
    const password = req.body?.password;
    if (!USERNAME_RE.test(username)) {
      return res.status(400).json({
        error: 'Tên đăng nhập gồm 3–24 ký tự: chữ cái không dấu, chữ số, dấu chấm (.) hoặc gạch dưới (_).',
      });
    }
    const pwError = passwordError(password);
    if (pwError) return res.status(400).json({ error: pwError });

    const displayName = cleanDisplayName(req.body?.displayName, username);
    const hash = await hashPassword(password);
    let id;
    try {
      const r = getDb()
        .prepare('INSERT INTO users (username, display_name, password_hash, created_at) VALUES (?, ?, ?, ?)')
        .run(username, displayName, hash, Date.now());
      id = Number(r.lastInsertRowid);
    } catch (err) {
      if (err?.errcode === 2067 /* SQLITE_CONSTRAINT_UNIQUE */) {
        return res.status(409).json({ error: 'Tên đăng nhập này đã có người dùng. Bạn chọn tên khác nhé.' });
      }
      throw err;
    }
    startSession(req, res, id);
    const user = getDb().prepare('SELECT * FROM users WHERE id = ?').get(id);
    res.status(201).json({ user: publicUser(user) });
  }),
);

router.post(
  '/auth/login',
  authLimiter,
  jsonOnly,
  handle(async (req, res) => {
    const username = cleanUsername(req.body?.username);
    const password = typeof req.body?.password === 'string' ? req.body.password.slice(0, PASSWORD_MAX) : '';
    const user = username ? getDb().prepare('SELECT * FROM users WHERE username = ?').get(username) : null;
    let ok = false;
    if (user) ok = await verifyPassword(password, user.password_hash);
    else await burnTime(password);
    if (!ok) return res.status(401).json({ error: 'Tên đăng nhập hoặc mật khẩu chưa đúng.' });
    startSession(req, res, user.id);
    res.json({ user: publicUser(user) });
  }),
);

router.post('/auth/logout', jsonOnly, (req, res) => {
  endSession(req, res);
  res.json({ ok: true });
});

router.post(
  '/auth/password',
  authLimiter,
  jsonOnly,
  requireUser,
  handle(async (req, res) => {
    const { currentPassword, newPassword } = req.body || {};
    if (typeof currentPassword !== 'string' || !(await verifyPassword(currentPassword, req.user.password_hash))) {
      return res.status(403).json({ error: 'Mật khẩu hiện tại chưa đúng.' });
    }
    const pwError = passwordError(newPassword);
    if (pwError) return res.status(400).json({ error: pwError });
    const db = getDb();
    db.prepare('UPDATE users SET password_hash = ? WHERE id = ?').run(await hashPassword(newPassword), req.user.id);
    // Đăng xuất mọi thiết bị khác, giữ lại phiên hiện tại
    const token = readCookie(req, COOKIE);
    db.prepare('DELETE FROM sessions WHERE user_id = ? AND token_hash <> ?').run(req.user.id, sha256(token));
    res.json({ ok: true });
  }),
);

router.delete(
  '/auth/account',
  authLimiter,
  jsonOnly,
  requireUser,
  handle(async (req, res) => {
    const password = req.body?.password;
    if (typeof password !== 'string' || !(await verifyPassword(password, req.user.password_hash))) {
      return res.status(403).json({ error: 'Mật khẩu chưa đúng.' });
    }
    // Xóa tài khoản sẽ tự xóa luôn phiên đăng nhập và tiến độ học (ON DELETE CASCADE)
    getDb().prepare('DELETE FROM users WHERE id = ?').run(req.user.id);
    res.clearCookie(COOKIE, cookieOptions(req));
    res.json({ ok: true });
  }),
);

router.get('/progress', requireUser, (req, res) => {
  const row = getDb().prepare('SELECT data, updated_at FROM progress WHERE user_id = ?').get(req.user.id);
  let progress = EMPTY_PROGRESS;
  if (row) {
    try {
      progress = sanitizeProgress(JSON.parse(row.data));
    } catch {
      /* dữ liệu hỏng — coi như chưa có */
    }
  }
  res.json({ progress, updatedAt: row?.updated_at ?? null });
});

router.put('/progress', jsonOnly, requireUser, (req, res) => {
  if (!req.body || typeof req.body.progress !== 'object') return res.status(400).json({ error: 'Thiếu dữ liệu tiến độ.' });
  const progress = sanitizeProgress(req.body.progress);
  const now = Date.now();
  getDb()
    .prepare(
      `INSERT INTO progress (user_id, data, updated_at) VALUES (?, ?, ?)
       ON CONFLICT(user_id) DO UPDATE SET data = excluded.data, updated_at = excluded.updated_at`,
    )
    .run(req.user.id, JSON.stringify(progress), now);
  res.json({ progress, updatedAt: now });
});

// eslint-disable-next-line no-unused-vars
router.use((err, req, res, next) => {
  console.error('[tai-khoan]', err);
  res.status(500).json({ error: 'Máy chủ đang gặp sự cố. Bạn thử lại sau ít phút nhé.' });
});

export default router;
