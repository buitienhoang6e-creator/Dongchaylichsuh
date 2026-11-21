import 'dotenv/config';
import crypto from 'node:crypto';
import { dataFile, getDb } from './db.js';
import { hashPassword } from './accounts.js';

/**
 * Công cụ quản trị tài khoản cho thầy cô / người quản lý trang web (chạy trên máy chủ):
 *   npm run tai-khoan -- danh-sach
 *   npm run tai-khoan -- doi-mat-khau <tên đăng nhập>   (khi học sinh quên mật khẩu)
 */

const [cmd, name] = process.argv.slice(2);
const db = getDb();

if (cmd === 'danh-sach') {
  const rows = db
    .prepare(
      `SELECT u.username, u.display_name, u.created_at, p.data
       FROM users u LEFT JOIN progress p ON p.user_id = u.id ORDER BY u.created_at`,
    )
    .all();
  console.log(`File dữ liệu: ${dataFile()}`);
  console.log(`Có ${rows.length} tài khoản.`);
  for (const r of rows) {
    let learned = 0;
    try {
      learned = Object.keys(JSON.parse(r.data || '{}').learned || {}).length;
    } catch {
      /* bỏ qua */
    }
    const created = new Date(r.created_at).toLocaleDateString('vi-VN');
    console.log(`- ${r.username} (${r.display_name}) — tạo ngày ${created}, đã học ${learned} sự kiện`);
  }
} else if (cmd === 'doi-mat-khau' && name) {
  const user = db.prepare('SELECT id, username FROM users WHERE username = ?').get(name.trim().toLowerCase());
  if (!user) {
    console.error(`Không tìm thấy tài khoản "${name}".`);
    process.exit(1);
  }
  // Mật khẩu tạm 10 ký tự, bỏ các ký tự dễ nhầm (0/O, 1/l/I)
  const alphabet = 'abcdefghijkmnpqrstuvwxyz23456789';
  const temp = Array.from(crypto.randomBytes(10), (b) => alphabet[b % alphabet.length]).join('');
  db.prepare('UPDATE users SET password_hash = ? WHERE id = ?').run(await hashPassword(temp), user.id);
  db.prepare('DELETE FROM sessions WHERE user_id = ?').run(user.id);
  console.log(`Đã đặt mật khẩu tạm cho "${user.username}": ${temp}`);
  console.log('Hãy đưa mật khẩu này cho học sinh và nhắc đổi mật khẩu mới trong trang Tài khoản.');
} else {
  console.log('Cách dùng:');
  console.log('  npm run tai-khoan -- danh-sach');
  console.log('  npm run tai-khoan -- doi-mat-khau <tên đăng nhập>');
  process.exit(cmd ? 1 : 0);
}
