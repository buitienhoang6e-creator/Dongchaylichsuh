import { useEffect, useMemo, useRef, useState } from 'react';
import { Maximize2, Minus, Plus } from 'lucide-react';
import { MAP, NEIGHBORS, VIETNAM_PATH, project } from '../data/vietnamMap.js';

// Vị trí gần đúng các đảo, đá chính (vĩ độ, kinh độ)
const HOANG_SA = [
  [16.83, 112.33], [16.53, 111.6], [16.45, 111.73], [15.78, 111.2], [16.67, 112.73],
  [16.97, 112.27], [16.28, 111.5], [16.05, 112.5], [16.95, 111.9],
];
const TRUONG_SA = [
  [11.43, 114.33], [11.05, 114.28], [10.38, 114.36], [10.18, 114.4], [9.88, 114.33],
  [8.64, 111.92], [8.95, 113.65], [8.15, 113.3], [7.88, 112.92], [9.9, 115.53],
  [10.7, 115.8], [9.3, 112.9], [8.85, 114.4],
];

const LABELS = [
  { text: 'TRUNG QUỐC', lat: 23.35, lon: 104.9, cls: 'is-country' },
  { text: 'LÀO', lat: 19.6, lon: 102.55, cls: 'is-country' },
  { text: 'CAM-PU-CHIA', lat: 12.75, lon: 104.0, cls: 'is-country' },
  { text: 'THÁI LAN', lat: 15.6, lon: 101.75, cls: 'is-country' },
  { text: 'Vịnh Bắc Bộ', lat: 19.75, lon: 107.95, cls: 'is-sea' },
  { text: 'Biển Đông', lat: 14.0, lon: 112.8, cls: 'is-sea is-big' },
  { text: 'Vịnh Thái Lan', lat: 9.7, lon: 102.6, cls: 'is-sea' },
  { text: 'Quần đảo Hoàng Sa', lat: 17.55, lon: 112.0, cls: 'is-island' },
  { text: '(Việt Nam)', lat: 17.15, lon: 112.0, cls: 'is-island is-small' },
  { text: 'Quần đảo Trường Sa', lat: 12.15, lon: 114.0, cls: 'is-island' },
  { text: '(Việt Nam)', lat: 11.75, lon: 114.0, cls: 'is-island is-small' },
];

const R = 12;
const FULL = { x: 0, y: 0, w: MAP.width, h: MAP.height };
const MAX_ZOOM = 5;

/** Dàn các điểm đánh dấu cho khỏi chồng lên nhau, rồi nối về vị trí thật. */
function relax(points) {
  const pos = points.map((p) => ({ ...p, x: p.ax, y: p.ay }));
  const min = R * 2 + 4;
  for (let it = 0; it < 160; it++) {
    for (let i = 0; i < pos.length; i++) {
      for (let j = i + 1; j < pos.length; j++) {
        let dx = pos[j].x - pos[i].x;
        let dy = pos[j].y - pos[i].y;
        let d = Math.hypot(dx, dy);
        if (d < 0.01) {
          const a = (i * 2.399 + j) % (Math.PI * 2);
          dx = Math.cos(a);
          dy = Math.sin(a);
          d = 1;
        }
        if (d < min) {
          const push = (min - d) / 2;
          const nx = dx / d;
          const ny = dy / d;
          pos[i].x -= nx * push;
          pos[i].y -= ny * push;
          pos[j].x += nx * push;
          pos[j].y += ny * push;
        }
      }
    }
    for (const p of pos) {
      p.x += (p.ax - p.x) * 0.03;
      p.y += (p.ay - p.y) * 0.03;
    }
  }
  return pos;
}

/** Giữ khung nhìn nằm trong bản đồ, tỉ lệ không vượt quá giới hạn phóng to. */
function clampView(v) {
  const w = Math.min(FULL.w, Math.max(FULL.w / MAX_ZOOM, v.w));
  const h = (w * FULL.h) / FULL.w;
  const x = Math.min(FULL.w - w, Math.max(0, v.x + (v.w - w) / 2));
  const y = Math.min(FULL.h - h, Math.max(0, v.y + (v.h - h) / 2));
  return { x, y, w, h };
}

export default function VietnamMap({ events, activeSlug, onSelect, className = '' }) {
  const markers = useMemo(() => {
    const pts = events.map((e) => {
      const p = e.places[0];
      const [ax, ay] = project(p.lat, p.lon);
      return { slug: e.slug, id: e.id, title: e.title, place: p.name, time: e.time, ax, ay, lat: p.lat, lon: p.lon };
    });
    return relax(pts);
  }, [events]);

  // Khung nhìn (viewBox): phóng to, kéo bản đồ bằng chuột, ngón tay; chụm hai ngón để phóng to
  const [view, setView] = useState(FULL);
  const svgRef = useRef(null);
  const gesture = useRef({ pointers: new Map(), start: null, moved: false });
  const viewRef = useRef(view);
  viewRef.current = view;
  const zoomed = view.w < FULL.w - 1;

  const zoomAt = (factor, cx, cy) => {
    setView((v) => {
      const px = cx ?? v.x + v.w / 2;
      const py = cy ?? v.y + v.h / 2;
      return clampView({ x: px - (px - v.x) / factor, y: py - (py - v.y) / factor, w: v.w / factor, h: v.h / factor });
    });
  };
  // vùng đồng bằng Bắc Bộ và phụ cận: nơi có nhiều sự kiện nhất
  const north = useMemo(() => {
    const pts = markers.filter((m) => m.lat > 19.6 && m.lat < 22.8 && m.lon > 104.8 && m.lon < 107.2);
    if (!pts.length) return FULL;
    const minX = Math.min(...pts.map((m) => m.x)) - R - 8;
    const maxX = Math.max(...pts.map((m) => m.x)) + R + 8;
    const minY = Math.min(...pts.map((m) => m.y)) - R - 8;
    const maxY = Math.max(...pts.map((m) => m.y)) + R + 8;
    const w = Math.max(maxX - minX, ((maxY - minY) * FULL.w) / FULL.h);
    return clampView({ x: (minX + maxX) / 2 - w / 2, y: (minY + maxY) / 2 - (w * FULL.h) / FULL.w / 2, w, h: (w * FULL.h) / FULL.w });
  }, [markers]);

  // Khi chọn sự kiện trong danh sách mà điểm đó nằm ngoài khung đang phóng to thì dời khung tới đó
  useEffect(() => {
    if (!zoomed) return;
    const m = markers.find((k) => k.slug === activeSlug);
    if (!m) return;
    setView((v) => {
      const pad = R * 2;
      if (m.x > v.x + pad && m.x < v.x + v.w - pad && m.y > v.y + pad && m.y < v.y + v.h - pad) return v;
      return clampView({ ...v, x: m.x - v.w / 2, y: m.y - v.h / 2 });
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeSlug]);

  const toMap = (clientX, clientY) => {
    const r = svgRef.current.getBoundingClientRect();
    return { x: view.x + ((clientX - r.left) / r.width) * view.w, y: view.y + ((clientY - r.top) / r.height) * view.h, scale: view.w / r.width };
  };
  const onPointerDown = (e) => {
    const g = gesture.current;
    g.pointers.set(e.pointerId, { x: e.clientX, y: e.clientY });
    g.start = { view: viewRef.current, pts: new Map(g.pointers) };
    g.moved = false;
  };
  const onPointerMove = (e) => {
    const g = gesture.current;
    if (!g.pointers.has(e.pointerId) || !g.start) return;
    g.pointers.set(e.pointerId, { x: e.clientX, y: e.clientY });
    const r = svgRef.current.getBoundingClientRect();
    const s0 = g.start.view;
    const ids = [...g.pointers.keys()];
    if (ids.length >= 2) {
      // chụm/xòe hai ngón: phóng to quanh trung điểm
      const [a, b] = ids.map((id) => g.pointers.get(id));
      const [a0, b0] = ids.map((id) => g.start.pts.get(id) || g.pointers.get(id));
      const d0 = Math.hypot(a0.x - b0.x, a0.y - b0.y) || 1;
      const d1 = Math.hypot(a.x - b.x, a.y - b.y) || 1;
      const f = d1 / d0;
      const mx = (a0.x + b0.x) / 2;
      const my = (a0.y + b0.y) / 2;
      const cx = s0.x + ((mx - r.left) / r.width) * s0.w;
      const cy = s0.y + ((my - r.top) / r.height) * s0.h;
      g.moved = true;
      setView(clampView({ x: cx - (cx - s0.x) / f, y: cy - (cy - s0.y) / f, w: s0.w / f, h: s0.h / f }));
      return;
    }
    const p0 = g.start.pts.get(e.pointerId);
    if (!p0) return;
    const dx = e.clientX - p0.x;
    const dy = e.clientY - p0.y;
    if (!g.moved && Math.hypot(dx, dy) < 6) return;
    if (s0.w >= FULL.w - 1) return; // chưa phóng to thì để trang cuộn bình thường
    g.moved = true;
    setView(clampView({ ...s0, x: s0.x - (dx / r.width) * s0.w, y: s0.y - (dy / r.height) * s0.h }));
  };
  const onPointerUp = (e) => {
    const g = gesture.current;
    g.pointers.delete(e.pointerId);
    g.start = g.pointers.size ? { view: viewRef.current, pts: new Map(g.pointers) } : null;
  };
  const select = (slug) => {
    if (gesture.current.moved) return; // vừa kéo bản đồ thì không tính là bấm
    onSelect?.(slug);
  };
  const onWheel = (e) => {
    if (!e.ctrlKey && !zoomed) return; // cuộn trang bình thường khi chưa phóng to
    e.preventDefault();
    const p = toMap(e.clientX, e.clientY);
    zoomAt(e.deltaY < 0 ? 1.25 : 0.8, p.x, p.y);
  };
  useEffect(() => {
    const el = svgRef.current;
    if (!el) return undefined;
    el.addEventListener('wheel', onWheel, { passive: false });
    return () => el.removeEventListener('wheel', onWheel);
  });

  const dots = (list) =>
    list.map(([lat, lon]) => {
      const [x, y] = project(lat, lon);
      return <circle key={`${lat}-${lon}`} cx={x} cy={y} r={2.6} className="vnmap-islet" />;
    });

  const onKey = (e, slug) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      onSelect?.(slug);
    }
  };
  const zoomLevel = FULL.w / view.w;

  return (
    <div className={`vnmap-wrap ${zoomed ? 'is-zoomed' : ''}`}>
      <svg
        ref={svgRef}
        viewBox={`${view.x} ${view.y} ${view.w} ${view.h}`}
        className={`vnmap ${className}`}
        role="group"
        aria-label="Bản đồ Việt Nam đánh dấu nơi diễn ra các sự kiện lịch sử"
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
        onPointerLeave={onPointerUp}
      >
        <defs>
          <radialGradient id="vnmap-sea" cx="70%" cy="55%" r="80%">
            {/* màu lấy từ biến CSS nên tự đổi theo chế độ sáng/tối */}
            <stop offset="0" style={{ stopColor: 'var(--map-sea-1)' }} />
            <stop offset="1" style={{ stopColor: 'var(--map-sea-2)' }} />
          </radialGradient>
          <pattern id="vnmap-hatch" width="7" height="7" patternUnits="userSpaceOnUse" patternTransform="rotate(35)">
            <line x1="0" y1="0" x2="0" y2="7" style={{ stroke: 'var(--map-hatch)' }} strokeWidth="1" />
          </pattern>
        </defs>
        <rect width={MAP.width} height={MAP.height} fill="url(#vnmap-sea)" />
        {NEIGHBORS.map((n) => (
          <path key={n.name} d={n.d} className="vnmap-neighbor" />
        ))}
        <path d={VIETNAM_PATH} className="vnmap-land" />
        <g aria-hidden="true">{dots(HOANG_SA)}</g>
        <g aria-hidden="true">{dots(TRUONG_SA)}</g>
        {LABELS.map((l) => {
          const [x, y] = project(l.lat, l.lon);
          return (
            <text key={l.text + l.lat} x={x} y={y} className={`vnmap-label ${l.cls}`} textAnchor="middle" aria-hidden="true">
              {l.text}
            </text>
          );
        })}

        {markers.map((m) => {
          const active = m.slug === activeSlug;
          const moved = Math.hypot(m.x - m.ax, m.y - m.ay) > 3;
          return (
            <g
              key={m.slug}
              className={`vnmap-marker ${active ? 'is-active' : ''}`}
              role="button"
              tabIndex={0}
              aria-pressed={active}
              aria-label={`${m.id}. ${m.title} — ${m.place}, ${m.time}`}
              onClick={() => select(m.slug)}
              onKeyDown={(e) => onKey(e, m.slug)}
            >
              {moved && <line x1={m.ax} y1={m.ay} x2={m.x} y2={m.y} className="vnmap-leader" />}
              <circle cx={m.ax} cy={m.ay} r={2.4} className="vnmap-anchor" />
              {/* vùng bấm rộng hơn hình tròn nhìn thấy, dễ chạm bằng ngón tay */}
              <circle cx={m.x} cy={m.y} r={R + 4} className="vnmap-hit" />
              <circle cx={m.x} cy={m.y} r={R} className="vnmap-pin" />
              <text x={m.x} y={m.y + 4.2} textAnchor="middle" className="vnmap-num">
                {m.id}
              </text>
            </g>
          );
        })}
      </svg>
      <div className="vnmap-zoom" role="group" aria-label="Phóng to, thu nhỏ bản đồ">
        <button type="button" onClick={() => setView(north)} className="vnmap-zoom-north" aria-label="Phóng to miền Bắc">
          Miền Bắc
        </button>
        <button type="button" onClick={() => zoomAt(1.6)} disabled={zoomLevel >= MAX_ZOOM - 0.01} aria-label="Phóng to">
          <Plus size={18} aria-hidden="true" />
        </button>
        <button type="button" onClick={() => zoomAt(1 / 1.6)} disabled={!zoomed} aria-label="Thu nhỏ">
          <Minus size={18} aria-hidden="true" />
        </button>
        <button type="button" onClick={() => setView(FULL)} disabled={!zoomed} aria-label="Xem toàn bộ bản đồ">
          <Maximize2 size={16} aria-hidden="true" />
        </button>
      </div>
    </div>
  );
}
