import { useCallback, useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { EVENTS, PERIODS } from '../data/events.js';
import FilmReel from '../components/FilmReel.jsx';
import VideoModal from '../components/VideoModal.jsx';
import MapExplorer from '../components/MapExplorer.jsx';
import { useProgress } from '../lib/progress.jsx';

export default function VietnamHistory() {
  const [videoEvent, setVideoEvent] = useState(null);
  const closeVideo = useCallback(() => setVideoEvent(null), []);
  const { learnedCount } = useProgress();
  const [params, setParams] = useSearchParams();
  const startSlug = params.get('su-kien');
  const initialIndex = useMemo(() => Math.max(0, EVENTS.findIndex((e) => e.slug === startSlug)), [startSlug]);
  const pct = Math.round((learnedCount / EVENTS.length) * 100);

  const jumpToPeriod = (periodId) => {
    const ev = EVENTS.find((e) => e.periodId === periodId);
    if (ev) setParams({ 'su-kien': ev.slug }, { replace: true });
  };

  return (
    <div className="page page-reel">
      <div className="container">
        <header className="page-head reel-head">
          <div>
            <p className="crumbs">
              <Link to="/">Trang chủ</Link> / <Link to="/hoc-tap">Học tập</Link> / <span>Lịch sử Việt Nam</span>
            </p>
            <h1>Lịch sử Việt Nam</h1>
            <p className="page-lead">
              Kéo cuộn phim hoặc dùng phím mũi tên để đi qua từng sự kiện. Mỗi khung có video lịch sử và mô phỏng 3D.
            </p>
          </div>
          <div className="reel-progress">
            <div className="meter" role="progressbar" aria-valuemin={0} aria-valuemax={EVENTS.length} aria-valuenow={learnedCount} aria-label="Số sự kiện đã học">
              <span style={{ width: `${pct}%` }} />
            </div>
            <p>
              Đã học <strong>{learnedCount}</strong>/{EVENTS.length} sự kiện
            </p>
          </div>
        </header>

        <nav className="period-chips" aria-label="Chuyển nhanh tới thời kỳ">
          {PERIODS.map((p) => (
            <button key={p.id} type="button" className="chip" onClick={() => jumpToPeriod(p.id)}>
              {p.short}
            </button>
          ))}
        </nav>
      </div>

      <FilmReel key={initialIndex} events={EVENTS} onPlayVideo={setVideoEvent} initialIndex={initialIndex} />

      <section className="section">
        <div className="container">
          <div className="section-head">
            <h2>Các sự kiện trên bản đồ</h2>
            <p>Mỗi số trên bản đồ ứng với một khung phim.</p>
          </div>
          <MapExplorer onPlayVideo={setVideoEvent} />
        </div>
      </section>

      <VideoModal event={videoEvent} onClose={closeVideo} />
    </div>
  );
}
