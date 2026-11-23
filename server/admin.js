import 'dotenv/config';
import crypto from 'node:crypto';
import { dataLocation, db } from './db.js';
import { hashPassword } from './accounts.js';
import { getSummary } from './stats.js';

/**
 * Công cụ quản trị tài khoản cho thầy cô / người quản lý trang web:
 *   npm run tai-khoan -- danh-sach
 *   npm run tai-khoan -- doi-mat-khau <tên đăng nhập>   (khi học sinh quên mật khẩu)
 * Dữ liệu ở đâu thì công cụ đọc ở đó: file trong thư mục data/, hoặc Turso nếu .env có TURSO_DATABASE_URL.
 */

const [cmd, name] = process.argv.slice(2);

if (cmd === 'danh-sach') {
  const rows = await db.all(
    `SELECT u.username, u.display_name, u.created_at, p.data
     FROM users u LEFT JOIN progress p ON p.user_id = u.id ORDER BY u.created_at`,
  );
  console.log(`Dữ liệu: ${dataLocation()}`);
  console.log(`Có ${rows.length} tài khoản.`);
  for (const r of rows) {
    let learned = 0;
    try {
      learned = Object.keys(JSON.parse(r.data || '{}').learned || {}).length;
    } catch {
      /* bỏ qua */
    }
    const created = new Date(Number(r.created_at)).toLocaleDateString('vi-VN');
    console.log(`- ${r.username} (${r.display_name}) — tạo ngày ${created}, đã học ${learned} sự kiện`);
  }
} else if (cmd === 'doi-mat-khau' && name) {
  const user = await db.get('SELECT id, username FROM users WHERE username = ?', name.trim().toLowerCase());
  if (!user) {
    console.error(`Không tìm thấy tài khoản "${name}".`);
    process.exit(1);
  }
  // Mật khẩu tạm 10 ký tự, bỏ các ký tự dễ nhầm (0/O, 1/l/I)
  const alphabet = 'abcdefghijkmnpqrstuvwxyz23456789';
  const temp = Array.from(crypto.randomBytes(10), (b) => alphabet[b % alphabet.length]).join('');
  await db.batch([
    ['UPDATE users SET password_hash = ? WHERE id = ?', await hashPassword(temp), user.id],
    ['DELETE FROM sessions WHERE user_id = ?', user.id],
  ]);
  console.log(`Đã đặt mật khẩu tạm cho "${user.username}": ${temp}`);
  console.log('Hãy đưa mật khẩu này cho học sinh và nhắc đổi mật khẩu mới trong trang Tài khoản.');
} else if (cmd === 'thong-ke') {
  const s = await getSummary();
  const n = (x) => x.toLocaleString('vi-VN');
  const d = (day) => day.split('-').reverse().join('/');
  console.log(`Dữ liệu: ${dataLocation()}`);
  console.log(`Thống kê lượt truy cập (giờ Việt Nam)${s.since ? `, bắt đầu đếm từ ${d(s.since)}` : ''}:`);
  console.log(`  Hôm nay (${d(s.today)}): ${n(s.totals.today.views)} lượt xem, ${n(s.totals.today.visitors)} người xem`);
  console.log(`  7 ngày qua:   ${n(s.totals.week.views)} lượt xem, ${n(s.totals.week.visitors)} lượt người xem (cộng theo ngày)`);
  console.log(`  30 ngày qua:  ${n(s.totals.month.views)} lượt xem, ${n(s.totals.month.visitors)} lượt người xem (cộng theo ngày)`);
  console.log(`  Từ trước tới nay: ${n(s.totals.allViews)} lượt xem`);
  console.log(`  Tài khoản: ${n(s.accounts.total)} (mới trong 7 ngày: ${n(s.accounts.newThisWeek)})`);
  console.log('\nTừng ngày (14 ngày gần nhất):');
  for (const x of s.series.slice(-14)) console.log(`  ${d(x.day)}  ${String(x.views).padStart(6)} lượt xem  ${String(x.visitors).padStart(5)} người`);
  console.log('\nTrang được xem nhiều nhất (30 ngày):');
  if (!s.topPages.length) console.log('  (chưa có lượt xem nào)');
  for (const p of s.topPages) console.log(`  ${String(p.views).padStart(6)}  ${p.name}`);
} else {
  console.log('Cách dùng:');
  console.log('  npm run tai-khoan -- danh-sach');
  console.log('  npm run tai-khoan -- doi-mat-khau <tên đăng nhập>');
  console.log('  npm run tai-khoan -- thong-ke        (lượt truy cập web)');
  process.exit(cmd ? 1 : 0);
}

// Đóng kết nối cơ sở dữ liệu (nhất là Turso) để công cụ thoát ngay
process.exit(0);
