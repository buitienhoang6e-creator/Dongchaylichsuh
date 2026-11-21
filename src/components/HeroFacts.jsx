import { useEffect, useState } from 'react';
import { Pause, Play } from 'lucide-react';
import { HERO_FACTS } from '../data/heroFacts.js';
import { prefersReducedMotion } from '../lib/motion.jsx';

const INTERVAL = 4000; // nhớ sửa cả thời gian thanh chạy (hero-fact-run) trong pages.css

/**
 * Đoạn mô tả dưới tên trang: tự đổi câu sau mỗi 4 giây (lịch sử Việt Nam và thế giới).
 * Dừng khi rê chuột, khi đang chọn bằng bàn phím, khi người xem bấm “Tạm dừng”,
 * hoặc khi máy bật chế độ giảm chuyển động. Các câu xếp chồng cùng một ô nên trang không bị nhảy.
 */
export default function HeroFacts({ intro }) {
  const facts = [{ scope: 'site', text: intro }, ...HERO_FACTS];
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const [holding, setHolding] = useState(false);
  const [reduced] = useState(() => prefersReducedMotion());
  const running = !paused && !holding && !reduced;

  useEffect(() => {
    if (!running) return undefined;
    const t = setTimeout(() => setIndex((i) => (i + 1) % facts.length), INTERVAL);
    return () => clearTimeout(t);
  }, [index, running, facts.length]);

  return (
    <div
      className={`hero-lead hero-facts ${running ? 'is-running' : ''}`}
      // chỉ dừng khi rê chuột thật hoặc chọn bằng bàn phím (chạm trên điện thoại không làm dừng mãi)
      onPointerEnter={(e) => e.pointerType === 'mouse' && setHolding(true)}
      onPointerLeave={(e) => e.pointerType === 'mouse' && setHolding(false)}
      onFocus={(e) => e.target.matches?.(':focus-visible') && setHolding(true)}
      onBlur={() => setHolding(false)}
    >
      <div className="hero-facts-stack" aria-live={running ? 'off' : 'polite'}>
        {facts.map((f, i) => (
          <p key={i} className={`hero-fact ${i === index ? 'is-on' : ''}`} aria-hidden={i !== index}>
            {f.scope !== 'site' && <span className="hero-fact-tag">{f.scope === 'vn' ? 'Việt Nam' : 'Thế giới'}</span>}
            {f.text}
          </p>
        ))}
      </div>
      <div className="hero-facts-nav">
        <div className="hero-facts-dots" role="group" aria-label="Chọn mô tả">
          {facts.map((_, i) => (
            <button
              key={i}
              type="button"
              className={`hero-facts-dot ${i === index ? 'is-on' : ''}`}
              onClick={() => setIndex(i)}
              aria-label={`Mô tả ${i + 1} trên ${facts.length}`}
              aria-current={i === index}
            >
              {/* thanh chạy cho biết còn bao lâu nữa đổi câu */}
              <span key={i === index ? `run-${index}` : 'idle'} />
            </button>
          ))}
        </div>
        {!reduced && (
          <button
            type="button"
            className="hero-facts-pause"
            onClick={() => setPaused((p) => !p)}
            aria-label={paused ? 'Tiếp tục tự đổi mô tả' : 'Tạm dừng tự đổi mô tả'}
            title={paused ? 'Tiếp tục' : 'Tạm dừng'}
          >
            {paused ? <Play size={14} aria-hidden="true" /> : <Pause size={14} aria-hidden="true" />}
          </button>
        )}
      </div>
    </div>
  );
}
