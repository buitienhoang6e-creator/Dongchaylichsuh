import { Link } from 'react-router-dom';
import { BookOpenCheck, Box, Film, Map, MessageCircle, PlayCircle } from 'lucide-react';
import { EVENTS } from '../data/events.js';

const FEATURES = [
  {
    icon: Film,
    title: 'Cuộn phim lịch sử',
    text: `${EVENTS.length} sự kiện, từ thời nguyên thủy đến công cuộc Đổi mới, xếp thành các khung phim theo đúng tiến trình. Kéo, vuốt hoặc dùng phím mũi tên để đi qua.`,
  },
  {
    icon: PlayCircle,
    title: 'Video lịch sử',
    text: 'Video tiếng Việt từ các kênh như Truyền hình Quốc phòng, ANTV, Bảo tàng Hồ Chí Minh, EZ Sử. Mỗi video ghi rõ cách kiểm chứng.',
  },
  {
    icon: Box,
    title: 'Mô phỏng 3D',
    text: 'Đi tiến, lùi, sang trái, sang phải và phóng to trong thành Cổ Loa và đàn thề Hát Môn. Bấm vào điểm sáng để đọc chú thích.',
  },
  {
    icon: BookOpenCheck,
    title: 'Trắc nghiệm và tiến độ',
    text: 'Năm câu hỏi cho mỗi sự kiện, chấm ngay. Tiến độ lưu trên trình duyệt của bạn, không cần đăng nhập.',
  },
  {
    icon: Map,
    title: 'Bản đồ sự kiện',
    text: 'Bản đồ Việt Nam đánh dấu nơi diễn ra từng sự kiện, thể hiện đầy đủ quần đảo Hoàng Sa và Trường Sa.',
  },
  {
    icon: MessageCircle,
    title: 'Giảng viên AI',
    text: 'Hỏi bất cứ điều gì về lịch sử Việt Nam. Giảng viên AI dùng mô hình ngôn ngữ lớn (qua Groq), trả lời bằng tiếng Việt.',
  },
];

export default function Overview() {
  return (
    <div className="page">
      <div className="container">
        <header className="page-head">
          <p className="crumbs">
            <Link to="/">Trang chủ</Link> / <span>Tổng quan</span>
          </p>
          <h1>Về trang web Dòng chảy lịch sử</h1>
          <p className="page-lead">
            Một trang web học lịch sử Việt Nam dành cho học sinh, nơi mỗi sự kiện có thể được xem, nghe, bước vào và
            tự kiểm tra. Phiên bản thử nghiệm gồm {EVENTS.length} sự kiện, hai mô phỏng 3D và giảng viên AI.
          </p>
        </header>

        <section className="overview-goal">
          <h2>Mục tiêu</h2>
          <p>
            Môn Lịch sử thường bị xem là môn “học thuộc”. Chúng tôi muốn người học thấy được không gian, con người và
            lựa chọn đằng sau mỗi mốc năm. Khi hiểu vì sao Ngô Quyền chờ nước triều rút, hay vì sao An Dương Vương xây
            thành theo nhiều vòng, các con số sẽ tự nằm lại trong trí nhớ.
          </p>
        </section>

        <section className="section-tight">
          <h2 className="h-section">Trang web có gì</h2>
          <ul className="features">
            {FEATURES.map(({ icon: Icon, title, text }) => (
              <li key={title} className="feature">
                <Icon size={26} aria-hidden="true" className="feature-icon" />
                <h3>{title}</h3>
                <p>{text}</p>
              </li>
            ))}
          </ul>
        </section>

        <section className="section-tight sources">
          <h2 className="h-section">Nguồn tư liệu và cách kiểm chứng</h2>
          <div className="sources-grid">
            <div>
              <h3>Nội dung chữ</h3>
              <p>
                Biên soạn theo sách giáo khoa Lịch sử của Bộ Giáo dục và Đào tạo, đối chiếu với Đại Việt sử ký toàn thư.
                Năm tháng ghi theo cách phổ biến trong sách giáo khoa.
              </p>
            </div>
            <div>
              <h3>Video</h3>
              <p>
                Mỗi video đã được mở bản chép lời trên YouTube và đối chiếu các mốc chính với sách giáo khoa. Video của
                cơ quan nhà nước không có bản chép lời được ghi là “nguồn chính thống”. Chỗ nào video lệch sách giáo
                khoa đều có ghi chú ngay dưới video.
              </p>
            </div>
            <div>
              <h3>Hình ảnh</h3>
              <p>
                Ảnh tư liệu lấy từ Wikimedia Commons với giấy phép tự do (phạm vi công cộng, CC0, CC BY, CC BY-SA). Tác
                giả và giấy phép ghi ngay dưới từng ảnh.
              </p>
            </div>
            <div>
              <h3>Công nghệ</h3>
              <p>
                Máy chủ Node.js (Express), giao diện React, mô phỏng 3D bằng Three.js, giảng viên AI gọi mô hình ngôn ngữ lớn qua Groq API (có thể chuyển sang Claude API).
                Mã nguồn lưu trên GitHub, triển khai trên Hostinger.
              </p>
            </div>
          </div>
        </section>

        <div className="overview-cta">
          <Link to="/hoc-tap" className="btn btn-primary btn-lg">
            Bắt đầu học
          </Link>
          <Link to="/gioi-thieu" className="btn btn-ghost btn-lg">
            Đọc giới thiệu lịch sử
          </Link>
        </div>
      </div>
    </div>
  );
}
