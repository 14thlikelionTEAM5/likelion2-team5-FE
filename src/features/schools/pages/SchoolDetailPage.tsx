import { useState } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router';
import { PATHS, type SchoolTab } from '@/app/paths';
import Button from '@/shared/ui/Button';
import EmptyState from '@/shared/ui/EmptyState';
import Placeholder from '@/shared/ui/Placeholder';
import Tabs from '@/shared/ui/Tabs';
import OfficialTab from '../components/OfficialTab';
import SchoolHeader from '../components/SchoolHeader';
import { getMockOfficial, getMockSchool } from '../mock';

const TABS: { value: SchoolTab; label: string; figma: string }[] = [
  { value: 'official', label: '공식 정보', figma: '학교 상세 - 공식 정보' },
  { value: 'spec', label: '합격 스펙', figma: '학교 상세 - 합격 스펙' },
  { value: 'courses', label: '과목/인정 사례', figma: '학교 상세 - 과목·인정 사례' },
  { value: 'reports', label: '귀국보고서', figma: '학교 상세 - 귀국보고서' },
];

export default function SchoolDetailPage() {
  const { universityId } = useParams();
  const navigate = useNavigate();
  const [params, setParams] = useSearchParams();

  // TODO: /universities/{universityId}, /bookmarks 연결
  const [school, setSchool] = useState(() => getMockSchool(Number(universityId)));

  if (!school) {
    return (
      <EmptyState
        title="학교를 찾을 수 없어요"
        description="주소가 바뀌었거나 삭제된 학교예요."
        action={<Button onClick={() => navigate(PATHS.schools)}>협정교 목록으로</Button>}
      />
    );
  }

  // 경험 데이터가 없으면 탭 없이 공식 정보만
  const tab = school.hasExperience
    ? (TABS.find((t) => t.value === params.get('tab'))?.value ?? 'official')
    : 'official';
  const current = TABS.find((t) => t.value === tab)!;

  return (
    <div className="flex flex-col gap-8">
      <SchoolHeader
        school={school}
        onToggleBookmark={() => setSchool({ ...school, bookmarked: !school.bookmarked })}
      />

      {school.hasExperience && (
        <Tabs items={TABS} value={tab} onChange={(v) => setParams({ tab: v }, { replace: true })} />
      )}

      {tab === 'official' ? (
        <OfficialTab info={getMockOfficial(school)} />
      ) : (
        // TODO: 나머지 탭은 각 이슈에서 구현
        <Placeholder
          title={current.label}
          owner="윤지"
          figma={`유윤지 - 디자인 / ${current.figma}`}
        />
      )}
    </div>
  );
}
