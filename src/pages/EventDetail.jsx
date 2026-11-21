import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, ArrowRight, Box, Check, MapPin, MessageCircle } from 'lucide-react';
import { EVENTS, getEventBySlug } from '../data/events.js';
import EventImage from '../components/EventImage.jsx';
import QuizBlock from '../components/QuizBlock.jsx';
import { VideoInfo, VideoPlayer } from '../components/VideoPlayer.jsx';
import { useProgress } from '../lib/progress.jsx';
import NotFound from './NotFound.jsx';
import { useEffect, useState } from 'react';

export default function EventDetail() {
  const { slug } = useParams();
  const ev = getEventBySlug(slug);
  const { isLearned, setLearned } = useProgress();
  const [videoTab, setVideoTab] = useState(0);

  useEffect(() => setVideoTab(0), [slug]);

  if (!ev) return <NotFound />;
  const i = EVENTS.indexOf(ev);
  const prev = EVENTS[i - 1];
  const next = EVENTS[i + 1];
  const learned = isLearned(ev.slug);
  const video = ev.videos[videoTab] || ev.videos[0];

  return (
    <article className="page event-page" key={ev.slug}>
      <div className="container">
        <p className="crumbs">
          <Link to="/">Trang chủ</Link> / <Link to="/hoc-tap/viet-nam">Lịch sử Việt Nam</Link> /{' '}
          <span>{ev.shortTitle}</span>
        </p>

        <header className="event-hero">
          <div className="event-hero-text">
            <p className="event-frame-no">
              Khung {String(ev.id).padStart(2, '0')} / {EVENTS.length}
            </p>
            <p className="event-time">{ev.time}</p>
            <h1>{ev.title}</h1>
            <p className="event-period">{ev.period}</p>
            <p className="event-summary">{ev.summary}</p>
            <div className="event-actions">
              <a href="#video" className="btn btn-primary">
                Xem video lịch sử
              </a>
              {ev.sim3d ? (
                <Link to={`/mo-phong/${ev.slug}`} className="btn btn-gold">
                  <Box size={17} aria-hidden="true" /> Xem mô phỏng 3D
                </Link>
              ) : (
                <span className="btn btn-ghost is-disabled" aria-disabled="true">
                  <Box size={17} aria-hidden="true" /> Mô phỏng 3D đang cập nhật
                </span>
              )}
              <button
                type="button"
                className={`btn ${learned ? 'btn-learned' : 'btn-ghost'}`}
                onClick={() => setLearned(ev.slug, !learned)}
                aria-pressed={learned}
              >
                <Check size={17} aria-hidden="true" /> {learned ? 'Đã học' : 'Đánh dấu đã học'}
              </button>
            </div>
          </div>
          <EventImage event={ev} className="event-hero-img" eager sizes="(max-width: 900px) 92vw, 560px" />
        </header>

        <div className="event-layout">
          <div className="event-main">
            <section className="prose">
              <h2>Bối cảnh</h2>
              <p>{ev.context}</p>
            </section>

            <section className="prose">
              <h2>Diễn biến</h2>
              <ol className="timeline">
                {ev.timeline.map((t) => (
                  <li key={t.when + t.text.slice(0, 12)}>
                    <p className="timeline-when">{t.when}</p>
                    <p>{t.text}</p>
                  </li>
                ))}
              </ol>
            </section>

            <section className="prose two-col">
              <div>
                <h2>Kết quả</h2>
                <p>{ev.result}</p>
              </div>
              <div>
                <h2>Ý nghĩa</h2>
                <p>{ev.significance}</p>
              </div>
            </section>

            <section id="video" className="event-video">
              <h2>Video lịch sử</h2>
              {ev.videos.length > 1 && (
                <div className="modal-tabs" role="tablist" aria-label="Chọn video">
                  {ev.videos.map((v, k) => (
                    <button
                      key={v.youtubeId}
                      type="button"
                      role="tab"
                      aria-selected={videoTab === k}
                      className={`tab ${videoTab === k ? 'is-active' : ''}`}
                      onClick={() => setVideoTab(k)}
                    >
                      Video {k + 1}: {v.channel.split(' — ')[0]}
                    </button>
                  ))}
                </div>
              )}
              {video ? (
                <>
                  <VideoPlayer video={video} />
                  <VideoInfo video={video} />
                </>
              ) : (
                <p className="empty-note">Video đang được cập nhật.</p>
              )}
            </section>

            <QuizBlock event={ev} />
          </div>

          <aside className="event-aside">
            <section className="aside-box">
              <h2>Nhân vật tiêu biểu</h2>
              <ul className="figures">
                {ev.figures.map((f) => (
                  <li key={f.name}>
                    <strong>{f.name}</strong>
                    <span>{f.role}</span>
                  </li>
                ))}
              </ul>
            </section>
            <section className="aside-box">
              <h2>Địa danh</h2>
              <ul className="places">
                {ev.places.map((p) => (
                  <li key={p.name}>
                    <MapPin size={15} aria-hidden="true" /> {p.name}
                  </li>
                ))}
              </ul>
              <Link to="/ban-do" className="link-arrow">
                Xem trên bản đồ
              </Link>
            </section>
            {ev.facts?.length > 0 && (
              <section className="aside-box aside-facts">
                <h2>Có thể bạn chưa biết</h2>
                {ev.facts.map((f) => (
                  <p key={f}>{f}</p>
                ))}
              </section>
            )}
            <Link to={`/giang-vien-ai?su-kien=${ev.slug}`} className="aside-ai">
              <MessageCircle size={20} aria-hidden="true" />
              <span>
                <strong>Hỏi giảng viên AI</strong>
                <span>về sự kiện này</span>
              </span>
            </Link>
          </aside>
        </div>

        <nav className="event-nav" aria-label="Sự kiện trước và sau">
          {prev ? (
            <Link to={`/su-kien/${prev.slug}`} className="event-nav-link">
              <ArrowLeft size={18} aria-hidden="true" />
              <span>
                <small>Sự kiện trước</small>
                {prev.title}
              </span>
            </Link>
          ) : (
            <span />
          )}
          {next ? (
            <Link to={`/su-kien/${next.slug}`} className="event-nav-link is-next">
              <span>
                <small>Sự kiện tiếp theo</small>
                {next.title}
              </span>
              <ArrowRight size={18} aria-hidden="true" />
            </Link>
          ) : (
            <Link to="/muc-luc" className="event-nav-link is-next">
              <span>
                <small>Bạn đã đi hết cuộn phim</small>
                Xem lại mục lục tiến trình
              </span>
              <ArrowRight size={18} aria-hidden="true" />
            </Link>
          )}
        </nav>
      </div>
    </article>
  );
}
