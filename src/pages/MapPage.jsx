import { useCallback, useState } from 'react';
import { Link } from 'react-router-dom';
import MapExplorer from '../components/MapExplorer.jsx';
import VideoModal from '../components/VideoModal.jsx';

export default function MapPage() {
  const [videoEvent, setVideoEvent] = useState(null);
  const closeVideo = useCallback(() => setVideoEvent(null), []);
  return (
    <div className="page">
      <div className="container">
        <header className="page-head">
          <p className="crumbs">
            <Link to="/">Trang chủ</Link> / <span>Bản đồ sự kiện</span>
          </p>
          <h1>Bản đồ các sự kiện lịch sử</h1>
          <p className="page-lead">
            Mỗi số trên bản đồ là một sự kiện trong cuộn phim. Ở miền Bắc, các sự kiện nằm gần nhau nên điểm đánh dấu
            được dàn ra và nối về đúng vị trí bằng đường mảnh.
          </p>
        </header>
        <MapExplorer onPlayVideo={setVideoEvent} />
      </div>
      <VideoModal event={videoEvent} onClose={closeVideo} />
    </div>
  );
}
