import { useCallback, useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { Box, Check, ChevronLeft, ChevronRight, Play } from 'lucide-react';
import EventImage from './EventImage.jsx';
import { useProgress } from '../lib/progress.jsx';

const pad = (n) => String(n).padStart(2, '0');
const prefersReduced = () =>
  typeof window !== 'undefined' && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;

/**
 * Cuộn phim lịch sử: mỗi sự kiện là một khung phim.
 * Điều khiển: nút trước/sau, phím ← →, kéo bằng chuột, vuốt trên điện thoại,
 * hoặc bấm vào mốc năm trên thanh niên đại bên dưới.
 */
export default function FilmReel({ events, onPlayVideo, initialIndex = 0 }) {
  const trackRef = useRef(null);
  const scrubRef = useRef(null);
  const [index, setIndex] = useState(initialIndex);
  // Nhiều sự kiện thì chỉ ghi năm ở một số mốc cho khỏi chồng chữ (mốc đang xem luôn có năm)
  const labelEvery = Math.max(1, Math.ceil(events.length / 12));
  const { isLearned } = useProgress();
  const drag = useRef(null);

  const goTo = useCallback((i, smooth = true) => {
    const track = trackRef.current;
    if (!track) return;
    const clamped = Math.max(0, Math.min(events.length - 1, i));
    const el = track.querySelector(`[data-frame="${clamped}"]`);
    if (!el) return;
    track.scrollTo({
      left: el.offsetLeft - (track.clientWidth - el.clientWidth) / 2,
      behavior: smooth && !prefersReduced() ? 'smooth' : 'auto',
    });
  }, [events.length]);

  // Xác định khung đang ở giữa màn hình
  useEffect(() => {
    const track = trackRef.current;
    if (!track) return undefined;
    let raf = 0;
    const update = () => {
      raf = 0;
      const center = track.scrollLeft + track.clientWidth / 2;
      let best = 0;
      let bestDist = Infinity;
      track.querySelectorAll('[data-frame]').forEach((el) => {
        const c = el.offsetLeft + el.clientWidth / 2;
        const d = Math.abs(c - center);
        if (d < bestDist) {
          bestDist = d;
          best = Number(el.dataset.frame);
        }
      });
      setIndex(best);
    };
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(update);
    };
    track.addEventListener('scroll', onScroll, { passive: true });
    update();
    return () => {
      track.removeEventListener('scroll', onScroll);
      if (raf) cancelAnimationFrame(raf);
    };
  }, [events]);

  useEffect(() => {
    if (initialIndex) goTo(initialIndex, false);
  }, [initialIndex, goTo]);

  // Thanh mốc thời gian dài hơn màn hình: tự cuộn để mốc đang xem nằm giữa
  useEffect(() => {
    const box = scrubRef.current;
    const dot = box?.querySelector(`[data-dot="${index}"]`);
    if (!box || !dot || box.scrollWidth <= box.clientWidth) return;
    box.scrollTo({
      left: dot.offsetLeft - (box.clientWidth - dot.offsetWidth) / 2,
      behavior: prefersReduced() ? 'auto' : 'smooth',
    });
  }, [index]);

  // Kéo cuộn phim bằng chuột
  const onPointerDown = (e) => {
    if (e.pointerType !== 'mouse' || e.button !== 0) return;
    if (e.target.closest('a, button')) return;
    drag.current = { x: e.clientX, left: trackRef.current.scrollLeft, moved: false };
    trackRef.current.classList.add('is-dragging');
  };
  const onPointerMove = (e) => {
    const d = drag.current;
    if (!d) return;
    const dx = e.clientX - d.x;
    if (Math.abs(dx) > 4) d.moved = true;
    trackRef.current.scrollLeft = d.left - dx;
  };
  const endDrag = () => {
    const d = drag.current;
    drag.current = null;
    trackRef.current?.classList.remove('is-dragging');
    if (d?.moved) goTo(index);
  };

  const onKeyDown = (e) => {
    if (e.key === 'ArrowRight') {
      e.preventDefault();
      goTo(index + 1);
    } else if (e.key === 'ArrowLeft') {
      e.preventDefault();
      goTo(index - 1);
    } else if (e.key === 'Home') {
      e.preventDefault();
      goTo(0);
    } else if (e.key === 'End') {
      e.preventDefault();
      goTo(events.length - 1);
    }
  };

  return (
    <div className="reel">
      <div className="reel-bar container">
        <p className="reel-counter" aria-live="polite">
          Khung <strong>{pad(index + 1)}</strong> / {pad(events.length)}
        </p>
        <div className="reel-nav">
          <button
            type="button"
            className="reel-btn"
            onClick={() => goTo(index - 1)}
            disabled={index === 0}
            aria-label="Sự kiện trước"
          >
            <ChevronLeft size={22} />
          </button>
          <button
            type="button"
            className="reel-btn"
            onClick={() => goTo(index + 1)}
            disabled={index === events.length - 1}
            aria-label="Sự kiện sau"
          >
            <ChevronRight size={22} />
          </button>
        </div>
      </div>

      <div className="reel-strip">
        <div
          ref={trackRef}
          className="reel-track"
          tabIndex={0}
          role="region"
          aria-roledescription="cuộn phim"
          aria-label="Cuộn phim các sự kiện lịch sử Việt Nam. Dùng phím mũi tên trái phải để chuyển khung."
          onKeyDown={onKeyDown}
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={endDrag}
          onPointerLeave={endDrag}
        >
          {events.map((e, i) => {
            const learned = isLearned(e.slug);
            return (
              <article
                key={e.slug}
                data-frame={i}
                className={`frame ${i === index ? 'is-active' : ''} ${learned ? 'is-learned' : ''}`}
                aria-label={`Khung ${i + 1}: ${e.title}, ${e.time}`}
              >
                <div className="frame-edge">
                  <span className="frame-no">{pad(i + 1)}</span>
                  <span className="frame-time">{e.time}</span>
                  {learned && (
                    <span className="frame-learned">
                      <Check size={14} aria-hidden="true" /> Đã học
                    </span>
                  )}
                </div>
                <div className="frame-shot">
                  <EventImage event={e} showCredit={false} sizes="(max-width: 760px) 84vw, 420px" />
                </div>
                <div className="frame-body">
                  <p className="frame-period">{e.period}</p>
                  <h3 className="frame-title">
                    <Link to={`/su-kien/${e.slug}`} draggable={false}>
                      {e.title}
                    </Link>
                  </h3>
                  <p className="frame-summary">{e.summary}</p>
                  <div className="frame-actions">
                    <button type="button" className="btn btn-film" onClick={() => onPlayVideo(e)}>
                      <Play size={16} aria-hidden="true" /> Xem video lịch sử
                    </button>
                    {e.sim3d ? (
                      <Link to={`/mo-phong/${e.slug}`} className="btn btn-film btn-film-gold" draggable={false}>
                        <Box size={16} aria-hidden="true" /> Xem mô phỏng 3D
                      </Link>
                    ) : (
                      <span className="btn btn-film is-disabled" title="Mô phỏng 3D của sự kiện này đang được xây dựng">
                        <Box size={16} aria-hidden="true" /> Mô phỏng 3D đang cập nhật
                      </span>
                    )}
                  </div>
                  <Link to={`/su-kien/${e.slug}`} className="frame-more" draggable={false}>
                    Đọc chi tiết và làm trắc nghiệm
                  </Link>
                </div>
              </article>
            );
          })}
        </div>
      </div>

      <div className="container scrubber-scroll" ref={scrubRef}>
        <ol className="scrubber" aria-label="Chọn nhanh theo mốc thời gian" style={{ '--n': events.length }}>
          {events.map((e, i) => (
            <li key={e.slug} className={i % labelEvery ? 'is-minor' : undefined}>
              <button
                type="button"
                data-dot={i}
                className={`scrubber-dot ${i === index ? 'is-active' : ''} ${isLearned(e.slug) ? 'is-learned' : ''}`}
                onClick={() => goTo(i)}
                aria-label={`${e.title} (${e.time})`}
                aria-current={i === index ? 'step' : undefined}
              >
                <span className="scrubber-year">{e.yearLabel}</span>
              </button>
            </li>
          ))}
        </ol>
      </div>
    </div>
  );
}
