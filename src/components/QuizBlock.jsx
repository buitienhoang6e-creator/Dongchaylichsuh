import { useEffect, useMemo, useState } from 'react';
import { Check, RotateCcw, X } from 'lucide-react';
import { useProgress } from '../lib/progress.jsx';
import { Confetti } from '../lib/motion.jsx';

/** Trắc nghiệm ôn tập: chọn đáp án là biết đúng sai ngay, kèm giải thích. */
export default function QuizBlock({ event }) {
  const { quiz, saveQuiz } = useProgress();
  const [answers, setAnswers] = useState({});
  const questions = event.quiz;
  const total = questions.length;
  const answered = Object.keys(answers).length;
  const score = useMemo(
    () => questions.reduce((s, q, i) => s + (answers[i] === q.answer ? 1 : 0), 0),
    [answers, questions],
  );
  const done = answered === total;
  const record = quiz[event.slug];
  const [celebrate, setCelebrate] = useState(false);

  useEffect(() => {
    setAnswers({});
    setCelebrate(false);
  }, [event.slug]);

  useEffect(() => {
    if (!done) return undefined;
    saveQuiz(event.slug, score, total);
    // Đạt điểm "đã học" thì bắn pháo giấy ăn mừng trong khoảng 3 giây
    if (score / total < 0.8) return undefined;
    setCelebrate(true);
    const t = setTimeout(() => setCelebrate(false), 3200);
    return () => clearTimeout(t);
    // chỉ chạy đúng một lần khi vừa làm xong
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [done]);

  const choose = (qi, oi) => {
    if (answers[qi] !== undefined) return;
    setAnswers((a) => ({ ...a, [qi]: oi }));
  };

  return (
    <section className="quiz" aria-labelledby="quiz-title">
      <div className="quiz-head">
        <div>
          <h2 id="quiz-title">Trắc nghiệm ôn tập</h2>
          <p className="quiz-sub">
            {total} câu hỏi. Chọn một đáp án để xem ngay đúng hay sai. Đạt từ {Math.ceil(total * 0.8)} câu trở lên,
            sự kiện được đánh dấu “đã học”.
          </p>
        </div>
        {record && (
          <p className="quiz-record">
            Điểm cao nhất của bạn: <strong>{record.best}/{record.total}</strong>
          </p>
        )}
      </div>

      <ol className="quiz-list">
        {questions.map((q, qi) => {
          const picked = answers[qi];
          const locked = picked !== undefined;
          return (
            <li key={q.q} className="quiz-item">
              <p className="quiz-q" id={`q-${event.slug}-${qi}`}>
                {q.q}
              </p>
              <div className="quiz-options" role="group" aria-labelledby={`q-${event.slug}-${qi}`}>
                {q.options.map((opt, oi) => {
                  const isRight = oi === q.answer;
                  let state = '';
                  if (locked && isRight) state = 'is-right';
                  else if (locked && oi === picked) state = 'is-wrong';
                  return (
                    <button
                      key={opt}
                      type="button"
                      className={`quiz-option ${state}`}
                      onClick={() => choose(qi, oi)}
                      disabled={locked}
                      aria-pressed={picked === oi}
                    >
                      <span className="quiz-letter" aria-hidden="true">
                        {String.fromCharCode(65 + oi)}
                      </span>
                      <span>{opt}</span>
                      {state === 'is-right' && <Check size={18} className="quiz-mark" aria-label="Đáp án đúng" />}
                      {state === 'is-wrong' && <X size={18} className="quiz-mark" aria-label="Chưa đúng" />}
                    </button>
                  );
                })}
              </div>
              {locked && (
                <p className={`quiz-explain ${picked === q.answer ? 'is-right' : 'is-wrong'}`} role="status">
                  <strong>{picked === q.answer ? 'Chính xác. ' : 'Chưa đúng. '}</strong>
                  {q.explain}
                </p>
              )}
            </li>
          );
        })}
      </ol>

      <div className="quiz-foot" aria-live="polite">
        {done ? (
          <>
            <p className="quiz-score">
              Bạn trả lời đúng <strong>{score}/{total}</strong> câu.{' '}
              {score / total >= 0.8 ? 'Sự kiện đã được đánh dấu “đã học”.' : 'Hãy xem lại video rồi thử lần nữa nhé.'}
            </p>
            <button type="button" className="btn btn-ghost" onClick={() => setAnswers({})}>
              <RotateCcw size={16} aria-hidden="true" /> Làm lại
            </button>
          </>
        ) : (
          <p className="quiz-progress">
            Đã trả lời {answered}/{total} câu
          </p>
        )}
      </div>
      {celebrate && <Confetti />}
    </section>
  );
}
