import boardingPass from '@/assets/decor/boarding-pass.svg';
import { APPLY_SCHEDULE } from '@/shared/constants/schedule';

export default function ExperienceHeader() {
  return (
    <header className="relative flex h-[150px] items-end">
      <div className="flex flex-col gap-1.5">
        <p className="text-ink-muted text-[18px] font-medium">경험 등록 › 경험 등록</p>
        <h1 className="text-[38px] font-bold">경험 등록</h1>
        <p className="text-ink-muted text-[19px]">
          다녀온 경험을 공유하면 다른 지원자의 스펙 관리에 도움이 돼요.
        </p>
      </div>
      <div aria-hidden className="absolute -top-4 right-0 w-[411px]">
        <img src={boardingPass} alt="" width={411} height={198} />
        {/* 학기는 마감일 상수를 따라감 */}
        <span className="text-ink-sub absolute top-[134px] left-[26px] origin-left rotate-[4deg] text-[12px] font-bold tracking-wide">
          EXCHANGE · {APPLY_SCHEDULE.semester.replace('학기', '')}
        </span>
      </div>
    </header>
  );
}
