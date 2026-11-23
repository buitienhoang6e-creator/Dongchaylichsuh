import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { createClient } from '@libsql/client';

/**
 * CƠ SỞ DỮ LIỆU TÀI KHOẢN VÀ TIẾN ĐỘ HỌC (libSQL — tương thích SQLite)
 *
 * Hai chế độ, tự chọn theo biến môi trường:
 *  - Có TURSO_DATABASE_URL (+ TURSO_AUTH_TOKEN): lưu trên Turso (cơ sở dữ liệu trên mạng, có gói miễn phí).
 *    Dùng khi đặt web ở nơi không giữ được file, ví dụ Render miễn phí.
 *  - Không có: lưu vào file dong-chay-lich-su.db trong thư mục DATA_DIR. Nhớ sao lưu file này. Mặc định:
 *      · chạy trên máy: dong-chay-lich-su/data/
 *      · chạy trên Hostinger (ứng dụng Node.js trong hPanel): ~/dong-chay-lich-su-data/ — NGOÀI thư mục ứng dụng,
 *        vì mỗi lần triển khai lại Hostinger tạo thư mục build mới (…/hbuilds/…) và bỏ thư mục cũ.
 *
 * Mọi hàm đều bất đồng bộ (async): get → một dòng, all → nhiều dòng, run → thực thi, batch → nhiều lệnh trong một giao dịch.
 */

const PROJECT_ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const ON_HOSTINGER_BUILD = PROJECT_ROOT.split(path.sep).includes('hbuilds');
const env = (name) => (process.env[name] || '').trim();

export function usesTurso() {
  return Boolean(env('TURSO_DATABASE_URL'));
}

export function dataFile() {
  let dir;
  if (env('DATA_DIR')) dir = path.resolve(PROJECT_ROOT, env('DATA_DIR'));
  else if (ON_HOSTINGER_BUILD) dir = path.join(os.homedir(), 'dong-chay-lich-su-data');
  else dir = path.join(PROJECT_ROOT, 'data');
  return path.join(dir, 'dong-chay-lich-su.db');
}

/** Mô tả nơi lưu dữ liệu (để in ra khi khởi động; không in khóa bí mật). */
export function dataLocation() {
  if (!usesTurso()) return dataFile();
  try {
    return `Turso (${new URL(env('TURSO_DATABASE_URL')).host})`;
  } catch {
    return 'Turso';
  }
}

const SCHEMA = `
  CREATE TABLE IF NOT EXISTS users (
    id            INTEGER PRIMARY KEY,
    username      TEXT    NOT NULL UNIQUE COLLATE NOCASE,
    display_name  TEXT    NOT NULL,
    password_hash TEXT    NOT NULL,
    created_at    INTEGER NOT NULL
  );

  -- Chỉ lưu mã băm SHA-256 của mã phiên, không lưu mã phiên thật
  CREATE TABLE IF NOT EXISTS sessions (
    token_hash TEXT    PRIMARY KEY,
    user_id    INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    created_at INTEGER NOT NULL,
    expires_at INTEGER NOT NULL
  );
  CREATE INDEX IF NOT EXISTS sessions_user ON sessions(user_id);

  CREATE TABLE IF NOT EXISTS progress (
    user_id    INTEGER PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
    data       TEXT    NOT NULL,
    updated_at INTEGER NOT NULL
  );

  -- Thống kê lượt xem (xem server/stats.js): chỉ lưu số đếm theo ngày và theo trang, không lưu IP hay cookie
  CREATE TABLE IF NOT EXISTS page_views (
    day   TEXT    NOT NULL,
    path  TEXT    NOT NULL,
    views INTEGER NOT NULL,
    PRIMARY KEY (day, path)
  );
  -- Mã người xem của NGÀY HÔM NAY (mã băm đổi mỗi ngày); sang ngày mới chỉ giữ lại con số trong visitor_days
  CREATE TABLE IF NOT EXISTS daily_visitors (
    day     TEXT NOT NULL,
    visitor TEXT NOT NULL,
    PRIMARY KEY (day, visitor)
  );
  CREATE TABLE IF NOT EXISTS visitor_days (
    day      TEXT    PRIMARY KEY,
    visitors INTEGER NOT NULL
  );
  CREATE TABLE IF NOT EXISTS meta (
    key   TEXT PRIMARY KEY,
    value TEXT NOT NULL
  );
`;

let ready = null;

async function open() {
  let client;
  if (usesTurso()) {
    client = createClient({ url: env('TURSO_DATABASE_URL'), authToken: env('TURSO_AUTH_TOKEN') || undefined });
  } else {
    const file = dataFile();
    fs.mkdirSync(path.dirname(file), { recursive: true });
    client = createClient({ url: pathToFileURL(file).href });
    await client.executeMultiple('PRAGMA journal_mode = WAL; PRAGMA busy_timeout = 3000;');
  }
  await client.executeMultiple(SCHEMA);
  return client;
}

/** Không để lỗi kết nối một lần làm hỏng mãi: lần sau sẽ thử mở lại. */
function client() {
  ready ||= open().catch((err) => {
    ready = null;
    throw err;
  });
  return ready;
}

const stmt = (sql, args) => ({ sql, args: args.map((a) => (a === undefined ? null : a)) });

export const db = {
  /** Dòng đầu tiên (hoặc undefined). */
  async get(sql, ...args) {
    const r = await (await client()).execute(stmt(sql, args));
    return r.rows[0];
  },
  async all(sql, ...args) {
    const r = await (await client()).execute(stmt(sql, args));
    return r.rows;
  },
  /** Trả về { changes, lastInsertRowid }. */
  async run(sql, ...args) {
    const r = await (await client()).execute(stmt(sql, args));
    return { changes: r.rowsAffected, lastInsertRowid: r.lastInsertRowid == null ? undefined : Number(r.lastInsertRowid) };
  },
  /** Nhiều lệnh [sql, ...args] trong một giao dịch: hoặc tất cả thành công, hoặc không lệnh nào. */
  async batch(list) {
    return (await client()).batch(
      list.map(([sql, ...args]) => stmt(sql, args)),
      'write',
    );
  },
};

/** Mở sẵn cơ sở dữ liệu (tạo bảng nếu chưa có) khi máy chủ khởi động. */
export async function initDb() {
  await client();
}

/** Lỗi trùng giá trị UNIQUE (ví dụ tên đăng nhập đã có người dùng). */
export function isUniqueError(err) {
  const s = `${err?.code || ''} ${err?.extendedCode || ''} ${err?.message || ''}`;
  return /UNIQUE/i.test(s) || /SQLITE_CONSTRAINT/.test(s);
}
