import { useCallback, useState } from 'react';
import { Link } from 'react-router-dom';
import { Box, Check, Cloud, Play, UserRound } from 'lucide-react';
import { EVENTS, PERIODS } from '../data/events.js';
import { useProgress } from '../lib/progress.jsx';
import VideoModal from '../components/VideoModal.jsx';

export default function TableOfContents() {
  const { isLearned, quiz, learnedCount, reset, account } = useProgress();
  const [videoEvent, setVideoEvent] = useState(null);
  const closeVideo = useCallback(() => setVideoEvent(null), []);

  return (
    <div className="page">
      <div className="container">
        <header className="page-head page-head-row">
          <div>
            <p className="crumbs">
              <Link to="/">Trang chủ</Link> / <span>Mục lục tiến trình</span>
            </p>
            <h1>Mục lục các tiến trình lịch sử</h1>
            <p className="page-lead">
              {EVENTS.length} sự kiện xếp theo tiến trình thời gian, chia vào {PERIODS.length} thời kỳ lớn. Bạn đã học{' '}
              {learnedCount}/{EVENTS.length} sự kiện.
            </p>
            <p className="progress-where">
              {account ? (
                <>
                  <Cloud size={16} aria-hidden="true" /> Tiến độ được lưu vào tài khoản <strong>{account.displayName}</strong>.
                </>
              ) : (
                <>
                  <UserRound size={16} aria-hidden="true" /> Tiến độ đang lưu trên trình duyệt này.{' '}
                  <Link to="/tai-khoan">Đăng nhập hoặc đăng ký</Link> để không bị mất và học tiếp trên máy khác.
                </>
              )}
            </p>
          </div>
          {learnedCount > 0 && (
            <button
              type="button"
              className="btn btn-ghost btn-sm"
              onClick={() => {
                const where = account ? `trong tài khoản ${account.displayName}` : 'trên trình duyệt này';
                if (window.confirm(`Xóa toàn bộ tiến độ học và điểm trắc nghiệm ${where}?`)) reset();
              }}
            >
              Xóa tiến độ
            </button>
          )}
        </header>

        {PERIODS.map((p) => {
          const list = EVENTS.filter((e) => e.periodId === p.id);
          if (!list.length) return null;
          return (
            <section key={p.id} className="toc-period" aria-labelledby={`toc-${p.id}`}>
              <div className="toc-period-head">
                <h2 id={`toc-${p.id}`}>{p.name}</h2>
                <p>{p.range}</p>
              </div>
              <ol className="toc-list">
                {list.map((e) => {
                  const learned = isLearned(e.slug);
                  const q = quiz[e.slug];
                  return (
                    <li key={e.slug} className={`toc-row ${learned ? 'is-learned' : ''}`}>
                      <span className="toc-num">{String(e.id).padStart(2, '0')}</span>
                      <div className="toc-main">
                        <p className="toc-time">{e.time}</p>
                        <Link to={`/su-kien/${e.slug}`} className="toc-title">
                          {e.title}
                        </Link>
                        <p className="toc-status">
                          {learned ? (
                            <span className="status-learned">
                              <Check size={14} aria-hidden="true" /> Đã học
                            </span>
                          ) : (
                            <span>Chưa học</span>
                          )}
                          {q && (
                            <span>
                              Trắc nghiệm: {q.best}/{q.total}
                            </span>
                          )}
                        </p>
                      </div>
                      <div className="toc-actions">
                        <button
                          type="button"
                          className="icon-btn"
                          onClick={() => setVideoEvent(e)}
                          aria-label={`Xem video: ${e.title}`}
                          title="Xem video"
                        >
                          <Play size={18} />
                        </button>
                        {e.sim3d ? (
                          <Link to={`/mo-phong/${e.slug}`} className="icon-btn is-gold" aria-label={`Mô phỏng 3D: ${e.title}`} title="Mô phỏng 3D">
                            <Box size={18} />
                          </Link>
                        ) : (
                          <span className="icon-btn is-disabled" title="Mô phỏng 3D đang cập nhật" aria-hidden="true">
                            <Box size={18} />
                          </span>
                        )}
                      </div>
                    </li>
                  );
                })}
              </ol>
            </section>
          );
        })}
      </div>
      <VideoModal event={videoEvent} onClose={closeVideo} />
    </div>
  );
}
