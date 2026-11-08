import { Navigate, Outlet, useLocation } from 'react-router';
import { motion } from 'motion/react';
import { hasToken } from '@/shared/api/token';
import { PATHS } from '@/app/paths';
import { DESKTOP_QUERY, useMediaQuery } from '@/shared/hooks/useMediaQuery';
import Sidebar, { MobileNav } from './Sidebar';
import bgTile from '@/assets/decor/bg-tile.svg';

// 개발 서버에서만 로그인 없이 확인 (.env의 VITE_SKIP_AUTH=true)
const SKIP_AUTH = import.meta.env.DEV && import.meta.env.VITE_SKIP_AUTH === 'true';

export default function AppLayout() {
  const location = useLocation();
  const desktop = useMediaQuery(DESKTOP_QUERY);

  if (!SKIP_AUTH && !hasToken()) {
    return (
      <Navigate to={PATHS.login} replace state={{ from: location.pathname + location.search }} />
    );
  }

  return (
    <div className="bg-page relative isolate flex min-h-screen flex-col xl:flex-row">
      <div
        aria-hidden
        className="pointer-events-none fixed inset-0 -z-10 bg-cover bg-center opacity-70"
        style={{ backgroundImage: `url("${bgTile}")` }}
      />
      {desktop ? <Sidebar /> : <MobileNav />}
      <main className="min-w-0 flex-1 px-4 py-6 sm:px-8 sm:py-8 xl:px-14 xl:py-11">
        {/* 탭(?tab=) 이동은 제외,pathname만 key로 사용 */}
        <motion.div
          key={location.pathname}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25, ease: 'easeOut' }}
        >
          <Outlet />
        </motion.div>
      </main>
    </div>
  );
}
