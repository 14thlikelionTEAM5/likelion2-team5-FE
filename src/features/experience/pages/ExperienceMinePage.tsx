import { useState } from 'react';
import { useNavigate } from 'react-router';
import { PATHS, type ExperienceKind } from '@/app/paths';
import { CREDIT_TYPE } from '@/features/schools/components/CoursesTab';
import { LANGUAGE_EXAMS } from '@/features/schools/components/SchoolFilterCard';
import { ADMISSION_RESULT_LABEL, MAJOR_TYPE_LABEL } from '@/shared/types/enums';
import Badge from '@/shared/ui/Badge';
import Button from '@/shared/ui/Button';
import EmptyState from '@/shared/ui/EmptyState';
import { Stagger, StaggerItem } from '@/shared/ui/Stagger';
import Table from '@/shared/ui/Table';
import DeleteModal from '../components/DeleteModal';
import MySection from '../components/MySection';
import { deleteExperience, getMyExperiences, getSchoolOption, reportFields } from '../mock';

const schoolName = (id: number) => getSchoolOption(id)?.name ?? '-';
const term = (e: { year: number; semester: number }) => `${e.year}-${e.semester}학기`;
const examLabel = (v: string) => LANGUAGE_EXAMS.find((e) => e.value === v)?.label ?? v;

export default function ExperienceMinePage() {
  const navigate = useNavigate();
  // TODO: /experiences/me 연결
  const [mine, setMine] = useState(getMyExperiences);
  const [target, setTarget] = useState<{ kind: ExperienceKind; id: number } | null>(null);
  const [deleteOpen, setDeleteOpen] = useState(false);

  const total = mine.spec.length + mine.report.length + mine.credit.length;
  const linkedCount =
    target?.kind === 'report' ? mine.credit.filter((c) => c.reportId === target.id).length : 0;

  const onDelete = () => {
    if (!target) return;
    // TODO: DELETE /experiences/{kind}/{id}
    deleteExperience(target.kind, target.id);
    setMine(getMyExperiences());
    setDeleteOpen(false);
  };

  const manage = (kind: ExperienceKind) => ({
    key: 'manage',
    header: <span className="block text-center">관리</span>,
    width: 170,
    render: (row: { id: number }) => (
      <div className="flex justify-center gap-2">
        <Button
          variant="secondary"
          size="xs"
          onClick={() => navigate(PATHS.experienceEdit(kind, row.id))}
        >
          수정
        </Button>
        <Button
          variant="subtle"
          size="xs"
          onClick={() => {
            setTarget({ kind, id: row.id });
            setDeleteOpen(true);
          }}
        >
          삭제
        </Button>
      </div>
    ),
  });

  return (
    <Stagger className="flex flex-col gap-8">
      <StaggerItem>
        <header className="flex items-end justify-between">
          <div className="flex flex-col gap-1.5">
            <p className="text-ink-muted text-[18px] font-medium">경험 등록 › 내 등록 내역</p>
            <h1 className="text-[38px] font-bold">내 등록 내역</h1>
            <p className="text-ink-muted text-[19px]">
              등록한 경험을 확인하고 수정하거나 삭제할 수 있어요.
            </p>
          </div>
          <Button icon="pen" onClick={() => navigate(PATHS.experienceNew())}>
            새 경험 등록
          </Button>
        </header>
      </StaggerItem>

      {total === 0 ? (
        <StaggerItem>
          <EmptyState
            title="아직 등록한 경험이 없어요"
            description="다녀온 경험을 등록하면 다른 지원자의 스펙 관리에 도움이 돼요"
            action={
              <Button icon="pen" onClick={() => navigate(PATHS.experienceNew())}>
                경험 등록하기
              </Button>
            }
          />
        </StaggerItem>
      ) : (
        <>
          <StaggerItem>
            <MySection
              icon="chart"
              title="합격·탈락 스펙"
              count={mine.spec.length}
              emptyText="아직 등록한 합격·탈락 스펙이 없어요"
              onRegister={() => navigate(PATHS.experienceNew('spec'))}
            >
              <Table
                columns={[
                  {
                    key: 'result',
                    header: '결과',
                    width: 110,
                    render: (e) => (
                      <Badge tone={e.result === 'PASS' ? 'accent' : 'neutral'}>
                        {ADMISSION_RESULT_LABEL[e.result]}
                      </Badge>
                    ),
                  },
                  {
                    key: 'school',
                    header: '교환교',
                    render: (e) => (
                      <span className="font-medium">{schoolName(e.universityId)}</span>
                    ),
                  },
                  { key: 'term', header: '학기', width: 160, render: term },
                  {
                    key: 'exam',
                    header: '어학',
                    width: 170,
                    render: (e) =>
                      `${examLabel(e.exam)} ${e.exam === 'IELTS' ? e.score.toFixed(1) : e.score}`,
                  },
                  {
                    key: 'gpa',
                    header: '누적 학점',
                    width: 150,
                    render: (e) => `${e.gpa.toFixed(1)} / 4.5`,
                  },
                  {
                    key: 'major',
                    header: '전공 구분',
                    width: 160,
                    render: (e) => MAJOR_TYPE_LABEL[e.majorType],
                  },
                  manage('spec'),
                ]}
                rows={mine.spec}
                rowKey={(e) => e.id}
              />
            </MySection>
          </StaggerItem>

          <StaggerItem>
            <MySection
              icon="file"
              title="귀국보고서"
              count={mine.report.length}
              emptyText="아직 등록한 귀국보고서가 없어요"
              onRegister={() => navigate(PATHS.experienceNew('report'))}
            >
              <Table
                columns={[
                  {
                    key: 'school',
                    header: '교환교',
                    width: 280,
                    render: (e) => (
                      <span className="font-medium">{schoolName(e.universityId)}</span>
                    ),
                  },
                  { key: 'term', header: '학기', width: 160, render: term },
                  {
                    key: 'fields',
                    header: '구조화 항목',
                    width: 240,
                    render: (e) => reportFields(e.form).join(' · '),
                  },
                  {
                    key: 'summary',
                    header: 'AI 요약',
                    render: (e) => (
                      <span className="text-ink-sub block truncate" title={e.form.summary}>
                        {e.form.summary}
                      </span>
                    ),
                  },
                  manage('report'),
                ]}
                rows={mine.report}
                rowKey={(e) => e.id}
              />
            </MySection>
          </StaggerItem>

          <StaggerItem>
            <MySection
              icon="book"
              title="학점 인정 사례"
              count={mine.credit.length}
              emptyText="아직 등록한 학점 인정 사례가 없어요"
              onRegister={() => navigate(PATHS.experienceNew('credit'))}
            >
              <Table
                columns={[
                  {
                    key: 'school',
                    header: '교환교',
                    width: 260,
                    render: (e) => (
                      <span className="font-medium">{schoolName(e.universityId)}</span>
                    ),
                  },
                  { key: 'term', header: '학기', width: 150, render: term },
                  {
                    key: 'foreign',
                    header: '대상 과목',
                    render: (e) => <span className="block truncate">{e.foreignCourse}</span>,
                  },
                  {
                    key: 'type',
                    header: '구분',
                    width: 110,
                    render: (e) => (
                      <Badge tone={CREDIT_TYPE[e.creditType].tone}>
                        {CREDIT_TYPE[e.creditType].label}
                      </Badge>
                    ),
                  },
                  {
                    key: 'home',
                    header: '본교 인정 과목',
                    width: 190,
                    render: (e) => e.homeCourse?.name ?? <span className="text-ink-faint">-</span>,
                  },
                  { key: 'credits', header: '인정 학점', width: 120, render: (e) => e.credits },
                  manage('credit'),
                ]}
                rows={mine.credit}
                rowKey={(e) => e.id}
              />
            </MySection>
          </StaggerItem>
        </>
      )}

      <DeleteModal
        open={deleteOpen}
        linkedCount={linkedCount}
        onClose={() => setDeleteOpen(false)}
        onDelete={onDelete}
      />
    </Stagger>
  );
}
