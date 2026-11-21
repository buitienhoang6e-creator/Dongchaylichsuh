import { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';

/**
 * HIỆU ỨNG CHUYỂN ĐỘNG dùng chung.
 * Mọi hiệu ứng đều tắt khi người dùng bật "giảm chuyển động" trong hệ điều hành
 * (prefers-reduced-motion) — nội dung vẫn hiện đầy đủ, chỉ không chuyển động.
 */

export const prefersReducedMotion = () =>
  typeof window !== 'undefined' && Boolean(window.matchMedia?.('(prefers-reduced-motion: reduce)').matches);

/**
 * Các khối sẽ "hiện dần" khi cuộn tới. Kiểu: up (trượt lên), left / right (trượt ngang), zoom (phóng nhẹ).
 * Phần tử khớp nhiều dòng thì lấy dòng đầu tiên.
 */
const REVEAL_RULES = [
  ['zoom', '.sim-feature > a, .intro-quote, .account-card, .event-hero-img, .closing-inner > :first-child'],
  ['left', '.timeline > li, .ai-teaser-text, .toc-period-head'],
  ['right', '.event-aside > *, .account-aside, .closing-inner > :last-child'],
  [
    'up',
    [
      '.section-head',
      '.h-section',
      '.overview-goal',
      '.intro-why',
      '.map-explorer',
      '.event-main > section',
      '.event-nav',
      '.steps > li',
      '.stats-grid > .stat',
      '.features > li',
      '.sources-grid > div',
      '.learn-grid > a',
      '.planned-list > li',
      '.toc-list > li',
      '.ai-teaser-questions > li',
      '.intro-why-grid > p',
      '.eras > li',
      '.footer-grid > *',
    ].join(', '),
  ],
];

/**
 * Gắn hiệu ứng hiện dần cho cả trang (gọi một lần ở App). Tự nhận các khối mới khi đổi trang.
 * Các khối cùng xuất hiện một lúc sẽ hiện lần lượt (so le 80 ms) cho tự nhiên.
 */
export function useScrollReveal() {
  useLayoutEffect(() => {
    if (prefersReducedMotion() || !('IntersectionObserver' in window)) return undefined;
    const root = document.getElementById('root');
    if (!root) return undefined;
    const seen = new WeakSet();
    const pending = new Set();
    const byDomOrder = (a, b) => (a.compareDocumentPosition(b) & Node.DOCUMENT_POSITION_FOLLOWING ? -1 : 1);

    const reveal = (els) => {
      els.sort(byDomOrder).forEach((el, i) => {
        el.style.setProperty('--reveal-delay', `${Math.min(i, 6) * 80}ms`);
        el.classList.add('is-revealed');
        pending.delete(el);
        io.unobserve(el);
      });
    };

    const io = new IntersectionObserver(
      (entries) => reveal(entries.filter((e) => e.isIntersecting).map((e) => e.target)),
      { rootMargin: '0px 0px -6% 0px', threshold: 0 },
    );

    // Dự phòng: cuộn rất nhanh hoặc nhảy thẳng tới giữa trang có thể "vượt qua" một khối mà không kịp ghi nhận.
    // Khối nào đã nằm phía trên hoặc trong màn hình mà vẫn chưa hiện thì cho hiện luôn.
    let checkQueued = false;
    const checkPassed = () => {
      checkQueued = false;
      const limit = window.innerHeight * 0.94;
      const passed = [];
      pending.forEach((el) => {
        if (!el.isConnected) pending.delete(el);
        else if (el.getClientRects().length && el.getBoundingClientRect().top < limit) passed.push(el);
      });
      if (passed.length) reveal(passed);
    };
    const onScroll = () => {
      if (checkQueued || !pending.size) return;
      checkQueued = true;
      requestAnimationFrame(checkPassed);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('scrollend', checkPassed);

    const scan = () => {
      for (const [variant, selector] of REVEAL_RULES) {
        root.querySelectorAll(selector).forEach((el) => {
          if (seen.has(el)) return;
          seen.add(el);
          el.dataset.reveal = variant;
          pending.add(el);
          io.observe(el);
        });
      }
    };

    // Quét lại khi trang thêm nội dung mới (đổi trang, tải trang lười…), gom tối đa một lần mỗi khung hình
    let queued = false;
    const mo = new MutationObserver(() => {
      if (queued) return;
      queued = true;
      requestAnimationFrame(() => {
        queued = false;
        scan();
      });
    });
    scan();
    mo.observe(root, { childList: true, subtree: true });
    return () => {
      mo.disconnect();
      io.disconnect();
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('scrollend', checkPassed);
    };
  }, []);
}

/** Con số tự đếm từ 0 lên khi cuộn tới. Trình đọc màn hình luôn đọc đúng con số cuối. */
export function CountUp({ value, duration = 1400 }) {
  const ref = useRef(null);
  const [shown, setShown] = useState(() => (prefersReducedMotion() ? value : 0));

  useEffect(() => {
    const el = ref.current;
    if (!el || prefersReducedMotion() || !('IntersectionObserver' in window)) {
      setShown(value);
      return undefined;
    }
    let raf = 0;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        io.disconnect();
        const start = performance.now();
        const tick = (now) => {
          const p = Math.min(1, (now - start) / duration);
          setShown(Math.round(value * (1 - (1 - p) ** 3)));
          if (p < 1) raf = requestAnimationFrame(tick);
        };
        raf = requestAnimationFrame(tick);
      },
      { threshold: 0.5 },
    );
    io.observe(el);
    return () => {
      io.disconnect();
      cancelAnimationFrame(raf);
    };
  }, [value, duration]);

  return (
    <span ref={ref} className="count-up">
      <span aria-hidden="true">{shown}</span>
      <span className="sr-only">{value}</span>
    </span>
  );
}

const CONFETTI_COLORS = ['var(--crimson)', 'var(--bronze-2)', 'var(--jade)', 'var(--bronze)', '#e9c46a', '#c0392b'];

/** Pháo giấy ăn mừng (chỉ để trang trí, không ảnh hưởng thao tác). */
export function Confetti({ pieces = 36 }) {
  const items = useMemo(
    () =>
      Array.from({ length: pieces }, (_, i) => ({
        '--x': `${Math.random() * 100}%`,
        '--dx': `${(Math.random() - 0.5) * 220}px`,
        '--r': `${(Math.random() - 0.5) * 1080}deg`,
        '--d': `${1600 + Math.random() * 1200}ms`,
        '--delay': `${Math.random() * 350}ms`,
        '--c': CONFETTI_COLORS[i % CONFETTI_COLORS.length],
        '--w': `${6 + Math.round(Math.random() * 5)}px`,
      })),
    [pieces],
  );
  if (prefersReducedMotion()) return null;
  return (
    <div className="confetti" aria-hidden="true">
      {items.map((style, i) => (
        <i key={i} style={style} />
      ))}
    </div>
  );
}
