import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';

/**
 * Trạng thái đăng nhập của người học. Phiên đăng nhập nằm trong cookie httpOnly do máy chủ đặt,
 * nên trang chỉ cần hỏi máy chủ "tôi là ai" (/api/auth/me).
 */

/** Gọi API của máy chủ, trả về JSON; lỗi thì ném Error kèm lời nhắn tiếng Việt từ máy chủ. */
export async function api(path, { method = 'GET', body, keepalive } = {}) {
  let res;
  try {
    res = await fetch(`/api${path}`, {
      method,
      credentials: 'same-origin',
      headers: body !== undefined ? { 'Content-Type': 'application/json' } : undefined,
      body: body !== undefined ? JSON.stringify(body) : undefined,
      keepalive,
    });
  } catch {
    throw new Error('Không kết nối được máy chủ. Bạn kiểm tra mạng rồi thử lại nhé.');
  }
  let data = null;
  try {
    data = await res.json();
  } catch {
    /* phản hồi không phải JSON */
  }
  if (!res.ok) {
    const err = new Error(data?.error || 'Máy chủ đang gặp sự cố. Bạn thử lại sau ít phút nhé.');
    err.status = res.status;
    throw err;
  }
  return data;
}

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let alive = true;
    api('/auth/me')
      .then((d) => alive && setUser(d.user))
      .catch(() => {
        /* máy chủ không có chức năng tài khoản — dùng như khách */
      })
      .finally(() => alive && setReady(true));
    return () => {
      alive = false;
    };
  }, []);

  const login = useCallback(async (username, password) => {
    const d = await api('/auth/login', { method: 'POST', body: { username, password } });
    setUser(d.user);
    return d.user;
  }, []);

  const register = useCallback(async ({ username, password, displayName }) => {
    const d = await api('/auth/register', { method: 'POST', body: { username, password, displayName } });
    setUser(d.user);
    return d.user;
  }, []);

  const logout = useCallback(async () => {
    try {
      await api('/auth/logout', { method: 'POST', body: {} });
    } finally {
      setUser(null);
    }
  }, []);

  const changePassword = useCallback(
    (currentPassword, newPassword) => api('/auth/password', { method: 'POST', body: { currentPassword, newPassword } }),
    [],
  );

  const deleteAccount = useCallback(async (password) => {
    await api('/auth/account', { method: 'DELETE', body: { password } });
    setUser(null);
  }, []);

  const value = useMemo(
    () => ({ user, ready, login, register, logout, changePassword, deleteAccount }),
    [user, ready, login, register, logout, changePassword, deleteAccount],
  );
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth phải nằm trong AuthProvider');
  return ctx;
}
