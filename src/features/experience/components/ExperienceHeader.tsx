import boardingPass from '@/assets/decor/boarding-pass.svg';
import { PATHS } from '@/app/paths';
import { APPLY_SCHEDULE } from '@/shared/constants/schedule';
import Breadcrumb, { type Crumb } from '@/shared/ui/Breadcrumb';

export default function ExperienceHeader({
  breadcrumb = [{ label: '경험 등록', to: PATHS.experienceNew() }, { label: '경험 등록' }],
  title = '경험 등록',
  description = '다녀온 경험을 공유하면 다른 지원자의 스펙 관리에 도움이 돼요.',
}: {
  breadcrumb?: Crumb[];
  title?: string;
  description?: string;
}) {
  return (
    <header className="relative flex items-end lg:h-[150px]">
      <div className="flex flex-col gap-1.5">
        <Breadcrumb items={breadcrumb} />
        <h1 className="text-[30px] font-bold sm:text-[38px]">{title}</h1>
        <p className="text-ink-muted text-[17px] sm:text-[19px]">{description}</p>
      </div>
      <div aria-hidden className="absolute -top-4 right-0 hidden w-[411px] 2xl:block">
        <img src={boardingPass} alt="" width={411} height={198} />
        {/* 학기는 마감일 상수를 따라감 */}
        <span className="text-ink-sub absolute top-[134px] left-[26px] origin-left rotate-[4deg] text-[12px] font-bold tracking-wide">
          EXCHANGE · {APPLY_SCHEDULE.semester.replace('학기', '')}
        </span>
      </div>
    </header>
  );
}
