import { Link } from 'react-router-dom';
import { Clock } from 'lucide-react';

const PLANNED = [
  { name: 'Các nền văn minh cổ đại', note: 'Ai Cập, Lưỡng Hà, Ấn Độ, Trung Hoa, Hy Lạp, La Mã' },
  { name: 'Văn minh Đông Nam Á', note: 'Vương quốc Phù Nam, Chăm-pa, Ăng-co' },
  { name: 'Các cuộc cách mạng tư sản', note: 'Cách mạng Anh, Chiến tranh giành độc lập ở Bắc Mỹ, Cách mạng Pháp' },
  { name: 'Cách mạng công nghiệp', note: 'Từ máy hơi nước đến điện và dây chuyền sản xuất' },
  { name: 'Hai cuộc chiến tranh thế giới', note: '1914 – 1918 và 1939 – 1945' },
  { name: 'Thế giới sau năm 1945', note: 'Chiến tranh lạnh, phong trào giải phóng dân tộc, ASEAN' },
];

export default function WorldHistory() {
  return (
    <div className="page">
      <div className="container narrow">
        <header className="page-head">
          <p className="crumbs">
            <Link to="/">Trang chủ</Link> / <Link to="/hoc-tap">Học tập</Link> / <span>Lịch sử Thế giới</span>
          </p>
          <span className="badge badge-pending">
            <Clock size={14} aria-hidden="true" /> Đang cập nhật
          </span>
          <h1>Lịch sử Thế giới</h1>
          <p className="page-lead">
            Phần này đang được biên soạn. Trong phiên bản thử nghiệm, mời bạn học phần lịch sử Việt Nam trước. Dưới đây
            là các chủ đề dự kiến.
          </p>
        </header>

        <ol className="planned-list">
          {PLANNED.map((p) => (
            <li key={p.name}>
              <h2>{p.name}</h2>
              <p>{p.note}</p>
            </li>
          ))}
        </ol>

        <Link to="/hoc-tap/viet-nam" className="btn btn-primary">
          Học lịch sử Việt Nam
        </Link>
      </div>
    </div>
  );
}
