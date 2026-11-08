import { useEffect, useState } from 'react';
import { Link, NavLink, useLocation, useNavigate } from 'react-router';
import { useQueryClient } from '@tanstack/react-query';
import { AnimatePresence, motion } from 'motion/react';
import { PATHS } from '@/app/paths';
import { clearToken } from '@/shared/api/token';
import { MAJOR_TYPE_LABEL, type MajorType } from '@/shared/types/enums';
import Icon, { type IconName } from '@/shared/ui/Icon';
import logo from '@/assets/decor/logo-passhufs.svg';
import sidebarBg from '@/assets/decor/sidebar-bg.svg';
import ddayCardBg from '@/assets/decor/dday-card.svg';
import { APPLY_SCHEDULE, getDaysLeft } from '@/shared/constants/schedule';

// TODO: useMe() 연결
const MOCK_USER = { nickname: 'OOO', majorType: 'PRIMARY' as MajorType };

type SubItem = { label: string; to: string; match: (path: string) => boolean };
type MenuItem = {
  label: string;
  icon: IconName;
  to: string;
  match: (path: string) => boolean;
  children?: SubItem[];
};

const MENU: MenuItem[] = [
  { label: '홈', icon: 'home', to: PATHS.home, match: (p) => p === PATHS.home },
  {
    label: '협정교',
    icon: 'globe',
    to: PATHS.schools,
    match: (p) => p.startsWith(PATHS.schools),
    children: [
      {
        label: '협정교 목록',
        to: PATHS.schools,
        match: (p) => p.startsWith(PATHS.schools) && !p.startsWith(PATHS.favorites),
      },
      { label: '찜 페이지', to: PATHS.favorites, match: (p) => p.startsWith(PATHS.favorites) },
    ],
  },
  {
    label: '경험 등록',
    icon: 'pen',
    to: PATHS.experienceNew(),
    match: (p) => p.startsWith('/experience'),
    children: [
      {
        label: '경험 등록하기',
        to: PATHS.experienceNew(),
        match: (p) => p.startsWith('/experience/new'),
      },
      {
        label: '내 등록 내역',
        to: PATHS.experienceMine,
        match: (p) => p.startsWith(PATHS.experienceMine) || p.startsWith('/experience/edit'),
      },
    ],
  },
  { label: '수강계획', icon: 'cal', to: PATHS.plans, match: (p) => p.startsWith(PATHS.plans) },
  { label: '마이페이지', icon: 'user', to: PATHS.mypage, match: (p) => p.startsWith(PATHS.mypage) },
];

function MenuLink({ item, path }: { item: MenuItem; path: string }) {
  const active = item.match(path);
  const open = active && !!item.children;

  const textColor = active ? 'text-white' : 'text-ink-sub';

  return (
    <div>
      <NavLink
        to={item.to}
        className={`rounded-control short:h-14 short:text-xl relative flex h-16 items-center gap-3 px-4 text-2xl font-semibold transition-colors ${textColor} ${active ? '' : 'hover:bg-panel'}`}
      >
        {active && (
          <motion.span
            layoutId="nav-pill"
            layoutDependency={path}
            className="rounded-control bg-primary absolute inset-0 -z-10"
            transition={{ type: 'spring', stiffness: 500, damping: 40 }}
          />
        )}
        <Icon name={item.icon} />
        <span className="flex-1">{item.label}</span>
        {item.children && (
          <motion.span animate={{ rotate: open ? 90 : 0 }} className="flex">
            <Icon name="right" className={open ? '' : 'text-ink-muted'} />
          </motion.span>
        )}
      </NavLink>

      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
            className="overflow-hidden"
          >
            <div className="border-line mt-1.5 ml-3.5 flex flex-col gap-1 border-l-2 pl-3.5">
              {item.children!.map((child) => {
                const childActive = child.match(path);
                return (
                  <NavLink
                    key={child.label}
                    to={child.to}
                    className={`short:h-11 relative flex h-12 items-center rounded-[10px] px-3.5 text-lg transition-colors ${
                      childActive ? 'text-primary font-semibold' : 'text-ink-muted hover:bg-panel'
                    }`}
                  >
                    {childActive && (
                      <motion.span
                        layoutId="nav-sub-pill"
                        layoutDependency={path}
                        className="bg-accent-soft absolute inset-0 -z-10 rounded-[10px]"
                        transition={{ type: 'spring', stiffness: 500, damping: 40 }}
                      />
                    )}
                    {child.label}
                  </NavLink>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function DdayCard() {
  const daysLeft = getDaysLeft();

  return (
    <div
      className="relative h-[227px] w-[272px] overflow-hidden rounded-[27px] bg-cover px-6 pt-7"
      style={{ backgroundImage: `url("${ddayCardBg}")` }}
    >
      <p className="text-[17px] font-semibold text-[#9fd3dc]">{APPLY_SCHEDULE.semester} 교환학생</p>
      <p className="mt-2 text-xl font-medium text-white">
        {daysLeft === null ? '지원이 마감됐어요' : '지원 마감까지'}
      </p>
      <p className="text-[56px] leading-tight font-extrabold text-white">
        {daysLeft === null ? '마감' : daysLeft === 0 ? 'D-DAY' : `D-${daysLeft}`}
      </p>
      <Link
        to={PATHS.mypage}
        className="text-primary absolute bottom-[18px] left-6 flex h-[50px] w-[222px] items-center justify-center gap-1.5 rounded-[14px] bg-white text-lg font-bold"
      >
        내 스펙 점검하기
        <Icon name="arrowR" size={18} />
      </Link>
    </div>
  );
}

function UserCard({ onLogout }: { onLogout: () => void }) {
  return (
    <div className="rounded-panel bg-panel flex w-full flex-col gap-3.5 p-4">
      <div className="flex items-center gap-3">
        <div className="bg-primary flex size-12 items-center justify-center rounded-[20px] text-xl font-bold text-white">
          {MOCK_USER.nickname.charAt(0)}
        </div>
        <div className="flex flex-col gap-0.5">
          <p className="text-ink text-xl font-semibold">{MOCK_USER.nickname} 님</p>
          <p className="text-ink-muted text-base">{MAJOR_TYPE_LABEL[MOCK_USER.majorType]}</p>
        </div>
      </div>
      <button
        onClick={onLogout}
        className="border-line-soft text-ink-sub hover:bg-panel flex h-[52px] w-full items-center justify-center gap-2 rounded-[10px] border bg-white text-lg font-medium"
      >
        <Icon name="logout" />
        로그아웃
      </button>
    </div>
  );
}

// inDrawer: 스크롤되는 메뉴 안에서는 화면이 낮아도 D-day 카드를 보여줌
function SidebarBody({ inDrawer = false }: { inDrawer?: boolean }) {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const logout = () => {
    clearToken();
    queryClient.clear(); // 다른 계정 데이터가 남지 않게
    navigate(PATHS.login, { replace: true });
  };

  return (
    <div className="short:gap-6 short:pt-7 short:pb-6 relative flex min-h-full flex-col justify-between gap-8 px-6 pt-10 pb-8">
      <div className="short:gap-6 flex flex-col gap-9">
        <Link to={PATHS.home} className="short:h-12 flex h-[60px] items-center justify-center pr-3">
          <img src={logo} alt="PassHUFS" className="short:h-12 h-[60px] w-auto" />
        </Link>
        <nav className="isolate flex flex-col gap-1.5">
          {MENU.map((item) => (
            <MenuLink key={item.label} item={item} path={pathname} />
          ))}
        </nav>
      </div>

      <div className="flex flex-col gap-4">
        <div className={inDrawer ? '' : 'tiny:hidden'}>
          <DdayCard />
        </div>
        <UserCard onLogout={logout} />
      </div>
    </div>
  );
}

function SidebarBg() {
  return (
    <img
      src={sidebarBg}
      alt=""
      className="pointer-events-none absolute inset-0 size-full object-cover object-bottom opacity-70"
    />
  );
}

export default function Sidebar() {
  return (
    <aside className="border-line-soft sticky top-0 h-screen w-80 shrink-0 overflow-hidden border-r bg-white">
      <SidebarBg />
      <SidebarBody />
    </aside>
  );
}

// 좁은 화면: 위쪽 바 + 메뉴 버튼으로 여는 사이드바
export function MobileNav() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false);
    document.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [open]);

  return (
    <>
      <header className="border-line-soft sticky top-0 z-40 flex h-16 items-center justify-between border-b bg-white/90 px-4 backdrop-blur sm:px-8">
        <Link to={PATHS.home} className="flex items-center">
          <img src={logo} alt="PassHUFS" className="h-9 w-auto" />
        </Link>
        <button
          type="button"
          aria-label="메뉴 열기"
          aria-expanded={open}
          onClick={() => setOpen(true)}
          className="text-ink-sub hover:bg-panel flex size-11 items-center justify-center rounded-[12px] transition-colors"
        >
          <Icon name="menu" />
        </button>
      </header>

      <AnimatePresence>
        {open && (
          <motion.div
            className="bg-ink/40 fixed inset-0 z-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={() => setOpen(false)}
          >
            <motion.aside
              role="dialog"
              aria-modal="true"
              aria-label="메뉴"
              className="relative h-dvh w-80 max-w-[85vw] overflow-hidden bg-white"
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', stiffness: 400, damping: 40 }}
              onClick={(e) => e.stopPropagation()}
              // 메뉴를 누르면 닫힘
              onClickCapture={(e) => (e.target as HTMLElement).closest('a') && setOpen(false)}
            >
              <SidebarBg />
              <button
                type="button"
                aria-label="메뉴 닫기"
                onClick={() => setOpen(false)}
                className="text-ink-muted hover:bg-panel absolute top-3 right-3 z-10 flex size-10 items-center justify-center rounded-full"
              >
                <Icon name="x" />
              </button>
              {/* 배경은 고정하고 내용만 스크롤 */}
              <div className="relative h-full overflow-y-auto">
                <SidebarBody inDrawer />
              </div>
            </motion.aside>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
