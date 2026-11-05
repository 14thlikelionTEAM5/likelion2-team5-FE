import { Navigate, Outlet, useLocation } from 'react-router';
import { motion } from 'motion/react';
import { hasToken } from '@/shared/api/token';
import { PATHS } from '@/app/paths';
import Sidebar from './Sidebar';
import bgTile from '@/assets/decor/bg-tile.svg';

// 개발 서버에서만 로그인 없이 확인 (.env의 VITE_SKIP_AUTH=true)
const SKIP_AUTH = import.meta.env.DEV && import.meta.env.VITE_SKIP_AUTH === 'true';

export default function AppLayout() {
  const location = useLocation();

  if (!SKIP_AUTH && !hasToken()) {
    return (
      <Navigate to={PATHS.login} replace state={{ from: location.pathname + location.search }} />
    );
  }

  return (
    <div
      className="bg-page flex min-h-screen bg-cover bg-fixed bg-center"
      style={{ backgroundImage: `url("${bgTile}")` }}
    >
      <Sidebar />
      <main className="flex-1 px-14 py-11">
        {/* 탭(?tab=) 이동은 제외하려고 pathname만 key로 사용 */}
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
