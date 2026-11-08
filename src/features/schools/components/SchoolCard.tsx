import { useNavigate } from 'react-router';
import { PATHS } from '@/app/paths';
import Badge from '@/shared/ui/Badge';
import Icon from '@/shared/ui/Icon';
import type { Eligibility, SchoolSummary } from '../mock';
import BookmarkStar from './BookmarkStar';

const ELIGIBILITY_BADGE = {
  ELIGIBLE: { tone: 'accent', label: '가능' },
  INELIGIBLE: { tone: 'danger', label: '불가' },
  UNKNOWN: { tone: 'caution', label: '확인 필요' },
} as const satisfies Record<Eligibility, object>;

const CHANGE_LABEL = { NEW: '신규', QUOTA_CHANGED: '인원 변경' };

export default function SchoolCard({
  school,
  onToggleBookmark,
}: {
  school: SchoolSummary;
  onToggleBookmark: () => void;
}) {
  const navigate = useNavigate();
  const open = () => navigate(PATHS.schoolDetail(school.universityId));
  const closed = !school.recruiting;
  const eligibility = ELIGIBILITY_BADGE[school.eligibility];

  return (
    <div
      role="link"
      tabIndex={0}
      onClick={open}
      onKeyDown={(e) => e.key === 'Enter' && open()}
      className={`rounded-card flex cursor-pointer flex-wrap items-center gap-x-5 gap-y-4 p-5 sm:flex-nowrap sm:p-6 ${
        closed ? 'bg-fill' : 'shadow-card hover:bg-panel bg-white'
      }`}
    >
      <div
        className={`text-ink-sub hidden size-[62px] shrink-0 items-center justify-center rounded-[21px] sm:flex ${
          closed ? 'bg-white' : 'bg-panel'
        }`}
      >
        <Icon name="globe" size={31} />
      </div>

      <div className="flex min-w-0 flex-1 basis-full flex-col gap-2 sm:basis-auto">
        <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1.5">
          <h3 className={`text-[22px] font-bold sm:text-[26px] ${closed ? 'text-ink-muted' : ''}`}>
            {school.name}
          </h3>
          <span className="text-ink-muted text-[18px]">{school.country}</span>
          {closed ? (
            <Badge tone="white">이번 학기 모집 없음</Badge>
          ) : (
            <>
              <Badge tone={eligibility.tone}>{eligibility.label}</Badge>
              {school.changeType && <Badge>{CHANGE_LABEL[school.changeType]}</Badge>}
            </>
          )}
        </div>

        {closed ? (
          <p className="text-ink-muted text-[16px] font-medium">
            이번 학기에는 모집하지 않는 학교예요
          </p>
        ) : (
          <>
            <p className="text-ink-sub text-[16px] sm:text-[18px]">
              주요 조건: {school.conditionSummary ?? '-'}
            </p>
            <div className="flex flex-wrap items-center gap-2.5">
              {school.hasExperience && (
                <span className="border-line-soft bg-panel text-ink-sub flex h-8 items-center gap-1.5 rounded-[8px] border px-2.5 text-[15px] font-semibold">
                  <Icon name="check" />
                  경험 데이터 있음
                </span>
              )}
              {school.eligibility === 'INELIGIBLE' && school.ineligibleReason && (
                <span className="text-danger text-[16px] font-medium">
                  불가 사유: {school.ineligibleReason}
                </span>
              )}
              {school.eligibility === 'UNKNOWN' && (
                <span className="text-ink-muted text-[16px] font-medium">
                  기준 정보가 없어요. 학교 공식 공지를 확인해 주세요
                </span>
              )}
            </div>
          </>
        )}
      </div>

      {!closed && (
        <div className="flex w-full items-center gap-4 sm:w-auto">
          <div className="flex flex-1 shrink-0 flex-col gap-1 sm:items-end">
            <p className="text-ink-sub text-[19px] font-semibold whitespace-nowrap">
              모집 인원 {school.recruitCount}명
            </p>
            <p className="text-ink-muted text-[16px] whitespace-nowrap">기준일 {school.baseDate}</p>
          </div>
          <button
            type="button"
            aria-label={school.bookmarked ? '찜 해제' : '찜하기'}
            aria-pressed={school.bookmarked}
            onClick={(e) => {
              e.stopPropagation();
              onToggleBookmark();
            }}
            className={`flex size-[53px] shrink-0 items-center justify-center rounded-[14px] transition-transform active:scale-90 ${
              school.bookmarked
                ? 'bg-accent-soft text-primary'
                : 'border-line-soft text-ink-sub hover:bg-panel border bg-white'
            }`}
          >
            <BookmarkStar on={school.bookmarked} />
          </button>
        </div>
      )}
    </div>
  );
}
