import { useEffect, useRef, useState } from 'react';
import { BarChart3, LoaderCircle, RefreshCw } from 'lucide-react';

/**
 * TRANG THỐNG KÊ LƯỢT TRUY CẬP (/thong-ke) — dành cho người quản trị.
 * Cần mật khẩu STATS_PASSWORD đặt trên máy chủ. Mật khẩu chỉ giữ trong bộ nhớ của trang (không lưu lại).
 */

const fmt = (n) => n.toLocaleString('vi-VN');
const dmy = (day) => day.split('-').reverse().join('/');
const dm = (day) => day.split('-').slice(1).reverse().join('/');

/** Làm tròn lên số đẹp (1, 2, 5 × 10^k) để vạch chia trục dễ đọc. */
function niceMax(v) {
  const p = 10 ** Math.floor(Math.log10(Math.max(1, v)));
  for (const m of [1, 2, 5, 10]) if (v <= m * p) return m * p;
  return 10 * p;
}

/** Cột có góc bo 4px ở đầu cột, vuông ở đường đáy. */
function barPath(x, top, w, base) {
  const r = Math.min(4, w / 2, base - top);
  return `M${x},${base}V${top + r}Q${x},${top} ${x + r},${top}H${x + w - r}Q${x + w},${top} ${x + w},${top + r}V${base}Z`;
}

function DailyChart({ series }) {
  const wrapRef = useRef(null);
  const [width, setWidth] = useState(640);
  const [active, setActive] = useState(null);

  useEffect(() => {
    const el = wrapRef.current;
    if (!el) return undefined;
    const ro = new ResizeObserver(([entry]) => setWidth(Math.max(260, entry.contentRect.width)));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const H = 220;
  const pad = { l: 40, r: 8, t: 14, b: 30 };
  const max = niceMax(Math.max(...series.map((d) => d.views), 4));
  const plotW = width - pad.l - pad.r;
  const band = plotW / series.length;
  const bw = Math.max(2, Math.min(24, band - 2)); // cột tối đa 24px, luôn chừa khe 2px
  const base = H - pad.b;
  const y = (v) => pad.t + (base - pad.t) * (1 - v / max);
  const ticks = [0, max / 2, max];
  // Nhãn ngày: khoảng 6 nhãn để không chồng chữ, luôn có ngày cuối
  const step = Math.max(1, Math.ceil(series.length / (width < 480 ? 4 : 6)));
  const showLabel = (i) => i === series.length - 1 || (series.length - 1 - i) % step === 0;

  const pick = (clientX) => {
    const r = wrapRef.current.getBoundingClientRect();
    const i = Math.floor((clientX - r.left - pad.l) / band);
    setActive(i >= 0 && i < series.length ? i : null);
  };
  const onKey = (e) => {
    if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') {
      e.preventDefault();
      const d = e.key === 'ArrowLeft' ? -1 : 1;
      setActive((a) => Math.min(series.length - 1, Math.max(0, (a ?? series.length) + d)));
    }
    if (e.key === 'Escape') setActive(null);
  };

  const a = active != null ? series[active] : null;
  const ax = a ? pad.l + active * band + band / 2 : 0;

  return (
    <div className="stats-chart" ref={wrapRef}>
      <svg
        width={width}
        height={H}
        role="img"
        aria-label={`Biểu đồ cột lượt xem mỗi ngày trong ${series.length} ngày qua. Dùng phím mũi tên trái, phải để đọc từng ngày.`}
        tabIndex={0}
        onKeyDown={onKey}
        onPointerMove={(e) => pick(e.clientX)}
        onPointerLeave={() => setActive(null)}
        onBlur={() => setActive(null)}
      >
        {ticks.map((t) => (
          <g key={t}>
            <line className="stats-grid" x1={pad.l} x2={width - pad.r} y1={y(t)} y2={y(t)} />
            <text className="stats-axis" x={pad.l - 6} y={y(t)} dy="0.32em" textAnchor="end">
              {fmt(t)}
            </text>
          </g>
        ))}
        {a && <rect className="stats-hover" x={pad.l + active * band} y={pad.t} width={band} height={base - pad.t} />}
        {series.map((d, i) =>
          d.views > 0 ? (
            <path
              key={d.day}
              className={`stats-bar ${active === i ? 'is-active' : ''}`}
              d={barPath(pad.l + i * band + (band - bw) / 2, y(d.views), bw, base)}
            />
          ) : null,
        )}
        {series.map((d, i) =>
          showLabel(i) ? (
            <text key={d.day} className="stats-axis" x={pad.l + i * band + band / 2} y={H - 10} textAnchor="middle">
              {dm(d.day)}
            </text>
          ) : null,
        )}
      </svg>
      {a && (
        <div
          className="stats-tip"
          style={{ left: Math.min(Math.max(ax, 80), width - 80), top: Math.max(0, y(a.views) - 8) }}
          role="status"
        >
          <strong>{dmy(a.day)}</strong>
          <span>{fmt(a.views)} lượt xem</span>
          <span>{fmt(a.visitors)} người xem</span>
        </div>
      )}
    </div>
  );
}

function Tile({ label, views, visitors, note }) {
  return (
    <div className="stats-tile">
      <p className="stats-tile-label">{label}</p>
      <p className="stats-tile-value">{fmt(views)}</p>
      <p className="stats-tile-sub">
        lượt xem · {fmt(visitors)} {note || 'người xem'}
      </p>
    </div>
  );
}

export default function Stats() {
  const [password, setPassword] = useState('');
  const [data, setData] = useState(null);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    document.title = 'Thống kê lượt truy cập — Dòng chảy lịch sử';
  }, []);

  async function load(e) {
    e?.preventDefault();
    setBusy(true);
    setError('');
    try {
      const res = await fetch('/api/stats/summary', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      });
      const body = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(body.error || 'Chưa lấy được số liệu.');
        if (res.status === 401) setData(null);
        return;
      }
      setData(body);
    } catch {
      setError('Không kết nối được máy chủ. Bạn kiểm tra mạng rồi thử lại nhé.');
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="page container stats-page">
      <header className="page-head">
        <h1>
          <BarChart3 size={30} aria-hidden="true" className="stats-icon" /> Thống kê lượt truy cập
        </h1>
        <p>
          Số liệu do chính trang web đếm: không dùng cookie, không lưu địa chỉ IP hay thông tin cá nhân của người xem.
          “Người xem” được ước tính theo từng ngày.
        </p>
      </header>

      {!data ? (
        <form className="account-card stats-login" onSubmit={load} noValidate>
          <div className="form-field">
            <label htmlFor="stats-password">Mật khẩu quản trị</label>
            <input
              id="stats-password"
              className="form-input"
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          {error && (
            <p className="form-message is-error" role="alert">
              {error}
            </p>
          )}
          <button type="submit" className="btn btn-primary btn-block" disabled={busy || !password}>
            {busy && <LoaderCircle size={18} className="spin" aria-hidden="true" />} Xem số liệu
          </button>
        </form>
      ) : (
        <>
          <div className="stats-toolbar">
            <p className="stats-since">
              Giờ Việt Nam{data.since ? ` · bắt đầu đếm từ ${dmy(data.since)}` : ''} · tổng cộng {fmt(data.totals.allViews)} lượt xem
            </p>
            <button type="button" className="btn btn-ghost btn-sm" onClick={load} disabled={busy}>
              <RefreshCw size={16} aria-hidden="true" className={busy ? 'spin' : undefined} /> Làm mới
            </button>
          </div>
          {error && (
            <p className="form-message is-error" role="alert">
              {error}
            </p>
          )}

          <div className="stats-tiles">
            <Tile label={`Hôm nay (${dmy(data.today)})`} views={data.totals.today.views} visitors={data.totals.today.visitors} />
            <Tile label="7 ngày qua" views={data.totals.week.views} visitors={data.totals.week.visitors} note="lượt người xem" />
            <Tile label="30 ngày qua" views={data.totals.month.views} visitors={data.totals.month.visitors} note="lượt người xem" />
            <div className="stats-tile">
              <p className="stats-tile-label">Tài khoản người học</p>
              <p className="stats-tile-value">{fmt(data.accounts.total)}</p>
              <p className="stats-tile-sub">mới trong 7 ngày: {fmt(data.accounts.newThisWeek)}</p>
            </div>
          </div>

          <section className="stats-card" aria-labelledby="stats-daily">
            <h2 id="stats-daily">Lượt xem mỗi ngày (30 ngày qua)</h2>
            <DailyChart series={data.series} />
            <details className="stats-table">
              <summary>Xem dạng bảng</summary>
              <table>
                <thead>
                  <tr>
                    <th scope="col">Ngày</th>
                    <th scope="col">Lượt xem</th>
                    <th scope="col">Người xem</th>
                  </tr>
                </thead>
                <tbody>
                  {[...data.series].reverse().map((d) => (
                    <tr key={d.day}>
                      <td>{dmy(d.day)}</td>
                      <td>{fmt(d.views)}</td>
                      <td>{fmt(d.visitors)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </details>
          </section>

          <section className="stats-card" aria-labelledby="stats-top">
            <h2 id="stats-top">Trang được xem nhiều nhất (30 ngày qua)</h2>
            {data.topPages.length ? (
              <ol className="stats-top">
                {data.topPages.map((p) => (
                  <li key={p.path}>
                    <span className="stats-top-name">{p.name}</span>
                    <span
                      className="stats-top-bar"
                      style={{ '--w': `${Math.max(2, (p.views / data.topPages[0].views) * 100)}%` }}
                      aria-hidden="true"
                    />
                    <span className="stats-top-value">{fmt(p.views)}</span>
                  </li>
                ))}
              </ol>
            ) : (
              <p className="stats-empty">Chưa có lượt xem nào.</p>
            )}
          </section>
        </>
      )}
    </div>
  );
}
