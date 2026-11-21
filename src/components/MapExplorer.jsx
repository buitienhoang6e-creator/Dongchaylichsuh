import { useState } from 'react';
import { Link } from 'react-router-dom';
import { MapPin, Play } from 'lucide-react';
import VietnamMap from './VietnamMap.jsx';
import EventImage from './EventImage.jsx';
import { EVENTS, getEventBySlug } from '../data/events.js';

export default function MapExplorer({ onPlayVideo, initial = EVENTS[0].slug }) {
  const [active, setActive] = useState(initial);
  const ev = getEventBySlug(active);

  return (
    <div className="map-explorer">
      <div className="map-explorer-map">
        <VietnamMap events={EVENTS} activeSlug={active} onSelect={setActive} />
        <p className="map-hint">
          Bấm vào số trên bản đồ hoặc chọn trong danh sách để xem sự kiện. Bấm “Miền Bắc”, nút + hoặc chụm hai ngón để phóng to, kéo để di chuyển bản đồ.
        </p>
      </div>

      <div className="map-explorer-side">
        <article className="map-card" aria-live="polite">
          <EventImage event={ev} className="map-card-img" sizes="(max-width: 760px) 92vw, 460px" />
          <div className="map-card-body">
            <p className="map-card-time">{ev.time}</p>
            <h3>{ev.title}</h3>
            <p className="map-card-places">
              <MapPin size={15} aria-hidden="true" />
              {ev.places.map((p) => p.name).join(', ')}
            </p>
            <p className="map-card-summary">{ev.summary}</p>
            <div className="map-card-actions">
              <Link to={`/su-kien/${ev.slug}`} className="btn btn-primary btn-sm">
                Xem sự kiện
              </Link>
              {onPlayVideo && ev.videos.length > 0 && (
                <button type="button" className="btn btn-ghost btn-sm" onClick={() => onPlayVideo(ev)}>
                  <Play size={15} aria-hidden="true" /> Video
                </button>
              )}
            </div>
          </div>
        </article>

        <ol className="map-list">
          {EVENTS.map((e) => (
            <li key={e.slug}>
              <button
                type="button"
                className={`map-list-item ${e.slug === active ? 'is-active' : ''}`}
                onClick={() => setActive(e.slug)}
                aria-pressed={e.slug === active}
              >
                <span className="map-list-num">{e.id}</span>
                <span className="map-list-text">
                  <span className="map-list-title">{e.shortTitle}</span>
                  <span className="map-list-place">{e.places[0].name}</span>
                </span>
              </button>
            </li>
          ))}
        </ol>
      </div>
    </div>
  );
}
