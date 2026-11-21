import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { api, useAuth } from './auth.jsx';
import { EMPTY_PROGRESS, isEmptyProgress, mergeProgress, sanitizeProgress } from './progressData.js';

/**
 * Tiến độ học của người học.
 *  - Chưa đăng nhập: lưu ngay trên trình duyệt (localStorage) như trước.
 *  - Đã đăng nhập: lưu vào tài khoản trên máy chủ, học tiếp được trên máy khác.
 *    Lúc đăng nhập, tiến độ đã học trên trình duyệt (khi chưa đăng nhập) được gộp vào tài khoản.
 * Nếu trình duyệt chặn bộ nhớ (chế độ ẩn danh…) trang vẫn chạy bình thường.
 */
const KEY = 'dong-chay-lich-su:tien-do:v1';
const SAVE_DELAY = 700;

function loadGuest() {
  try {
    const raw = window.localStorage.getItem(KEY);
    return raw ? sanitizeProgress(JSON.parse(raw)) : EMPTY_PROGRESS;
  } catch {
    return EMPTY_PROGRESS;
  }
}
function saveGuest(data) {
  try {
    window.localStorage.setItem(KEY, JSON.stringify(data));
  } catch {
    /* bộ nhớ trình duyệt không khả dụng — bỏ qua */
  }
}
function clearGuest() {
  try {
    window.localStorage.removeItem(KEY);
  } catch {
    /* bỏ qua */
  }
}

const ProgressContext = createContext(null);

export function ProgressProvider({ children }) {
  const { user, ready } = useAuth();
  const userId = user?.id ?? null;
  // owner: tiến độ này thuộc về ai (null = khách) — tránh ghi nhầm tiến độ tài khoản vào trình duyệt khi đăng xuất.
  // rev: tăng mỗi lần người học thay đổi tiến độ, để biết khi nào cần lưu lên máy chủ.
  const [state, setState] = useState(() => ({ owner: null, rev: 0, data: loadGuest() }));
  const [sync, setSync] = useState('local'); // local | loading | saving | saved | error
  const savedRev = useRef(0);
  const pending = useRef(null);
  const saveChain = useRef(Promise.resolve()); // gửi lần lượt, lần sau không bao giờ bị lần trước ghi đè
  const stateRef = useRef(state);
  stateRef.current = state;

  // Đăng nhập / đăng xuất: nạp tiến độ của đúng người
  useEffect(() => {
    if (!ready) return undefined;
    if (!userId) {
      savedRev.current = 0;
      setState({ owner: null, rev: 0, data: loadGuest() });
      setSync('local');
      return undefined;
    }
    let alive = true;
    const startRev = stateRef.current.rev;
    setSync('loading');
    (async () => {
      try {
        let { progress } = await api('/progress');
        const guest = loadGuest();
        if (!isEmptyProgress(guest)) {
          // Gộp phần đã học khi chưa đăng nhập vào tài khoản, rồi xóa khỏi trình duyệt
          ({ progress } = await api('/progress', { method: 'PUT', body: { progress: mergeProgress(guest, progress) } }));
          clearGuest();
        }
        if (!alive) return;
        savedRev.current = 0;
        // Nếu người học đã kịp thay đổi gì trong lúc đang nạp thì gộp lại (rev 1 → sẽ được lưu), không làm mất
        setState((s) =>
          s.rev > startRev
            ? { owner: userId, rev: 1, data: mergeProgress(s.data, progress) }
            : { owner: userId, rev: 0, data: progress },
        );
        setSync('saved');
      } catch {
        if (alive) setSync('error');
      }
    })();
    return () => {
      alive = false;
    };
  }, [ready, userId]);

  // Khách: lưu trên trình duyệt
  useEffect(() => {
    if (state.owner === null && !userId && ready) saveGuest(state.data);
  }, [state, userId, ready]);

  // Đã đăng nhập: lưu lên máy chủ (gom các thay đổi liên tiếp thành một lần gửi)
  useEffect(() => {
    if (!userId || state.owner !== userId || state.rev <= savedRev.current) return undefined;
    const { rev, data } = state;
    pending.current = data;
    setSync('saving');
    const t = setTimeout(() => {
      saveChain.current = saveChain.current.then(async () => {
        try {
          await api('/progress', { method: 'PUT', body: { progress: data } });
          savedRev.current = Math.max(savedRev.current, rev);
          if (pending.current === data) pending.current = null;
          if (stateRef.current.rev <= savedRev.current) setSync('saved');
        } catch {
          setSync('error');
        }
      });
    }, SAVE_DELAY);
    return () => clearTimeout(t);
  }, [state, userId]);

  // Đóng trang khi còn thay đổi chưa gửi: gửi nốt
  useEffect(() => {
    const flush = () => {
      if (userId && pending.current) {
        api('/progress', { method: 'PUT', body: { progress: pending.current }, keepalive: true }).catch(() => {});
        pending.current = null;
      }
    };
    window.addEventListener('pagehide', flush);
    return () => window.removeEventListener('pagehide', flush);
  }, [userId]);

  // Tiến độ đang hiển thị khớp người đang đăng nhập chưa (owner) — nếu chưa thì chỉ đổi trên màn hình,
  // tránh ghi lẫn giữa khách và tài khoản trong lúc đang nạp.
  const change = useCallback(
    (fn) => setState((s) => ({ owner: s.owner, rev: s.rev + 1, data: fn(s.data) })),
    [],
  );

  const setLearned = useCallback(
    (slug, value) =>
      change((d) => {
        const learned = { ...d.learned };
        if (value) learned[slug] = learned[slug] || Date.now();
        else delete learned[slug];
        return { ...d, learned };
      }),
    [change],
  );

  const saveQuiz = useCallback(
    (slug, score, total) =>
      change((d) => {
        const prev = d.quiz[slug];
        const best = prev ? Math.max(prev.best, score) : score;
        const passed = score / total >= 0.8;
        const learned = passed ? { ...d.learned, [slug]: d.learned[slug] || Date.now() } : d.learned;
        return { learned, quiz: { ...d.quiz, [slug]: { best, last: score, total, at: Date.now() } } };
      }),
    [change],
  );

  const reset = useCallback(() => change(() => EMPTY_PROGRESS), [change]);

  const value = useMemo(
    () => ({
      learned: state.data.learned,
      quiz: state.data.quiz,
      learnedCount: Object.keys(state.data.learned).length,
      isLearned: (slug) => Boolean(state.data.learned[slug]),
      setLearned,
      saveQuiz,
      reset,
      account: user,
      sync,
    }),
    [state, setLearned, saveQuiz, reset, user, sync],
  );

  return <ProgressContext.Provider value={value}>{children}</ProgressContext.Provider>;
}

export function useProgress() {
  const ctx = useContext(ProgressContext);
  if (!ctx) throw new Error('useProgress phải nằm trong ProgressProvider');
  return ctx;
}
