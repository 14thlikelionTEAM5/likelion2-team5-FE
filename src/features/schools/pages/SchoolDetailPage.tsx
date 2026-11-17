import { useNavigate, useParams, useSearchParams } from 'react-router';
import { PATHS, type SchoolTab } from '@/app/paths';
import Button from '@/shared/ui/Button';
import EmptyState from '@/shared/ui/EmptyState';
import { Stagger, StaggerItem } from '@/shared/ui/Stagger';
import Tabs from '@/shared/ui/Tabs';
import CoursesTab from '../components/CoursesTab';
import OfficialTab from '../components/OfficialTab';
import ReportsTab from '../components/ReportsTab';
import SchoolHeader from '../components/SchoolHeader';
import SpecTab from '../components/SpecTab';
import { useMyProfile } from '@/shared/api/users';
import {
  useToggleUniversityBookmark,
  useUniversity,
  useUniversityAdmissionReports,
  useUniversityCourseCases,
  useUniversityCourses,
  useUniversityReturnReports,
} from '@/shared/api/universities';
import {
  toAdmissionReport,
  toCourse,
  toCourseCase,
  toOfficialInfo,
  toReturnReport,
  toSchoolDetail,
} from '../types';

const TABS: { value: SchoolTab; label: string }[] = [
  { value: 'official', label: '공식 정보' },
  { value: 'spec', label: '합격 스펙' },
  { value: 'courses', label: '과목/인정 사례' },
  { value: 'reports', label: '귀국보고서' },
];

export default function SchoolDetailPage() {
  const { universityId } = useParams();
  const navigate = useNavigate();
  const [params, setParams] = useSearchParams();

  const id = Number(universityId);
  const detail = useUniversity(id);
  const { data: profile } = useMyProfile();
  const reports = useUniversityReturnReports(id);
  const courses = useUniversityCourses(id);
  const cases = useUniversityCourseCases(id);
  const specs = useUniversityAdmissionReports(id);
  const bookmark = useToggleUniversityBookmark();

  if (detail.isPending && Number.isInteger(id) && id > 0) {
    return (
      <p className="text-ink-muted py-16 text-center text-[19px]">학교 정보를 불러오는 중이에요</p>
    );
  }

  if (!detail.data) {
    return (
      <EmptyState
        title="학교를 찾을 수 없어요"
        description="주소가 바뀌었거나 삭제된 학교예요."
        action={<Button onClick={() => navigate(PATHS.schools)}>협정교 목록으로</Button>}
      />
    );
  }

  const school = toSchoolDetail(detail.data);
  const caseRows = cases.data ?? [];
  const me = {
    gpa: profile?.gpa ?? undefined,
    scores: Object.fromEntries((profile?.languageScores ?? []).map((s) => [s.testType, s.score])),
  };
  const tab = TABS.find((t) => t.value === params.get('tab'))?.value ?? 'official';
  const tabLoading =
    (tab === 'spec' && specs.isPending) ||
    (tab === 'courses' && (courses.isPending || cases.isPending)) ||
    (tab === 'reports' && reports.isPending);

  return (
    <Stagger className="flex flex-col gap-8">
      <StaggerItem>
        <SchoolHeader
          school={school}
          onToggleBookmark={() => bookmark.mutate({ universityId: id, on: !school.bookmarked })}
        />
      </StaggerItem>

      <StaggerItem>
        <Tabs items={TABS} value={tab} onChange={(v) => setParams({ tab: v }, { replace: true })} />
      </StaggerItem>

      {/* key로 탭이 바뀔 때마다 내용이 다시 차례로 나옴 */}
      {tabLoading ? (
        <p className="text-ink-muted py-16 text-center text-[19px]">불러오는 중이에요</p>
      ) : tab === 'official' ? (
        <OfficialTab key={tab} info={toOfficialInfo(detail.data, profile)} />
      ) : tab === 'spec' ? (
        <SpecTab
          key={tab}
          universityId={school.universityId}
          reports={(specs.data ?? []).map(toAdmissionReport)}
          me={me}
        />
      ) : tab === 'courses' ? (
        <CoursesTab
          key={tab}
          universityId={school.universityId}
          studyPlanId={detail.data.studyPlanId}
          courses={(courses.data ?? []).map(toCourse)}
          cases={caseRows.map(toCourseCase)}
        />
      ) : (
        <ReportsTab
          key={tab}
          universityId={school.universityId}
          reports={(reports.data ?? []).map(toReturnReport)}
        />
      )}
    </Stagger>
  );
}
