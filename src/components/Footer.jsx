import { Link } from 'react-router-dom';
import Logo from './Logo.jsx';

export default function Footer() {
  const year = new Date().getFullYear();
  return (
    <footer className="footer">
      <div className="container footer-grid">
        <div className="footer-about">
          <Link to="/" className="footer-brand">
            <Logo size={44} />
            <span>Dòng chảy lịch sử</span>
          </Link>
          <p>
            Trang web học lịch sử Việt Nam qua cuộn phim tư liệu, video và mô hình 3D có thể tương tác. Nội dung
            biên soạn theo sách giáo khoa Lịch sử của Bộ Giáo dục và Đào tạo.
          </p>
          <blockquote className="footer-quote">
            “Dân ta phải biết sử ta,
            <br />
            Cho tường gốc tích nước nhà Việt Nam.”
            <cite>Hồ Chí Minh, “Lịch sử nước ta” (1942)</cite>
          </blockquote>
        </div>

        <nav className="footer-col" aria-label="Học tập">
          <h2>Học tập</h2>
          <Link to="/hoc-tap/viet-nam">Lịch sử Việt Nam</Link>
          <Link to="/hoc-tap/the-gioi">Lịch sử thế giới</Link>
          <Link to="/muc-luc">Mục lục tiến trình</Link>
          <Link to="/ban-do">Bản đồ sự kiện</Link>
        </nav>

        <nav className="footer-col" aria-label="Về trang web">
          <h2>Về trang web</h2>
          <Link to="/tong-quan">Tổng quan</Link>
          <Link to="/gioi-thieu">Giới thiệu lịch sử</Link>
          <Link to="/giang-vien-ai">Giảng viên AI</Link>
        </nav>

        <div className="footer-col">
          <h2>Nguồn tư liệu</h2>
          <p>Sách giáo khoa Lịch sử (Bộ GD&amp;ĐT)</p>
          <p>Đại Việt sử ký toàn thư</p>
          <p>
            Ảnh:{' '}
            <a href="https://commons.wikimedia.org" target="_blank" rel="noreferrer">
              Wikimedia Commons
            </a>{' '}
            — ghi tác giả tại từng ảnh
          </p>
          <p>Video: các kênh YouTube ghi tại từng video</p>
        </div>
      </div>
      <div className="container footer-bottom">
        <p>© {year} Dòng chảy lịch sử. Dự án học tập phi lợi nhuận.</p>
        <p>Bản đồ thể hiện đầy đủ chủ quyền của Việt Nam đối với quần đảo Hoàng Sa và Trường Sa.</p>
      </div>
    </footer>
  );
}
