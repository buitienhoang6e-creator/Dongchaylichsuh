import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { DatabaseSync } from 'node:sqlite';

/**
 * Cơ sở dữ liệu tài khoản và tiến độ học — SQLite có sẵn trong Node.js (từ bản 22.13), không cần cài thêm.
 * File dữ liệu nằm trong thư mục DATA_DIR. Mặc định:
 *  - chạy trên máy: dong-chay-lich-su/data/
 *  - chạy trên Hostinger (ứng dụng Node.js trong hPanel): ~/dong-chay-lich-su-data/ — NGOÀI thư mục ứng dụng,
 *    vì mỗi lần triển khai lại Hostinger tạo thư mục build mới (…/hbuilds/…) và bỏ thư mục cũ.
 * Nhớ sao lưu file này.
 */

const PROJECT_ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const ON_HOSTINGER_BUILD = PROJECT_ROOT.split(path.sep).includes('hbuilds');

let db = null;

export function dataFile() {
  let dir;
  if (process.env.DATA_DIR) dir = path.resolve(PROJECT_ROOT, process.env.DATA_DIR);
  else if (ON_HOSTINGER_BUILD) dir = path.join(os.homedir(), 'dong-chay-lich-su-data');
  else dir = path.join(PROJECT_ROOT, 'data');
  return path.join(dir, 'dong-chay-lich-su.db');
}

export function getDb() {
  if (db) return db;
  const file = dataFile();
  fs.mkdirSync(path.dirname(file), { recursive: true });
  db = new DatabaseSync(file);
  db.exec(`
    PRAGMA journal_mode = WAL;
    PRAGMA foreign_keys = ON;
    PRAGMA busy_timeout = 3000;

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
  `);
  return db;
}
