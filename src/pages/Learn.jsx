import { Link } from 'react-router-dom';
import { Clock } from 'lucide-react';
import { EVENTS } from '../data/events.js';
import { useProgress } from '../lib/progress.jsx';

export default function Learn() {
  const { learnedCount } = useProgress();
  const pct = Math.round((learnedCount / EVENTS.length) * 100);

  return (
    <div className="page">
      <div className="container">
        <header className="page-head">
          <p className="crumbs">
            <Link to="/">Trang chủ</Link> / <span>Học tập</span>
          </p>
          <h1>Chọn phần lịch sử bạn muốn học</h1>
          <p className="page-lead">
            Phiên bản thử nghiệm tập trung vào lịch sử Việt Nam. Phần lịch sử thế giới đang được biên soạn.
          </p>
        </header>

        <div className="learn-grid">
          <Link to="/hoc-tap/viet-nam" className="learn-panel learn-panel-vn">
            <div className="learn-panel-media" aria-hidden="true">
              <img src="/images/events/trong-dong-1-sm.jpg" alt="" />
            </div>
            <div className="learn-panel-body">
              <h2>Lịch sử Việt Nam</h2>
              <p>
                {EVENTS.length} sự kiện từ thời nguyên thủy, dựng nước đến công cuộc Đổi mới và hội nhập quốc tế, trình
                bày dưới dạng cuộn phim.
              </p>
              <div className="learn-progress">
                <div className="meter" role="progressbar" aria-valuemin={0} aria-valuemax={EVENTS.length} aria-valuenow={learnedCount} aria-label="Tiến độ học lịch sử Việt Nam">
                  <span style={{ width: `${pct}%` }} />
                </div>
                <span>
                  Đã học {learnedCount}/{EVENTS.length} sự kiện
                </span>
              </div>
              <span className="btn btn-primary">{learnedCount ? 'Học tiếp' : 'Mở cuộn phim'}</span>
            </div>
          </Link>

          <Link to="/hoc-tap/the-gioi" className="learn-panel learn-panel-world is-pending">
            <div className="learn-panel-media" aria-hidden="true">
              <img src="/images/parchment-map.jpg" alt="" />
            </div>
            <div className="learn-panel-body">
              <span className="badge badge-pending">
                <Clock size={14} aria-hidden="true" /> Đang cập nhật
              </span>
              <h2>Lịch sử Thế giới</h2>
              <p>Các nền văn minh cổ đại, cách mạng tư sản, hai cuộc chiến tranh thế giới và trật tự thế giới hiện đại.</p>
              <span className="btn btn-ghost">Xem nội dung dự kiến</span>
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
}
