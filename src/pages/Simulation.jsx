import { useCallback, useEffect, useRef, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import {
  ArrowDown,
  ArrowLeft,
  ArrowUp,
  Camera,
  ChevronLeft,
  ChevronRight,
  ChevronsDown,
  ChevronsUp,
  Expand,
  Footprints,
  Info,
  Keyboard,
  ListOrdered,
  Map as MapIcon,
  Minus,
  Plus,
  Scan,
  X,
} from 'lucide-react';
import { getEventBySlug } from '../data/events.js';
import '../styles/sim.css';

const THREE_DEG = 180 / Math.PI;

const SCENES = {
  'co-loa': () => import('../three/scenes/coLoa.js'),
  'hat-mon': () => import('../three/scenes/hatMon.js'),
  'nguoi-toi-co': () => import('../three/scenes/nguoiToiCo.js'),
  'hoa-binh': () => import('../three/scenes/hoaBinh.js'),
};

function hasWebGL() {
  try {
    const c = document.createElement('canvas');
    return Boolean(c.getContext('webgl2') || c.getContext('webgl'));
  } catch {
    return false;
  }
}

/** Nút giữ để di chuyển (dùng cho điện thoại và cho người không quen bàn phím). */
function HoldButton({ label, onChange, children, className = '' }) {
  const start = (e) => {
    e.preventDefault();
    onChange(true);
  };
  const end = () => onChange(false);
  return (
    <button
      type="button"
      className={`sim-pad-btn ${className}`}
      aria-label={label}
      title={label}
      onPointerDown={start}
      onPointerUp={end}
      onPointerLeave={end}
      onPointerCancel={end}
      onContextMenu={(e) => e.preventDefault()}
      onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && start(e)}
      onKeyUp={(e) => (e.key === 'Enter' || e.key === ' ') && end()}
    >
      {children}
    </button>
  );
}

export default function Simulation() {
  const { slug } = useParams();
  const ev = getEventBySlug(slug);
  const simId = ev?.sim3d;
  const mountRef = useRef(null);
  const engineRef = useRef(null);
  const markerRefs = useRef({});
  const [status, setStatus] = useState('Đang chuẩn bị…');
  const [progress, setProgress] = useState(0);
  const [ready, setReady] = useState(false);
  const [error, setError] = useState('');
  const [meta, setMeta] = useState(null);
  const [hotspots, setHotspots] = useState([]);
  const [credits, setCredits] = useState([]);
  const [active, setActive] = useState(null);
  const [panel, setPanel] = useState(null); // 'help' | 'credits' | null
  // 'map': kéo, xoay, nghiêng như Google Maps (mặc định) · 'walk': đi bộ trong cảnh
  const [mode, setMode] = useState('map');
  const [flat, setFlat] = useState(false); // đang nhìn thẳng từ trên xuống (2D)
  const [showHint, setShowHint] = useState(true);
  const [listOpen, setListOpen] = useState(false);
  const needleRef = useRef(null);

  useEffect(() => {
    if (!simId || !SCENES[simId]) return undefined;
    if (!hasWebGL()) {
      setError('Trình duyệt của bạn không hỗ trợ WebGL nên không hiển thị được mô phỏng 3D. Hãy thử Chrome, Edge hoặc Firefox bản mới.');
      return undefined;
    }
    let disposed = false;
    let engine;
    (async () => {
      try {
        const [{ Engine }, sceneModule] = await Promise.all([import('../three/engine.js'), SCENES[simId]()]);
        if (disposed) return;
        setMeta(sceneModule.meta);
        engine = new Engine(mountRef.current, { onProgress: (p) => setProgress(p) });
        engineRef.current = engine;
        const result = await sceneModule.build(engine, { onStatus: setStatus });
        if (disposed) {
          engine.dispose();
          return;
        }
        const controls = engine.createControls({ heightAt: result.heightAt, bounds: result.bounds }, 'map');
        setMode('map');
        controls.onInteract = () => setShowHint(false);
        controls.place(result.start.x, result.start.z, result.start.target, result.start.lift);
        result.hotspots.forEach((h) => engine.addHotspot(h));
        setHotspots(result.hotspots);
        setCredits(result.credits);
        let wasFlat = null;
        engine.onFrame = () => {
          // la bàn: kim đỏ luôn chỉ hướng Bắc của cảnh
          const c = engine.controls;
          if (c?.mode === 'map') {
            needleRef.current?.setAttribute('transform', `rotate(${THREE_DEG * c.heading} 12 12)`);
            const isFlat = c.tilt < 0.3;
            if (isFlat !== wasFlat) {
              wasFlat = isFlat;
              setFlat(isFlat);
            }
          }
          const proj = engine.projectHotspots();
          for (const p of proj) {
            const el = markerRefs.current[p.id];
            if (!el) continue;
            if (p.visible) {
              el.style.transform = `translate(${p.x}px, ${p.y}px)`;
              el.style.opacity = p.dist > 420 ? '0.55' : '1';
              el.style.visibility = 'visible';
            } else {
              el.style.visibility = 'hidden';
            }
          }
        };
        engine.start();
        setStatus('Sẵn sàng');
        setProgress(1);
        setReady(true);
      } catch (err) {
        console.error(err);
        if (!disposed) setError('Không tải được mô phỏng. Hãy kiểm tra kết nối mạng rồi tải lại trang.');
      }
    })();
    return () => {
      disposed = true;
      engineRef.current?.dispose();
      engineRef.current = null;
    };
  }, [simId]);

  const goTo = useCallback(
    (h) => {
      setActive(h);
      setPanel(null);
      setShowHint(false);
      if (h?.view) engineRef.current?.controls?.travel(h.view);
    },
    [],
  );

  const step = (dir) => {
    if (!hotspots.length) return;
    const i = active ? hotspots.findIndex((h) => h.id === active.id) : -1;
    goTo(hotspots[(i + dir + hotspots.length) % hotspots.length]);
  };

  const setMove = (axis, value) => engineRef.current?.controls?.setVirtual(axis, value);

  const switchMode = (next) => {
    const engine = engineRef.current;
    if (!engine) return;
    engine.setControlMode(next);
    setMode(next);
    setShowHint(true);
  };

  /** Nhìn toàn cảnh: bay lên cao, bao trọn tất cả các điểm chú thích. */
  const overview = () => {
    const engine = engineRef.current;
    if (!engine) return;
    if (engine.controlMode !== 'map') {
      engine.setControlMode('map');
      setMode('map');
    }
    setActive(null);
    engine.controls.overview(engine.hotspots.map((h) => h.pos));
  };

  const mapCmd = (fn) => {
    const c = engineRef.current?.controls;
    if (c?.mode === 'map') fn(c);
  };

  const saveImage = () => {
    const url = engineRef.current?.screenshot();
    if (!url) return;
    const a = document.createElement('a');
    a.href = url;
    a.download = `dong-chay-lich-su-${simId}.jpg`;
    a.click();
  };

  const fullscreen = () => {
    const el = document.querySelector('.sim');
    if (!document.fullscreenElement) el?.requestFullscreen?.();
    else document.exitFullscreen?.();
  };

  if (!ev) {
    return (
      <div className="page container narrow">
        <h1>Không tìm thấy sự kiện</h1>
        <Link to="/hoc-tap/viet-nam" className="btn btn-primary">
          Về cuộn phim
        </Link>
      </div>
    );
  }

  if (!simId) {
    return (
      <div className="sim-pending">
        <div className="sim-pending-card">
          <span className="badge badge-pending">Đang cập nhật</span>
          <h1>Mô phỏng 3D: {ev.title}</h1>
          <p>
            Mô phỏng 3D của sự kiện này đang được xây dựng. Trong phiên bản thử nghiệm, bạn có thể bước vào hai mô
            phỏng đã hoàn thành.
          </p>
          <div className="hero-actions">
            <Link to="/mo-phong/khang-chien-chong-tan-trieu" className="btn btn-gold">
              Thành Cổ Loa
            </Link>
            <Link to="/mo-phong/khoi-nghia-hai-ba-trung" className="btn btn-gold">
              Hội thề Hát Môn
            </Link>
            <Link to={`/su-kien/${ev.slug}`} className="btn btn-ghost-light">
              Quay lại sự kiện
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="sim">
      <div ref={mountRef} className="sim-stage" aria-label={`Cảnh 3D: ${meta?.title || ev.title}`} />

      {/* Điểm chú thích */}
      <div className="sim-markers" aria-hidden={!ready}>
        {ready &&
          hotspots.map((h, i) => (
            <button
              key={h.id}
              ref={(el) => {
                markerRefs.current[h.id] = el;
              }}
              type="button"
              className={`sim-marker ${active?.id === h.id ? 'is-active' : ''}`}
              onClick={() => goTo(h)}
              aria-label={`Chú thích ${i + 1}: ${h.title}`}
            >
              <span className="sim-marker-dot">{i + 1}</span>
              <span className="sim-marker-label">{h.title}</span>
            </button>
          ))}
      </div>

      {/* Thanh trên */}
      <header className="sim-top">
        <Link to={`/su-kien/${ev.slug}`} className="sim-icon" aria-label="Quay lại trang sự kiện">
          <ArrowLeft size={20} />
        </Link>
        <div className="sim-title">
          <p>{meta?.subtitle || ev.time}</p>
          <h1>{meta?.title || ev.title}</h1>
        </div>
        <div className="sim-tools">
          {/* Điện thoại: danh sách chú thích ẩn sẵn, bấm nút này để mở */}
          <button
            type="button"
            className={`sim-icon sim-list-toggle ${listOpen ? 'is-on' : ''}`}
            onClick={() => setListOpen((v) => !v)}
            aria-label="Danh sách chú thích"
            aria-expanded={listOpen}
            title="Danh sách chú thích"
            disabled={!ready}
          >
            <ListOrdered size={19} />
          </button>
          <button type="button" className="sim-icon" onClick={() => setPanel(panel === 'help' ? null : 'help')} aria-label="Hướng dẫn điều khiển" title="Hướng dẫn điều khiển">
            <Keyboard size={19} />
          </button>
          {mode === 'map' ? (
            <button type="button" className="sim-icon" onClick={() => switchMode('walk')} aria-label="Chuyển sang chế độ đi bộ trong cảnh" title="Đi bộ trong cảnh" disabled={!ready}>
              <Footprints size={19} />
            </button>
          ) : (
            <button type="button" className="sim-icon" onClick={() => switchMode('map')} aria-label="Chuyển sang chế độ bản đồ (kéo, xoay, nhìn toàn cảnh)" title="Chế độ bản đồ" disabled={!ready}>
              <MapIcon size={19} />
            </button>
          )}
          <button type="button" className="sim-icon" onClick={saveImage} aria-label="Lưu ảnh khung cảnh" title="Lưu ảnh khung cảnh" disabled={!ready}>
            <Camera size={19} />
          </button>
          <button type="button" className="sim-icon" onClick={fullscreen} aria-label="Toàn màn hình" title="Toàn màn hình">
            <Expand size={19} />
          </button>
          <button type="button" className="sim-icon" onClick={() => setPanel(panel === 'credits' ? null : 'credits')} aria-label="Nguồn tư liệu và mô hình" title="Nguồn tư liệu và mô hình">
            <Info size={19} />
          </button>
        </div>
      </header>

      {/* Danh sách chú thích */}
      {ready && (
        <nav className={`sim-list ${listOpen ? 'is-open' : ''}`} aria-label="Các điểm chú thích">
          {hotspots.map((h, i) => (
            <button
              key={h.id}
              type="button"
              className={active?.id === h.id ? 'is-active' : ''}
              onClick={() => {
                goTo(h);
                setListOpen(false);
              }}
            >
              <span>{i + 1}</span>
              {h.title}
            </button>
          ))}
        </nav>
      )}

      {/* Bảng thông tin chú thích */}
      {active && (
        <aside className="sim-info" aria-live="polite">
          <div className="sim-info-head">
            <p>
              Chú thích {hotspots.findIndex((h) => h.id === active.id) + 1}/{hotspots.length}
            </p>
            <button type="button" className="sim-icon sim-icon-sm" onClick={() => setActive(null)} aria-label="Đóng chú thích">
              <X size={18} />
            </button>
          </div>
          <h2>{active.title}</h2>
          <p>{active.text}</p>
          <div className="sim-info-nav">
            <button type="button" className="btn btn-ghost-light btn-sm" onClick={() => step(-1)}>
              <ChevronLeft size={16} aria-hidden="true" /> Trước
            </button>
            <button type="button" className="btn btn-gold btn-sm" onClick={() => step(1)}>
              Tiếp theo <ChevronRight size={16} aria-hidden="true" />
            </button>
          </div>
        </aside>
      )}

      {/* Hướng dẫn / nguồn */}
      {panel && (
        <aside className="sim-panel" role="dialog" aria-label={panel === 'help' ? 'Hướng dẫn điều khiển' : 'Nguồn tư liệu'}>
          <button type="button" className="sim-icon sim-icon-sm sim-panel-close" onClick={() => setPanel(null)} aria-label="Đóng">
            <X size={18} />
          </button>
          {panel === 'help' && mode === 'map' ? (
            <>
              <h2>Cách di chuyển (chế độ bản đồ)</h2>
              <ul className="sim-keys">
                <li>Kéo chuột trái (hoặc vuốt một ngón): di chuyển như kéo bản đồ</li>
                <li>Kéo chuột phải, hoặc giữ <kbd>Ctrl</kbd> rồi kéo: xoay (kéo ngang) và nghiêng (kéo dọc)</li>
                <li>Lăn chuột (hoặc chụm hai ngón): phóng to, thu nhỏ về phía con trỏ</li>
                <li>Nhấp đúp: phóng to vào chỗ đó</li>
                <li>Điện thoại: xoay hai ngón để xoay cảnh, vuốt hai ngón lên/xuống để nghiêng</li>
                <li><kbd>W</kbd><kbd>A</kbd><kbd>S</kbd><kbd>D</kbd> hoặc mũi tên: di chuyển · <kbd>Q</kbd><kbd>E</kbd>: xoay · <kbd>R</kbd><kbd>F</kbd>: nghiêng</li>
                <li>Nút la bàn: quay về hướng Bắc · nút <strong>2D/3D</strong>: nhìn thẳng từ trên xuống hoặc nhìn nghiêng</li>
                <li>Nút toàn cảnh: bay lên cao nhìn cả khu vực</li>
                <li>Nút hình bàn chân ở trên: xuống đi bộ trong cảnh</li>
              </ul>
            </>
          ) : panel === 'help' ? (
            <>
              <h2>Cách di chuyển (chế độ đi bộ)</h2>
              <ul className="sim-keys">
                <li><kbd>W</kbd><kbd>↑</kbd> Đi tiến</li>
                <li><kbd>S</kbd><kbd>↓</kbd> Đi lùi</li>
                <li><kbd>A</kbd><kbd>←</kbd> Sang trái</li>
                <li><kbd>D</kbd><kbd>→</kbd> Sang phải</li>
                <li><kbd>Shift</kbd> Giữ để đi nhanh</li>
                <li><kbd>E</kbd> / <kbd>Q</kbd> Bay lên cao / hạ xuống</li>
                <li>Kéo chuột (hoặc vuốt): nhìn xung quanh</li>
                <li>Lăn chuột, phím <kbd>+</kbd> <kbd>-</kbd> (hoặc chụm hai ngón): phóng to, thu nhỏ</li>
                <li>Bấm vào các số trên cảnh để đọc chú thích</li>
                <li>Nút hình bản đồ ở trên: trở lại chế độ bản đồ</li>
              </ul>
              <p className="sim-note">Trên điện thoại, dùng các nút ở góc dưới màn hình.</p>
            </>
          ) : (
            <>
              <h2>Nguồn tư liệu và mô hình</h2>
              {meta?.note && <p className="sim-note">{meta.note}</p>}
              <ul className="sim-credits">
                {credits.map((c) => (
                  <li key={c}>{c}</li>
                ))}
              </ul>
            </>
          )}
        </aside>
      )}

      {/* Nút kiểu Google Maps: la bàn, nghiêng 2D/3D, toàn cảnh, phóng to/thu nhỏ */}
      {ready && mode === 'map' && (
        <div className="sim-map" aria-label="Điều khiển bản đồ">
          <button type="button" className="sim-map-btn sim-compass" onClick={() => mapCmd((c) => c.resetNorth())} aria-label="La bàn: xoay về hướng Bắc" title="Xoay về hướng Bắc">
            <svg viewBox="0 0 24 24" width="28" height="28" aria-hidden="true">
              <g ref={needleRef}>
                <path d="M12 2.5 L15.4 12 H8.6 Z" fill="#e0483c" />
                <path d="M12 21.5 L8.6 12 H15.4 Z" fill="#efe6d6" />
                <circle cx="12" cy="12" r="1.4" fill="#2a2018" />
              </g>
            </svg>
          </button>
          <button
            type="button"
            className="sim-map-btn sim-map-text"
            onClick={() => mapCmd((c) => c.setTilt(flat ? 0.95 : 0))}
            aria-label={flat ? 'Nhìn nghiêng 3D' : 'Nhìn thẳng từ trên xuống (2D)'}
            title={flat ? 'Nhìn nghiêng 3D' : 'Nhìn thẳng từ trên xuống'}
          >
            {flat ? '3D' : '2D'}
          </button>
          <button type="button" className="sim-map-btn" onClick={overview} aria-label="Nhìn toàn cảnh" title="Nhìn toàn cảnh">
            <Scan size={20} />
          </button>
          <div className="sim-map-zoom">
            <button type="button" className="sim-map-btn" onClick={() => mapCmd((c) => c.zoom(-9))} aria-label="Phóng to" title="Phóng to">
              <Plus size={20} />
            </button>
            <button type="button" className="sim-map-btn" onClick={() => mapCmd((c) => c.zoom(9))} aria-label="Thu nhỏ" title="Thu nhỏ">
              <Minus size={20} />
            </button>
          </div>
        </div>
      )}

      {/* Nút điều khiển ảo (chế độ đi bộ) */}
      {ready && mode === 'walk' && (
        <div className="sim-pad" aria-label="Nút di chuyển">
          <div className="sim-dpad">
            <HoldButton label="Đi tiến" className="up" onChange={(on) => setMove('forward', on ? 1 : 0)}>
              <ArrowUp size={20} />
            </HoldButton>
            <HoldButton label="Sang trái" className="left" onChange={(on) => setMove('right', on ? -1 : 0)}>
              <ArrowLeft size={20} />
            </HoldButton>
            <HoldButton label="Sang phải" className="right" onChange={(on) => setMove('right', on ? 1 : 0)}>
              <ArrowLeft size={20} style={{ transform: 'rotate(180deg)' }} />
            </HoldButton>
            <HoldButton label="Đi lùi" className="down" onChange={(on) => setMove('forward', on ? -1 : 0)}>
              <ArrowDown size={20} />
            </HoldButton>
          </div>
          <div className="sim-side">
            <HoldButton label="Bay lên" onChange={(on) => setMove('up', on ? 1 : 0)}>
              <ChevronsUp size={20} />
            </HoldButton>
            <HoldButton label="Hạ xuống" onChange={(on) => setMove('up', on ? -1 : 0)}>
              <ChevronsDown size={20} />
            </HoldButton>
            <button type="button" className="sim-pad-btn" aria-label="Phóng to" title="Phóng to" onClick={() => engineRef.current?.controls?.zoom(-8)}>
              <Plus size={20} />
            </button>
            <button type="button" className="sim-pad-btn" aria-label="Thu nhỏ" title="Thu nhỏ" onClick={() => engineRef.current?.controls?.zoom(8)}>
              <Minus size={20} />
            </button>
          </div>
        </div>
      )}

      {ready && showHint && mode === 'map' && (
        <p className="sim-hint">
          Kéo để di chuyển, giữ chuột phải (hoặc <kbd>Ctrl</kbd> + kéo) để xoay và nghiêng, lăn chuột để phóng to. Bấm vào
          các số để đọc chú thích.
        </p>
      )}
      {ready && showHint && mode === 'walk' && (
        <p className="sim-hint">
          Dùng <kbd>W</kbd> <kbd>A</kbd> <kbd>S</kbd> <kbd>D</kbd> để đi, kéo chuột để nhìn, lăn chuột để phóng to. Bấm vào
          các số để đọc chú thích.
        </p>
      )}

      {/* Màn hình chờ */}
      {!ready && (
        <div className="sim-loading" role="status">
          <div className="sim-loading-card">
            {error ? (
              <>
                <h2>Chưa mở được mô phỏng</h2>
                <p>{error}</p>
                <Link to={`/su-kien/${ev.slug}`} className="btn btn-gold">
                  Quay lại sự kiện
                </Link>
              </>
            ) : (
              <>
                <p className="sim-loading-kicker">{ev.time}</p>
                <h2>{meta?.title || ev.title}</h2>
                <div className="sim-bar">
                  <span style={{ width: `${Math.round(progress * 100)}%` }} />
                </div>
                <p className="sim-loading-status">
                  {status} {Math.round(progress * 100)}%
                </p>
                <p className="sim-loading-tip">
                  Mẹo: kéo để di chuyển như bản đồ, lăn chuột hoặc chụm hai ngón để phóng to, bấm nút toàn cảnh để nhìn cả
                  khu vực.
                </p>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
