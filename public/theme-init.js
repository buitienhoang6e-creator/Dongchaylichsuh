// Chọn chế độ sáng/tối trước khi trang hiện ra (tránh nháy màu):
// theo lựa chọn đã lưu; nếu chưa chọn thì theo cài đặt sáng/tối của máy.
// (Để thành file riêng vì chính sách bảo mật CSP của máy chủ không cho chạy script viết thẳng trong trang.)
(function () {
  var t = 'light';
  try {
    var s = localStorage.getItem('dcls-theme');
    t = s === 'dark' || s === 'light' ? s : window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  } catch (e) {}
  document.documentElement.setAttribute('data-theme', t);
})();
