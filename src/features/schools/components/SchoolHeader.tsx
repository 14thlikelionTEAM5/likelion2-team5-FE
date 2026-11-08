import { useLocation, useNavigate } from 'react-router';
import { PATHS } from '@/app/paths';
import heroLight from '@/assets/decor/hero-light.svg';
import Icon from '@/shared/ui/Icon';
import type { SchoolDetail } from '../mock';
import BookmarkStar from './BookmarkStar';

export default function SchoolHeader({
  school,
  onToggleBookmark,
}: {
  school: SchoolDetail;
  onToggleBookmark: () => void;
}) {
  const navigate = useNavigate();
  const location = useLocation();

  // 목록에서 들어왔으면 뒤로가기 (필터 유지), 주소로 바로 들어왔으면 목록으로
  const goBack = () => (location.key === 'default' ? navigate(PATHS.schools) : navigate(-1));

  return (
    <section
      className="flex flex-col gap-4 overflow-hidden rounded-[28px] bg-cover bg-center px-10 pt-8 pb-9"
      style={{ backgroundImage: `url("${heroLight}")` }}
    >
      <p className="text-ink-muted text-[18px] font-medium">협정교 › 협정교 목록 › 학교 상세</p>

      <div className="flex items-center gap-4">
        <button
          type="button"
          aria-label="뒤로"
          onClick={goBack}
          className="border-line-soft hover:bg-panel flex size-[53px] shrink-0 items-center justify-center rounded-[14px] border bg-white"
        >
          <Icon name="arrowL" size={24} />
        </button>
        <h1 className="text-[38px] font-bold">{school.name}</h1>
        <div className="flex-1" />
        <button
          type="button"
          aria-pressed={school.bookmarked}
          onClick={onToggleBookmark}
          className={`rounded-control flex h-[54px] shrink-0 items-center gap-2 px-4 text-[18px] font-semibold transition-transform active:scale-95 ${
            school.bookmarked
              ? 'bg-accent-soft text-primary'
              : 'border-line-soft text-ink-sub hover:bg-panel border bg-white'
          }`}
        >
          <BookmarkStar on={school.bookmarked} size={24} />
          {school.bookmarked ? '찜한 학교' : '찜하기'}
        </button>
      </div>

      <div className="flex flex-wrap gap-2">
        <Tag value={school.country} />
        <Tag label="모집 인원" value={`${school.recruitCount}명`} />
        <Tag label="교환 기간" value={`${school.exchangeStart} ~ ${school.exchangeEnd}`} />
        <Tag label="기준일" value={school.baseDate} />
      </div>
    </section>
  );
}

function Tag({ label, value }: { label?: string; value: string }) {
  return (
    <span className="border-line-soft flex h-11 items-center gap-1.5 rounded-full border bg-white px-3.5 text-[18px]">
      {label && <span className="text-ink-muted">{label}</span>}
      <span className="text-ink-sub font-semibold">{value}</span>
    </span>
  );
}
