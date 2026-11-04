import { NavLink, useNavigate } from 'react-router';
import { useQueryClient } from '@tanstack/react-query';
import { PATHS } from '@/app/paths';
import { clearToken } from '@/shared/api/token';

type MenuItem = { label: string; to: string; children?: { label: string; to: string }[] };

const MENU: MenuItem[] = [
  { label: '홈', to: PATHS.home },
  {
    label: '협정교',
    to: PATHS.schools,
    children: [
      { label: '협정교 목록', to: PATHS.schools },
      { label: '찜 페이지', to: PATHS.favorites },
    ],
  },
  {
    label: '경험 등록',
    to: PATHS.experienceNew(),
    children: [
      { label: '경험 등록하기', to: PATHS.experienceNew() },
      { label: '내 등록 내역', to: PATHS.experienceMine },
    ],
  },
  { label: '수강계획', to: PATHS.plans },
  { label: '마이페이지', to: PATHS.mypage },
];

const linkClass = ({ isActive }: { isActive: boolean }) =>
  `block rounded-lg px-3 py-2 ${isActive ? 'bg-primary font-semibold text-white' : 'hover:bg-panel'}`;

export default function Sidebar() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const logout = () => {
    clearToken();
    queryClient.clear(); // 다른 계정 데이터가 남지 않게
    navigate(PATHS.login, { replace: true });
  };

  return (
    <aside className="flex w-80 shrink-0 flex-col bg-white p-6">
      <div className="text-accent mb-8 text-2xl font-bold">PassHUFS</div>
      <nav className="flex flex-col gap-1">
        {MENU.map((item) => (
          <div key={item.label}>
            <NavLink to={item.to} end={!!item.children} className={linkClass}>
              {item.label}
            </NavLink>
            {item.children && (
              <div className="border-line mt-1 ml-4 flex flex-col gap-1 border-l pl-2 text-sm">
                {item.children.map((c) => (
                  <NavLink key={c.label} to={c.to} end className={linkClass}>
                    {c.label}
                  </NavLink>
                ))}
              </div>
            )}
          </div>
        ))}
      </nav>
      {/* TODO: D-day 카드, 사용자 카드 */}
      <button
        onClick={logout}
        className="rounded-control border-line text-ink-sub mt-auto border py-2 text-sm"
      >
        로그아웃
      </button>
    </aside>
  );
}
