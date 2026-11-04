import { useParams, useSearchParams } from 'react-router';
import Placeholder from '@/shared/ui/Placeholder';
import type { SchoolTab } from '@/app/paths';

const TABS: { key: SchoolTab; label: string }[] = [
  { key: 'official', label: '공식 정보' },
  { key: 'spec', label: '합격 스펙' },
  { key: 'courses', label: '과목/인정 사례' },
  { key: 'reports', label: '귀국보고서' },
];

export default function SchoolDetailPage() {
  const { universityId } = useParams();
  const [params, setParams] = useSearchParams();
  const tab = TABS.find((t) => t.key === params.get('tab'))?.key ?? 'official';

  return (
    <div className="flex flex-col gap-8">
      <Placeholder
        title={`학교 상세 (${universityId})`}
        owner="윤지"
        figma="유윤지 - 디자인 / 학교 상세 - *"
      />
      <div className="border-line flex gap-9 border-b">
        {TABS.map((t) => (
          <button
            key={t.key}
            onClick={() => setParams({ tab: t.key }, { replace: true })}
            className={`pb-3 ${tab === t.key ? 'border-primary border-b-[3px] font-semibold' : 'text-ink-muted'}`}
          >
            {t.label}
          </button>
        ))}
      </div>
      <p className="text-ink-muted">TODO: {tab} 탭 내용</p>
    </div>
  );
}
