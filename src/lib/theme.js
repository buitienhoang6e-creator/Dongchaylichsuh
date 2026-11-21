import { useCallback, useEffect, useState } from 'react';

/**
 * CHẾ ĐỘ SÁNG / TỐI
 * - Lần đầu vào trang: theo cài đặt của máy (điện thoại, máy tính đang để giao diện tối thì trang cũng tối).
 * - Bấm nút trên thanh menu: đổi chế độ và ghi nhớ cho các lần sau (lưu trong trình duyệt).
 * Thuộc tính data-theme trên thẻ <html> quyết định bảng màu (xem src/styles/tokens.css).
 */
const KEY = 'dcls-theme';

const stored = () => {
  try {
    const v = localStorage.getItem(KEY);
    return v === 'dark' || v === 'light' ? v : null;
  } catch {
    return null;
  }
};
const systemTheme = () => (window.matchMedia?.('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');

function apply(theme, animate) {
  const root = document.documentElement;
  if (animate && !window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) {
    root.classList.add('theme-anim');
    window.setTimeout(() => root.classList.remove('theme-anim'), 400);
  }
  root.setAttribute('data-theme', theme);
}

export function useTheme() {
  const [theme, setTheme] = useState(() => {
    const cur = document.documentElement.getAttribute('data-theme');
    if (cur === 'dark' || cur === 'light') return cur;
    // dự phòng nếu file theme-init.js không chạy được
    const t = stored() || systemTheme();
    apply(t, false);
    return t;
  });

  // Chưa tự chọn thì đổi theo máy khi máy đổi giao diện sáng/tối
  useEffect(() => {
    const mq = window.matchMedia?.('(prefers-color-scheme: dark)');
    if (!mq) return undefined;
    const onChange = (e) => {
      if (stored()) return;
      const t = e.matches ? 'dark' : 'light';
      apply(t, true);
      setTheme(t);
    };
    mq.addEventListener?.('change', onChange);
    return () => mq.removeEventListener?.('change', onChange);
  }, []);

  const toggle = useCallback(() => {
    setTheme((cur) => {
      const next = cur === 'dark' ? 'light' : 'dark';
      apply(next, true);
      try {
        localStorage.setItem(KEY, next);
      } catch {
        /* trình duyệt chặn lưu trữ: vẫn đổi màu trong lần xem này */
      }
      return next;
    });
  }, []);

  return [theme, toggle];
}
