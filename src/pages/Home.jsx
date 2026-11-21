import { Fragment, useCallback, useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Box, MessageCircle } from 'lucide-react';
import { EVENTS, getEventBySlug } from '../data/events.js';
import MapExplorer from '../components/MapExplorer.jsx';
import VideoModal from '../components/VideoModal.jsx';
import EventImage from '../components/EventImage.jsx';
import HeroFacts from '../components/HeroFacts.jsx';
import { CountUp } from '../lib/motion.jsx';

const TITLE = 'Dòng chảy lịch sử';

// Tác giả làm sản phẩm (hiện ở cuối trang chủ)
const AUTHORS = ['Bùi Tiến Hoàng', 'Võ Minh Tuấn'];

// Các mốc tiêu biểu đặt trên dòng sông (cả cuộn phim có nhiều sự kiện hơn)
const RIVER_SLUGS = [
  'nha-nuoc-van-lang',
  'khang-chien-chong-tan-trieu',
  'khoi-nghia-hai-ba-trung',
  'khoi-nghia-ly-bi',
  'chien-thang-bach-dang-938',
  'nha-ly-doi-do-thang-long',
  'khang-chien-chong-tong',
  'khang-chien-chong-mong-nguyen',
  'khoi-nghia-lam-son',
  'phong-trao-tay-son',
  'phong-trao-can-vuong-yen-the',
  'thanh-lap-dang-cong-san',
  'cach-mang-thang-tam',
  'khang-chien-chong-phap',
  'khang-chien-chong-my',
  'chien-tranh-bao-ve-to-quoc',
  'cong-cuoc-doi-moi-1986',
];
const RIVER_EVENTS = EVENTS.filter((e) => RIVER_SLUGS.includes(e.slug));

/**
 * Dòng sông lịch sử: một đường uốn lượn vẽ theo đúng độ rộng màn hình,
 * các mốc sự kiện tiêu biểu đặt đều trên dòng sông.
 */
function HeroRiver() {
  const wrapRef = useRef(null);
  const [width, setWidth] = useState(1200);
  const navigate = useNavigate();

  useEffect(() => {
    const el = wrapRef.current;
    if (!el) return undefined;
    const ro = new ResizeObserver(([entry]) => setWidth(Math.max(320, Math.round(entry.contentRect.width))));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const compact = width < 700;
  const H = compact ? 190 : 250;
  const amp = compact ? 34 : 52;
  const yAt = (x) => H / 2 + amp * Math.sin((x / width) * Math.PI * 2.6 + 0.5) + 6;
  let d = '';
  for (let x = -10; x <= width + 10; x += 8) d += `${d ? 'L' : 'M'}${x.toFixed(1)} ${yAt(x).toFixed(1)}`;
  const margin = compact ? 22 : 56;
  const points = RIVER_EVENTS.map((e, i) => {
    const x = margin + ((width - margin * 2) * i) / (RIVER_EVENTS.length - 1);
    return { x, y: yAt(x), e };
  });

  return (
    <div ref={wrapRef} className="hero-river-wrap">
    <svg className="hero-river" width={width} height={H} viewBox={`0 0 ${width} ${H}`}>
      <title>Dòng sông lịch sử với {RIVER_EVENTS.length} mốc sự kiện tiêu biểu</title>
      <path d={d} className="hero-river-bank" />
      {/* Những hạt sáng trôi dọc dòng sông — "dòng chảy" của lịch sử */}
      <path d={d} className="hero-river-flow" pathLength="1" aria-hidden="true" />
      <path d={d} className="hero-river-line" pathLength="1" />
      {points.map(({ x, y, e }, i) => (
        <g
          key={e.slug}
          className="hero-river-stop"
          style={{ '--i': i }}
          role="link"
          tabIndex={0}
          aria-label={`${e.title}, ${e.time}`}
          onClick={() => navigate(`/su-kien/${e.slug}`)}
          onKeyDown={(ev) => ev.key === 'Enter' && navigate(`/su-kien/${e.slug}`)}
        >
          <circle cx={x} cy={y} r="7" />
          <text
            x={i === 0 ? x - 8 : i === RIVER_EVENTS.length - 1 ? x + 8 : x}
            y={y + (i % 2 ? -18 : 30)}
            textAnchor={i === 0 ? 'start' : i === RIVER_EVENTS.length - 1 ? 'end' : 'middle'}
          >
            {e.yearLabel}
          </text>
        </g>
      ))}
    </svg>
    </div>
  );
}

const STEPS = [
  {
    title: 'Chọn một khung phim',
    text: `${EVENTS.length} sự kiện xếp thành cuộn phim theo đúng tiến trình, từ thời nguyên thủy đến công cuộc Đổi mới và hội nhập.`,
  },
  {
    title: 'Xem video lịch sử',
    text: 'Mỗi sự kiện có video tiếng Việt đã được đối chiếu lời thoại với sách giáo khoa.',
  },
  {
    title: 'Bước vào mô hình 3D',
    text: 'Đi lại trong thành Cổ Loa, đứng giữa đàn thề Hát Môn, phóng to từng hiện vật.',
  },
  {
    title: 'Làm trắc nghiệm',
    text: 'Năm câu hỏi cho mỗi sự kiện, có giải thích ngay. Đạt 4/5 là sự kiện được đánh dấu đã học.',
  },
  {
    title: 'Hỏi giảng viên AI',
    text: 'Chỗ nào chưa rõ, hỏi trực tiếp. Giảng viên AI trả lời bằng tiếng Việt, bám sát chương trình.',
  },
];

const QUESTIONS = [
  'Vì sao thành Cổ Loa được xây theo hình xoáy trôn ốc?',
  'Ngô Quyền đã lợi dụng thủy triều như thế nào?',
  'So sánh trận Bạch Đằng năm 938 và năm 1288',
  'Ý nghĩa của Hội nghị Diên Hồng là gì?',
];

export default function Home() {
  const [videoEvent, setVideoEvent] = useState(null);
  const closeVideo = useCallback(() => setVideoEvent(null), []);
  const coLoa = getEventBySlug('khang-chien-chong-tan-trieu');
  const haiBa = getEventBySlug('khoi-nghia-hai-ba-trung');
  const totalVideos = EVENTS.reduce((s, e) => s + e.videos.length, 0);
  const totalQuestions = EVENTS.reduce((s, e) => s + e.quiz.length, 0);
  const total3d = EVENTS.filter((e) => e.sim3d).length;

  return (
    <>
      <section className="hero">
        <div className="hero-bg" aria-hidden="true" />
        <div className="container hero-content">
          <p className="hero-kicker">Học lịch sử Việt Nam qua video và mô hình 3D</p>
          <h1 className="hero-title">
            {/* Dấu cách nằm NGOÀI khung chữ, để các chữ không bị dính nhau */}
            {TITLE.split(' ').map((word, i) => (
              <Fragment key={word}>
                {i > 0 && ' '}
                <span className="hero-word" style={{ '--w': i }}>
                  {word}
                </span>
              </Fragment>
            ))}
          </h1>
          <HeroFacts
            intro={`${EVENTS.length} khung phim, từ dấu tích Người tối cổ, thời các vua Hùng dựng nước đến công cuộc Đổi mới và hội nhập. Xem video, bước vào mô hình 3D và tự kiểm tra hiểu biết của mình.`}
          />
          <div className="hero-actions">
            <Link to="/hoc-tap" className="btn btn-primary btn-lg">
              Bắt đầu học
            </Link>
            <Link to="/muc-luc" className="btn btn-ghost btn-lg">
              Xem mục lục tiến trình
            </Link>
          </div>
        </div>
        <HeroRiver />
      </section>

      <section className="section">
        <div className="container">
          <div className="section-head">
            <h2>Bước vào lịch sử</h2>
            <p>
              Hai sự kiện thời dựng nước đã có mô phỏng 3D. Dùng bàn phím hoặc nút trên màn hình để đi tiến, lùi, sang trái,
              sang phải và phóng to vào từng chi tiết.
            </p>
          </div>
          <div className="sim-feature">
            <Link to={`/mo-phong/${coLoa.slug}`} className="sim-card sim-card-lg">
              <img src="/images/sim/co-loa.jpg" alt="Toàn cảnh mô phỏng 3D thành Cổ Loa" loading="lazy" />
              <div className="sim-card-body">
                <p className="sim-card-time">{coLoa.time}</p>
                <h3>Thành Cổ Loa và nỏ thần</h3>
                <p>Ba vòng thành đất, hào nước, vọng lâu và kho mũi tên đồng của nước Âu Lạc.</p>
                <span className="btn btn-gold btn-sm">
                  <Box size={16} aria-hidden="true" /> Vào mô phỏng 3D
                </span>
              </div>
            </Link>
            <Link to={`/mo-phong/${haiBa.slug}`} className="sim-card">
              <img src="/images/sim/hat-mon.jpg" alt="Mô phỏng 3D đàn thề Hát Môn" loading="lazy" />
              <div className="sim-card-body">
                <p className="sim-card-time">{haiBa.time}</p>
                <h3>Hội thề Hát Môn</h3>
                <p>Đàn thề bên sông Hát, cờ khởi nghĩa và voi chiến của Hai Bà Trưng.</p>
                <span className="btn btn-gold btn-sm">
                  <Box size={16} aria-hidden="true" /> Vào mô phỏng 3D
                </span>
              </div>
            </Link>
          </div>
        </div>
      </section>

      <section className="section section-alt">
        <div className="container steps-wrap">
          <div className="section-head">
            <h2>Một bài học diễn ra thế nào</h2>
            <p>Mỗi sự kiện là một bài học ngắn, đi theo năm bước. Bạn có thể dừng ở bất kỳ bước nào và quay lại sau.</p>
          </div>
          <ol className="steps">
            {STEPS.map((s) => (
              <li key={s.title} className="step">
                <h3>{s.title}</h3>
                <p>{s.text}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <div className="section-head section-head-row">
            <div>
              <h2>Sự kiện trên bản đồ</h2>
              <p>Từ Cổ Loa, Mê Linh ở đồng bằng Bắc Bộ đến sông Tiền, Dinh Độc Lập ở phương Nam.</p>
            </div>
            <Link to="/ban-do" className="link-arrow">
              Mở bản đồ lớn
            </Link>
          </div>
          <MapExplorer onPlayVideo={setVideoEvent} />
        </div>
      </section>

      <section className="stats" aria-label="Con số của trang web">
        <div className="container stats-grid">
          <div className="stat">
            <strong>
              <CountUp value={EVENTS.length} />
            </strong>
            <span>sự kiện theo tiến trình</span>
          </div>
          <div className="stat">
            <strong>
              <CountUp value={totalVideos} />
            </strong>
            <span>video tiếng Việt đã kiểm chứng</span>
          </div>
          <div className="stat">
            <strong>
              <CountUp value={total3d} />
            </strong>
            <span>mô phỏng 3D tương tác</span>
          </div>
          <div className="stat">
            <strong>
              <CountUp value={totalQuestions} />
            </strong>
            <span>câu hỏi trắc nghiệm</span>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container ai-teaser">
          <div className="ai-teaser-text">
            <h2>Có câu hỏi? Hỏi giảng viên AI</h2>
            <p>
              Giảng viên AI trả lời bằng tiếng Việt, bám sát sách giáo khoa và gợi ý sự kiện liên quan trong cuộn phim.
              Hãy coi đó là người bạn ôn bài, và luôn đối chiếu lại với sách.
            </p>
            <Link to="/giang-vien-ai" className="btn btn-primary">
              <MessageCircle size={18} aria-hidden="true" /> Trò chuyện với giảng viên AI
            </Link>
          </div>
          <ul className="ai-teaser-questions" aria-label="Câu hỏi gợi ý">
            {QUESTIONS.map((q) => (
              <li key={q}>
                <Link to={`/giang-vien-ai?hoi=${encodeURIComponent(q)}`}>{q}</Link>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="closing">
        <div className="container closing-inner">
          <EventImage event={getEventBySlug('khang-chien-chong-phap')} className="closing-img" showCredit={false} />
          <div>
            <h2>Lịch sử là một dòng chảy không đứt đoạn</h2>
            <p>Bắt đầu từ khung phim đầu tiên. Mỗi sự kiện chỉ mất khoảng mười lăm phút.</p>
            <Link to="/hoc-tap/viet-nam" className="btn btn-primary btn-lg">
              Mở cuộn phim lịch sử Việt Nam
            </Link>
          </div>
        </div>
      </section>

      {/* Tác giả sản phẩm */}
      <section className="authors" aria-labelledby="authors-title">
        <div className="container authors-inner">
          <h2 id="authors-title" className="authors-title">
            Tác giả sản phẩm
          </h2>
          <ul className="authors-list">
            {AUTHORS.map((name) => (
              <li key={name} className="authors-name">
                {name}
              </li>
            ))}
          </ul>
        </div>
      </section>

      <VideoModal event={videoEvent} onClose={closeVideo} />
    </>
  );
}
