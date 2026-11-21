import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { X } from 'lucide-react';
import { VideoInfo, VideoPlayer } from './VideoPlayer.jsx';

/** Hộp thoại xem video của một sự kiện (có thể có nhiều video). */
export default function VideoModal({ event, onClose }) {
  const [tab, setTab] = useState(0);
  const closeRef = useRef(null);
  const lastFocus = useRef(null);

  useEffect(() => {
    setTab(0);
  }, [event?.slug]);

  useEffect(() => {
    if (!event) return undefined;
    lastFocus.current = document.activeElement;
    closeRef.current?.focus();
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const onKey = (e) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = prevOverflow;
      window.removeEventListener('keydown', onKey);
      lastFocus.current?.focus?.();
    };
  }, [event, onClose]);

  if (!event) return null;
  const videos = event.videos || [];
  const video = videos[tab];

  return (
    <div className="modal-backdrop" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal" role="dialog" aria-modal="true" aria-labelledby="video-modal-title">
        <div className="modal-head">
          <div>
            <p className="modal-kicker">{event.time}</p>
            <h2 id="video-modal-title">{event.title}</h2>
          </div>
          <button ref={closeRef} type="button" className="icon-btn" onClick={onClose} aria-label="Đóng video">
            <X size={22} />
          </button>
        </div>

        {videos.length > 1 && (
          <div className="modal-tabs" role="tablist" aria-label="Chọn video">
            {videos.map((v, i) => (
              <button
                key={v.youtubeId}
                type="button"
                role="tab"
                aria-selected={tab === i}
                className={`tab ${tab === i ? 'is-active' : ''}`}
                onClick={() => setTab(i)}
              >
                Video {i + 1}: {v.channel.split(' — ')[0]}
              </button>
            ))}
          </div>
        )}

        {video ? (
          <>
            <VideoPlayer video={video} autoPlay />
            <VideoInfo video={video} />
          </>
        ) : (
          <p className="empty-note">Video cho sự kiện này đang được cập nhật.</p>
        )}

        <div className="modal-foot">
          <Link to={`/su-kien/${event.slug}`} className="btn btn-ghost" onClick={onClose}>
            Đọc nội dung chi tiết
          </Link>
        </div>
      </div>
    </div>
  );
}
