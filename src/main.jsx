import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App.jsx';
import { AuthProvider } from './lib/auth.jsx';
import { ProgressProvider } from './lib/progress.jsx';
import './styles/tokens.css';
import './styles/base.css';
import './styles/components.css';
import './styles/pages.css';
import './styles/motion.css';

// Sau khi trang web được cập nhật (build lại), trang đang mở có thể không tìm thấy file cảnh 3D cũ.
// Khi đó tự tải lại trang một lần để lấy bản mới (tránh lặp vô hạn bằng mốc thời gian).
window.addEventListener('vite:preloadError', (e) => {
  try {
    const last = Number(sessionStorage.getItem('dcls-reload') || 0);
    if (Date.now() - last < 15000) return;
    sessionStorage.setItem('dcls-reload', String(Date.now()));
  } catch {
    /* bỏ qua nếu trình duyệt chặn sessionStorage */
  }
  e.preventDefault();
  window.location.reload();
});

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <ProgressProvider>
          <App />
        </ProgressProvider>
      </AuthProvider>
    </BrowserRouter>
  </React.StrictMode>,
);
