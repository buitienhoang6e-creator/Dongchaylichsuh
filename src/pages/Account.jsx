import { useId, useState } from 'react';
import { Link } from 'react-router-dom';
import { AlertCircle, Check, Cloud, CloudOff, LoaderCircle, LogOut, ShieldCheck } from 'lucide-react';
import { EVENTS } from '../data/events.js';
import { useAuth } from '../lib/auth.jsx';
import { useProgress } from '../lib/progress.jsx';

const PASSWORD_MIN = 8;

function Field({ label, hint, ...props }) {
  const id = useId();
  return (
    <div className="form-field">
      <label htmlFor={id}>{label}</label>
      <input id={id} className="form-input" aria-describedby={hint ? `${id}-hint` : undefined} {...props} />
      {hint && (
        <p id={`${id}-hint`} className="form-hint">
          {hint}
        </p>
      )}
    </div>
  );
}

function Message({ kind, children }) {
  if (!children) return null;
  return (
    <p className={`form-message is-${kind}`} role={kind === 'error' ? 'alert' : 'status'}>
      {kind === 'error' ? <AlertCircle size={18} aria-hidden="true" /> : <Check size={18} aria-hidden="true" />}
      <span>{children}</span>
    </p>
  );
}

// ───────────── Chưa đăng nhập: đăng nhập / đăng ký ─────────────

function AuthForms({ initialMode, onDone }) {
  const { login, register } = useAuth();
  const { learnedCount } = useProgress();
  const [mode, setMode] = useState(initialMode);
  const [form, setForm] = useState({ username: '', displayName: '', password: '', confirm: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const isRegister = mode === 'register';

  const update = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));
  const switchMode = (m) => {
    setMode(m);
    setError('');
  };

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    if (isRegister) {
      if (form.password.length < PASSWORD_MIN) return setError(`Mật khẩu cần ít nhất ${PASSWORD_MIN} ký tự.`);
      if (form.password !== form.confirm) return setError('Hai lần nhập mật khẩu chưa khớp nhau.');
    }
    setBusy(true);
    try {
      const user = isRegister
        ? await register({ username: form.username, password: form.password, displayName: form.displayName })
        : await login(form.username, form.password);
      onDone(
        isRegister
          ? `Đã tạo tài khoản. Chào mừng ${user.displayName}!`
          : `Đăng nhập thành công. Chào ${user.displayName}!`,
      );
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="account-layout">
      <section className="account-card" aria-label={isRegister ? 'Đăng ký tài khoản' : 'Đăng nhập'}>
        <div className="account-tabs" role="tablist" aria-label="Chọn đăng nhập hoặc đăng ký">
          <button type="button" role="tab" aria-selected={!isRegister} className={`tab ${!isRegister ? 'is-active' : ''}`} onClick={() => switchMode('login')}>
            Đăng nhập
          </button>
          <button type="button" role="tab" aria-selected={isRegister} className={`tab ${isRegister ? 'is-active' : ''}`} onClick={() => switchMode('register')}>
            Đăng ký
          </button>
        </div>

        <form className="account-form" onSubmit={submit} noValidate>
          <Field
            label="Tên đăng nhập"
            name="username"
            autoComplete="username"
            autoCapitalize="none"
            spellCheck={false}
            required
            maxLength={24}
            value={form.username}
            onChange={update('username')}
            hint={isRegister ? '3–24 ký tự: chữ cái không dấu, chữ số, dấu chấm hoặc gạch dưới. Ví dụ: an.nguyen_8a' : undefined}
          />
          {isRegister && (
            <Field
              label="Tên hiển thị (không bắt buộc)"
              name="displayName"
              autoComplete="nickname"
              maxLength={40}
              value={form.displayName}
              onChange={update('displayName')}
              hint="Có thể dùng biệt danh, không cần ghi họ tên thật."
            />
          )}
          <Field
            label="Mật khẩu"
            name="password"
            type={showPassword ? 'text' : 'password'}
            autoComplete={isRegister ? 'new-password' : 'current-password'}
            required
            maxLength={128}
            value={form.password}
            onChange={update('password')}
            hint={isRegister ? `Ít nhất ${PASSWORD_MIN} ký tự. Đừng dùng lại mật khẩu của tài khoản khác.` : undefined}
          />
          {isRegister && (
            <Field
              label="Nhập lại mật khẩu"
              name="confirm"
              type={showPassword ? 'text' : 'password'}
              autoComplete="new-password"
              required
              maxLength={128}
              value={form.confirm}
              onChange={update('confirm')}
            />
          )}
          <label className="form-check">
            <input type="checkbox" checked={showPassword} onChange={(e) => setShowPassword(e.target.checked)} />
            Hiện mật khẩu
          </label>

          <Message kind="error">{error}</Message>

          <button type="submit" className="btn btn-primary btn-block" disabled={busy || !form.username || !form.password}>
            {busy && <LoaderCircle size={18} className="spin" aria-hidden="true" />}
            {isRegister ? 'Tạo tài khoản' : 'Đăng nhập'}
          </button>
        </form>
      </section>

      <aside className="account-aside">
        <h2>Vì sao nên có tài khoản?</h2>
        <ul>
          <li>Tiến độ học và điểm trắc nghiệm được lưu trên máy chủ, không mất khi xóa dữ liệu trình duyệt.</li>
          <li>Học tiếp ở máy khác: ở trường, ở nhà hay trên điện thoại.</li>
          {learnedCount > 0 && (
            <li>
              <strong>{learnedCount} sự kiện</strong> bạn đã học trên trình duyệt này sẽ được gộp vào tài khoản.
            </li>
          )}
        </ul>
        <p className="account-privacy">
          <ShieldCheck size={18} aria-hidden="true" />
          <span>
            Trang chỉ lưu tên đăng nhập, tên hiển thị và tiến độ học — không cần email hay số điện thoại. Mật khẩu được mã
            hóa trước khi lưu. Nếu quên mật khẩu, hãy nhờ thầy cô quản lý trang web đặt lại.
          </span>
        </p>
      </aside>
    </div>
  );
}

// ───────────── Đã đăng nhập: thông tin tài khoản ─────────────

const SYNC = {
  loading: { icon: LoaderCircle, spin: true, text: 'Đang tải tiến độ từ tài khoản…' },
  saving: { icon: LoaderCircle, spin: true, text: 'Đang lưu vào tài khoản…' },
  saved: { icon: Cloud, text: 'Tiến độ đã được lưu vào tài khoản.' },
  error: { icon: CloudOff, text: 'Chưa kết nối được máy chủ để lưu tiến độ. Kiểm tra mạng rồi tải lại trang.' },
  local: { icon: Cloud, text: '' },
};

function ChangePassword() {
  const { changePassword } = useAuth();
  const [form, setForm] = useState({ current: '', next: '', confirm: '' });
  const [msg, setMsg] = useState({ kind: '', text: '' });
  const [busy, setBusy] = useState(false);
  const update = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));

  const submit = async (e) => {
    e.preventDefault();
    if (form.next.length < PASSWORD_MIN) return setMsg({ kind: 'error', text: `Mật khẩu mới cần ít nhất ${PASSWORD_MIN} ký tự.` });
    if (form.next !== form.confirm) return setMsg({ kind: 'error', text: 'Hai lần nhập mật khẩu mới chưa khớp nhau.' });
    setBusy(true);
    try {
      await changePassword(form.current, form.next);
      setForm({ current: '', next: '', confirm: '' });
      setMsg({ kind: 'success', text: 'Đã đổi mật khẩu. Các thiết bị khác đang đăng nhập sẽ phải đăng nhập lại.' });
    } catch (err) {
      setMsg({ kind: 'error', text: err.message });
    } finally {
      setBusy(false);
    }
  };

  return (
    <details className="account-details">
      <summary>Đổi mật khẩu</summary>
      <form className="account-form" onSubmit={submit} noValidate>
        <Field label="Mật khẩu hiện tại" type="password" autoComplete="current-password" value={form.current} onChange={update('current')} />
        <Field label="Mật khẩu mới" type="password" autoComplete="new-password" value={form.next} onChange={update('next')} />
        <Field label="Nhập lại mật khẩu mới" type="password" autoComplete="new-password" value={form.confirm} onChange={update('confirm')} />
        <Message kind={msg.kind || 'success'}>{msg.text}</Message>
        <button type="submit" className="btn btn-ghost" disabled={busy || !form.current || !form.next}>
          Lưu mật khẩu mới
        </button>
      </form>
    </details>
  );
}

function DeleteAccount() {
  const { deleteAccount } = useAuth();
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    if (!window.confirm('Xóa vĩnh viễn tài khoản và toàn bộ tiến độ học đã lưu? Không thể khôi phục lại.')) return;
    setBusy(true);
    setError('');
    try {
      await deleteAccount(password);
    } catch (err) {
      setError(err.message);
      setBusy(false);
    }
  };

  return (
    <details className="account-details is-danger">
      <summary>Xóa tài khoản</summary>
      <form className="account-form" onSubmit={submit} noValidate>
        <p>Tài khoản, tiến độ học và điểm trắc nghiệm đã lưu sẽ bị xóa vĩnh viễn khỏi máy chủ.</p>
        <Field label="Nhập mật khẩu để xác nhận" type="password" autoComplete="current-password" value={password} onChange={(e) => setPassword(e.target.value)} />
        <Message kind="error">{error}</Message>
        <button type="submit" className="btn btn-danger" disabled={busy || !password}>
          Xóa vĩnh viễn tài khoản
        </button>
      </form>
    </details>
  );
}

function AccountPanel({ notice }) {
  const { user, logout } = useAuth();
  const { learnedCount, quiz, sync } = useProgress();
  const [busy, setBusy] = useState(false);
  const pct = Math.round((learnedCount / EVENTS.length) * 100);
  const quizCount = Object.keys(quiz).length;
  const s = SYNC[sync] || SYNC.saved;
  const SyncIcon = s.icon;

  return (
    <div className="account-layout">
      <section className="account-card" aria-label="Thông tin tài khoản">
        <Message kind="success">{notice}</Message>
        <div className="account-who">
          <span className="account-avatar" aria-hidden="true">
            {user.displayName.trim().charAt(0).toUpperCase()}
          </span>
          <div>
            <p className="account-name">{user.displayName}</p>
            <p className="account-meta">
              @{user.username} · tham gia ngày {new Date(user.createdAt).toLocaleDateString('vi-VN')}
            </p>
          </div>
        </div>

        <div className="account-progress">
          <div className="meter" role="progressbar" aria-valuemin={0} aria-valuemax={EVENTS.length} aria-valuenow={learnedCount} aria-label="Tiến độ học">
            <span style={{ width: `${pct}%` }} />
          </div>
          <p>
            Đã học <strong>{learnedCount}/{EVENTS.length}</strong> sự kiện · đã làm trắc nghiệm <strong>{quizCount}</strong> sự kiện
          </p>
          {s.text && (
            <p className={`account-sync ${sync === 'error' ? 'is-error' : ''}`} role="status">
              <SyncIcon size={16} className={s.spin ? 'spin' : undefined} aria-hidden="true" />
              {s.text}
            </p>
          )}
        </div>

        <div className="account-actions">
          <Link to="/hoc-tap/viet-nam" className="btn btn-primary">
            {learnedCount ? 'Học tiếp' : 'Bắt đầu học'}
          </Link>
          <button
            type="button"
            className="btn btn-ghost"
            disabled={busy}
            onClick={async () => {
              setBusy(true);
              await logout().catch(() => {});
            }}
          >
            <LogOut size={17} aria-hidden="true" /> Đăng xuất
          </button>
        </div>
        <p className="form-hint">Sau khi đăng xuất, tiến độ không hiện trên máy này nữa nhưng vẫn được giữ trong tài khoản.</p>
      </section>

      <aside className="account-aside">
        <h2>Cài đặt tài khoản</h2>
        <ChangePassword />
        <DeleteAccount />
      </aside>
    </div>
  );
}

// ───────────── Trang ─────────────

export default function Account({ initialMode = 'login' }) {
  const { user, ready } = useAuth();
  const [notice, setNotice] = useState('');

  return (
    <div className="page account-page">
      <div className="container">
        <header className="page-head">
          <p className="crumbs">
            <Link to="/">Trang chủ</Link> / <span>Tài khoản</span>
          </p>
          <h1>{user ? 'Tài khoản của bạn' : 'Lưu tiến độ học vào tài khoản'}</h1>
          <p className="page-lead">
            {user
              ? 'Tiến độ học và điểm trắc nghiệm của bạn được lưu tự động, học tiếp được trên mọi thiết bị.'
              : 'Đăng nhập hoặc tạo tài khoản miễn phí để không mất tiến độ học và học tiếp trên máy khác.'}
          </p>
        </header>

        {!ready ? (
          <div className="page-loading" role="status">
            <span className="spinner" aria-hidden="true" />
            Đang tải…
          </div>
        ) : user ? (
          <AccountPanel notice={notice} />
        ) : (
          <AuthForms
            initialMode={initialMode}
            onDone={(msg) => {
              setNotice(msg);
              window.scrollTo({ top: 0 });
            }}
          />
        )}
      </div>
    </div>
  );
}
