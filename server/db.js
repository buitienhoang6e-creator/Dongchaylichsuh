import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { DatabaseSync } from 'node:sqlite';

/**
 * Cơ sở dữ liệu tài khoản và tiến độ học — SQLite có sẵn trong Node.js (từ bản 22.13), không cần cài thêm.
 * File dữ liệu nằm trong thư mục DATA_DIR (mặc định: dong-chay-lich-su/data/). Nhớ sao lưu file này.
 */

const PROJECT_ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

let db = null;

export function dataFile() {
  const dir = path.resolve(PROJECT_ROOT, process.env.DATA_DIR || 'data');
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
