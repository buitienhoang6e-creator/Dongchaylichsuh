import { useEffect, useMemo, useRef, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { RotateCcw, Send, Square, X } from 'lucide-react';
import Logo from '../components/Logo.jsx';
import { getEventBySlug } from '../data/events.js';
import { renderMarkdown } from '../lib/markdown.js';

const SUGGESTIONS = [
  'Vì sao thành Cổ Loa được xây theo hình xoáy trôn ốc?',
  'Lời thề của Hai Bà Trưng ở Hát Môn nói gì?',
  'So sánh trận Bạch Đằng năm 938 và năm 1288',
  'Chiến lược “tiên phát chế nhân” của Lý Thường Kiệt là gì?',
  'Tóm tắt Cách mạng tháng Tám trong 5 ý',
  'Vì sao chiến thắng Điện Biên Phủ được gọi là “chấn động địa cầu”?',
];

const MAX_LEN = 1500;

async function streamChat({ messages, eventSlug, signal, onText }) {
  const res = await fetch('/api/chat', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ messages, eventSlug }),
    signal,
  });
  if (!res.ok || !res.body) {
    let msg = 'Giảng viên AI đang bận. Bạn thử lại sau ít phút nhé.';
    try {
      const data = await res.json();
      if (data?.error) msg = data.error;
    } catch {
      /* phản hồi không phải JSON */
    }
    throw new Error(msg);
  }
  const reader = res.body.getReader();
  const decoder = new TextDecoder();
  let buffer = '';
  for (;;) {
    const { value, done } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });
    const parts = buffer.split('\n\n');
    buffer = parts.pop();
    for (const part of parts) {
      const line = part.split('\n').find((l) => l.startsWith('data: '));
      if (!line) continue;
      const evt = JSON.parse(line.slice(6));
      if (evt.type === 'text') onText(evt.text);
      else if (evt.type === 'error') throw new Error(evt.message);
    }
  }
}

export default function AITeacher() {
  const [params, setParams] = useSearchParams();
  const eventSlug = params.get('su-kien');
  const contextEvent = useMemo(() => (eventSlug ? getEventBySlug(eventSlug) : null), [eventSlug]);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const abortRef = useRef(null);
  const listRef = useRef(null);
  const inputRef = useRef(null);
  const askedFromUrl = useRef(false);

  useEffect(() => {
    listRef.current?.scrollTo({ top: listRef.current.scrollHeight });
  }, [messages]);

  useEffect(() => () => abortRef.current?.abort(), []);

  const send = async (text) => {
    const content = text.trim().slice(0, MAX_LEN);
    if (!content || busy) return;
    setError('');
    const next = [...messages, { role: 'user', content }];
    setMessages([...next, { role: 'assistant', content: '' }]);
    setInput('');
    setBusy(true);
    const controller = new AbortController();
    abortRef.current = controller;
    try {
      await streamChat({
        messages: next,
        eventSlug: contextEvent?.slug,
        signal: controller.signal,
        onText: (t) =>
          setMessages((m) => {
            const copy = m.slice();
            copy[copy.length - 1] = { role: 'assistant', content: copy[copy.length - 1].content + t };
            return copy;
          }),
      });
    } catch (err) {
      if (err.name !== 'AbortError') {
        setError(err.message);
        // bỏ câu trả lời rỗng nếu lỗi ngay từ đầu
        setMessages((m) => (m[m.length - 1]?.content ? m : m.slice(0, -1)));
      }
    } finally {
      setBusy(false);
      abortRef.current = null;
      inputRef.current?.focus();
    }
  };

  // Câu hỏi truyền qua đường dẫn (?hoi=...) từ trang chủ
  useEffect(() => {
    const q = params.get('hoi');
    if (q && !askedFromUrl.current) {
      askedFromUrl.current = true;
      send(q);
      params.delete('hoi');
      setParams(params, { replace: true });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const stop = () => abortRef.current?.abort();
  const clear = () => {
    stop();
    setMessages([]);
    setError('');
  };

  const onKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      send(input);
    }
  };

  const suggestions = contextEvent
    ? [
        `Tóm tắt ${contextEvent.title.toLowerCase()} trong 5 ý`,
        `Vì sao ${contextEvent.title.toLowerCase()} có ý nghĩa quan trọng?`,
        `Nhân vật nào tiêu biểu nhất trong ${contextEvent.title.toLowerCase()}?`,
      ]
    : SUGGESTIONS;

  return (
    <div className="page ai-page">
      <div className="container ai-layout">
        <aside className="ai-intro">
          <p className="crumbs">
            <Link to="/">Trang chủ</Link> / <span>Giảng viên AI</span>
          </p>
          <div className="ai-avatar">
            <Logo size={56} />
            <div>
              <h1>Giảng viên AI</h1>
              <p>Người bạn ôn bài môn Lịch sử</p>
            </div>
          </div>
          <p>
            Hỏi về bất kỳ sự kiện, nhân vật hay thời kỳ nào trong lịch sử Việt Nam. Giảng viên trả lời bằng tiếng Việt,
            bám sát sách giáo khoa và gợi ý khung phim liên quan để bạn học tiếp.
          </p>
          <p className="ai-disclaimer">
            AI đôi khi có thể nhầm. Với các mốc năm, con số quan trọng, hãy đối chiếu lại với sách giáo khoa.
          </p>
        </aside>

        <section className="chat" aria-label="Khung trò chuyện">
          {contextEvent && (
            <div className="chat-context">
              <span>
                Đang hỏi về: <strong>{contextEvent.title}</strong>
              </span>
              <button
                type="button"
                className="icon-btn icon-btn-sm"
                aria-label="Bỏ ngữ cảnh sự kiện"
                onClick={() => {
                  params.delete('su-kien');
                  setParams(params, { replace: true });
                }}
              >
                <X size={16} />
              </button>
            </div>
          )}

          <div className="chat-list" ref={listRef} aria-live="polite">
            {messages.length === 0 ? (
              <div className="chat-empty">
                <p>Bắt đầu bằng một câu hỏi, hoặc chọn một gợi ý:</p>
                <ul className="chat-suggestions">
                  {suggestions.map((s) => (
                    <li key={s}>
                      <button type="button" onClick={() => send(s)}>
                        {s}
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            ) : (
              messages.map((m, i) => (
                <div key={i} className={`msg msg-${m.role}`}>
                  {m.role === 'assistant' ? (
                    <>
                      <span className="msg-who">Giảng viên AI</span>
                      {m.content ? (
                        <div
                          className="msg-body prose-chat"
                          // nội dung đã được thoát HTML trong renderMarkdown
                          dangerouslySetInnerHTML={{ __html: renderMarkdown(m.content) }}
                        />
                      ) : (
                        <div className="msg-body typing" aria-label="Giảng viên đang trả lời">
                          <span />
                          <span />
                          <span />
                        </div>
                      )}
                    </>
                  ) : (
                    <>
                      <span className="msg-who">Bạn</span>
                      <div className="msg-body">{m.content}</div>
                    </>
                  )}
                </div>
              ))
            )}
          </div>

          {error && (
            <p className="chat-error" role="alert">
              {error}
            </p>
          )}

          <form
            className="chat-form"
            onSubmit={(e) => {
              e.preventDefault();
              send(input);
            }}
          >
            <label htmlFor="chat-input" className="sr-only">
              Câu hỏi của bạn
            </label>
            <textarea
              id="chat-input"
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value.slice(0, MAX_LEN))}
              onKeyDown={onKeyDown}
              placeholder="Nhập câu hỏi về lịch sử… (Enter để gửi, Shift + Enter để xuống dòng)"
              rows={2}
            />
            <div className="chat-form-actions">
              {messages.length > 0 && (
                <button type="button" className="btn btn-ghost btn-sm" onClick={clear}>
                  <RotateCcw size={15} aria-hidden="true" /> Cuộc trò chuyện mới
                </button>
              )}
              {busy ? (
                <button type="button" className="btn btn-primary" onClick={stop}>
                  <Square size={15} aria-hidden="true" /> Dừng
                </button>
              ) : (
                <button type="submit" className="btn btn-primary" disabled={!input.trim()}>
                  <Send size={16} aria-hidden="true" /> Gửi câu hỏi
                </button>
              )}
            </div>
          </form>
        </section>
      </div>
    </div>
  );
}
