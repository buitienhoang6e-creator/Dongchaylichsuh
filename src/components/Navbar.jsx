import { useEffect, useState } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import { Menu, Moon, Sun, UserRound, X } from 'lucide-react';
import Logo from './Logo.jsx';
import { useAuth } from '../lib/auth.jsx';
import { useTheme } from '../lib/theme.js';

const LINKS = [
  { to: '/tong-quan', label: 'Tổng quan' },
  { to: '/gioi-thieu', label: 'Giới thiệu lịch sử' },
  { to: '/muc-luc', label: 'Mục lục tiến trình' },
  { to: '/giang-vien-ai', label: 'Giảng viên AI' },
];

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { pathname } = useLocation();
  const { user } = useAuth();
  const [theme, toggleTheme] = useTheme();
  const dark = theme === 'dark';
  const accountLabel = user ? user.displayName : 'Đăng nhập';

  useEffect(() => setOpen(false), [pathname]);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    if (!open) return undefined;
    const onKey = (e) => e.key === 'Escape' && setOpen(false);
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open]);

  return (
    <header className={`nav ${scrolled ? 'is-scrolled' : ''} ${open ? 'is-open' : ''}`}>
      <div className="container nav-inner">
        <Link to="/" className="nav-brand" aria-label="Dòng chảy lịch sử — Trang chủ">
          <Logo size={38} />
          <span className="nav-brand-text">Dòng chảy lịch sử</span>
        </Link>

        <nav className="nav-links" aria-label="Điều hướng chính">
          {LINKS.map((l) => (
            <NavLink key={l.to} to={l.to} className="nav-link">
              {l.label}
            </NavLink>
          ))}
        </nav>

        <button
          type="button"
          className="nav-theme"
          onClick={toggleTheme}
          aria-label={dark ? 'Chuyển sang giao diện sáng' : 'Chuyển sang giao diện tối'}
          title={dark ? 'Giao diện sáng' : 'Giao diện tối'}
        >
          {dark ? <Sun size={19} aria-hidden="true" /> : <Moon size={19} aria-hidden="true" />}
        </button>

        <NavLink
          to="/tai-khoan"
          className="nav-account"
          title={user ? `Tài khoản: ${user.displayName}` : 'Đăng nhập hoặc đăng ký để lưu tiến độ học'}
        >
          <UserRound size={18} aria-hidden="true" />
          <span className="nav-account-name">{accountLabel}</span>
        </NavLink>

        <Link to="/hoc-tap" className="btn btn-primary nav-cta">
          Bắt đầu học
        </Link>

        <button
          type="button"
          className="nav-toggle"
          aria-expanded={open}
          aria-controls="nav-mobile"
          aria-label={open ? 'Đóng menu' : 'Mở menu'}
          onClick={() => setOpen((v) => !v)}
        >
          {open ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      <div id="nav-mobile" className="nav-mobile" hidden={!open}>
        <nav aria-label="Điều hướng trên điện thoại">
          {LINKS.map((l) => (
            <NavLink key={l.to} to={l.to} className="nav-mobile-link">
              {l.label}
            </NavLink>
          ))}
          <NavLink to="/tai-khoan" className="nav-mobile-link nav-mobile-account">
            <UserRound size={18} aria-hidden="true" />
            {user ? `Tài khoản: ${user.displayName}` : 'Đăng nhập / Đăng ký'}
          </NavLink>
          <Link to="/hoc-tap" className="btn btn-primary btn-block">
            Bắt đầu học
          </Link>
        </nav>
      </div>
    </header>
  );
}
