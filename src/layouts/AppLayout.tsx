import { Navigate, Outlet, useLocation } from 'react-router';
import { hasToken } from '@/shared/api/token';
import { PATHS } from '@/app/paths';
import Sidebar from './Sidebar';

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
    <div className="flex min-h-screen">
      <Sidebar />
      <main className="flex-1 px-14 py-11">
        <Outlet />
      </main>
    </div>
  );
}
