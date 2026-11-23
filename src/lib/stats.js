/**
 * Báo cho máy chủ biết có một lượt xem trang (xem server/stats.js).
 * Không dùng cookie, không gửi gì ngoài đường dẫn trang đang xem.
 * Trình duyệt bật "Do Not Track" hoặc "Global Privacy Control" thì không gửi.
 */
let last = { path: null, at: 0 };

export function trackView(path) {
  try {
    if (navigator.doNotTrack === '1' || navigator.globalPrivacyControl) return;
    if (path === '/thong-ke') return;
    // Bỏ qua lượt lặp lại ngay lập tức (React chạy hiệu ứng hai lần khi phát triển)
    const now = Date.now();
    if (last.path === path && now - last.at < 1500) return;
    last = { path, at: now };
    fetch('/api/stats/view', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ path }),
      keepalive: true,
    }).catch(() => {});
  } catch {
    /* không đếm được thì thôi, không ảnh hưởng người học */
  }
}
