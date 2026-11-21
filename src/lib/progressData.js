import { EVENTS } from '../data/events.js';

/**
 * Dữ liệu tiến độ học — dùng chung cho trình duyệt và máy chủ.
 *   learned: { [slug sự kiện]: thời điểm đánh dấu đã học (ms) }
 *   quiz:    { [slug sự kiện]: { best, last, total, at } }
 */
export const EMPTY_PROGRESS = Object.freeze({ learned: Object.freeze({}), quiz: Object.freeze({}) });

const SLUGS = new Set(EVENTS.map((e) => e.slug));
const isNum = (v) => typeof v === 'number' && Number.isFinite(v);
const clampInt = (v, min, max) => (isNum(v) ? Math.min(max, Math.max(min, Math.round(v))) : null);

/** Chỉ giữ dữ liệu hợp lệ (đúng sự kiện có thật, đúng kiểu số) — chống dữ liệu hỏng hoặc gửi bậy. */
export function sanitizeProgress(raw) {
  const src = raw && typeof raw === 'object' ? raw : {};
  const learned = {};
  const quiz = {};

  if (src.learned && typeof src.learned === 'object') {
    for (const [slug, at] of Object.entries(src.learned)) {
      if (SLUGS.has(slug) && isNum(at) && at > 0) learned[slug] = Math.round(at);
    }
  }
  if (src.quiz && typeof src.quiz === 'object') {
    for (const [slug, q] of Object.entries(src.quiz)) {
      if (!SLUGS.has(slug) || !q || typeof q !== 'object') continue;
      const total = clampInt(q.total, 1, 100);
      if (!total) continue;
      quiz[slug] = {
        best: clampInt(q.best, 0, total) ?? 0,
        last: clampInt(q.last, 0, total) ?? 0,
        total,
        at: isNum(q.at) && q.at > 0 ? Math.round(q.at) : 0,
      };
    }
  }
  return { learned, quiz };
}

/** Gộp hai bản tiến độ: giữ mọi sự kiện đã học, điểm cao nhất và lần làm bài gần nhất. */
export function mergeProgress(a, b) {
  const x = sanitizeProgress(a);
  const y = sanitizeProgress(b);
  const learned = { ...y.learned };
  for (const [slug, at] of Object.entries(x.learned)) learned[slug] = learned[slug] ? Math.min(learned[slug], at) : at;
  const quiz = { ...y.quiz };
  for (const [slug, q] of Object.entries(x.quiz)) {
    const other = quiz[slug];
    if (!other) quiz[slug] = q;
    else quiz[slug] = { ...(q.at >= other.at ? q : other), best: Math.max(q.best, other.best) };
  }
  return { learned, quiz };
}

export const isEmptyProgress = (p) => !Object.keys(p?.learned || {}).length && !Object.keys(p?.quiz || {}).length;
