import { Link } from 'react-router-dom';

export default function NotFound() {
  return (
    <div className="page">
      <div className="container narrow not-found">
        <p className="not-found-code">404</p>
        <h1>Trang này không có trong cuộn phim</h1>
        <p className="page-lead">Đường dẫn có thể đã sai hoặc trang đã được chuyển đi.</p>
        <div className="hero-actions">
          <Link to="/" className="btn btn-primary">
            Về trang chủ
          </Link>
          <Link to="/muc-luc" className="btn btn-ghost">
            Xem mục lục
          </Link>
        </div>
      </div>
    </div>
  );
}
