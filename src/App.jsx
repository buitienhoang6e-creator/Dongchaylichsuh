import { lazy, Suspense, useEffect } from 'react';
import { Route, Routes, useLocation } from 'react-router-dom';
import Navbar from './components/Navbar.jsx';
import Footer from './components/Footer.jsx';
import Home from './pages/Home.jsx';
import Overview from './pages/Overview.jsx';
import HistoryIntro from './pages/HistoryIntro.jsx';
import TableOfContents from './pages/TableOfContents.jsx';
import Learn from './pages/Learn.jsx';
import VietnamHistory from './pages/VietnamHistory.jsx';
import WorldHistory from './pages/WorldHistory.jsx';
import EventDetail from './pages/EventDetail.jsx';
import MapPage from './pages/MapPage.jsx';
import Account from './pages/Account.jsx';
import { useScrollReveal } from './lib/motion.jsx';
import NotFound from './pages/NotFound.jsx';

// Hai trang nặng chỉ tải khi người học mở tới
const Simulation = lazy(() => import('./pages/Simulation.jsx'));
const AITeacher = lazy(() => import('./pages/AITeacher.jsx'));

function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
}

function PageLoading() {
  return (
    <div className="page-loading" role="status">
      <span className="spinner" aria-hidden="true" />
      Đang tải…
    </div>
  );
}

export default function App() {
  const { pathname } = useLocation();
  const immersive = pathname.startsWith('/mo-phong/');
  useScrollReveal();

  return (
    <>
      <a className="skip-link" href="#noi-dung">
        Bỏ qua thanh điều hướng
      </a>
      <ScrollToTop />
      {!immersive && <Navbar />}
      <main id="noi-dung">
        <Suspense fallback={<PageLoading />}>
          {/* Mỗi lần đổi trang, khung trang mới hiện lên nhẹ nhàng (trừ trang mô phỏng 3D toàn màn hình) */}
          <div key={pathname} className={immersive ? undefined : 'route-view'}>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/tong-quan" element={<Overview />} />
            <Route path="/gioi-thieu" element={<HistoryIntro />} />
            <Route path="/muc-luc" element={<TableOfContents />} />
            <Route path="/hoc-tap" element={<Learn />} />
            <Route path="/hoc-tap/viet-nam" element={<VietnamHistory />} />
            <Route path="/hoc-tap/the-gioi" element={<WorldHistory />} />
            <Route path="/su-kien/:slug" element={<EventDetail />} />
            <Route path="/mo-phong/:slug" element={<Simulation />} />
            <Route path="/ban-do" element={<MapPage />} />
            <Route path="/giang-vien-ai" element={<AITeacher />} />
            <Route path="/tai-khoan" element={<Account />} />
            <Route path="/dang-nhap" element={<Account />} />
            <Route path="/dang-ky" element={<Account initialMode="register" />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
          </div>
        </Suspense>
      </main>
      {!immersive && <Footer />}
    </>
  );
}
