import { useEffect, useState, type ReactNode } from 'react';
import { useNavigate, useParams } from 'react-router';
import { PATHS, type ExperienceKind } from '@/app/paths';
import { useLeaveConfirm } from '@/shared/hooks/useLeaveConfirm';
import Badge from '@/shared/ui/Badge';
import Button from '@/shared/ui/Button';
import Card from '@/shared/ui/Card';
import EmptyState from '@/shared/ui/EmptyState';
import Icon from '@/shared/ui/Icon';
import InfoNote from '@/shared/ui/InfoNote';
import { Stagger, StaggerItem } from '@/shared/ui/Stagger';
import CreditFormFields from '../components/CreditFormFields';
import ExperienceHeader from '../components/ExperienceHeader';
import LeaveConfirmModal from '../components/LeaveConfirmModal';
import ReportFormFields from '../components/ReportFormFields';
import SpecFormFields from '../components/SpecFormFields';
import {
  creditError,
  getMyCredit,
  getMyReport,
  getMySpec,
  getSchoolOption,
  MY_CONDITION,
  updateCredit,
  updateReport,
  updateSpec,
  type CreditForm,
  type MyCredit,
  type MyReport,
  type MySpec,
  type ReportForm,
  type SpecForm,
} from '../mock';

const TITLE: Record<ExperienceKind, string> = {
  report: '귀국보고서',
  spec: '합격 / 탈락 스펙',
  credit: '학점 인정 결과',
};
const BADGE: Record<ExperienceKind, string> = {
  report: '귀국보고서',
  spec: '합격/탈락 스펙',
  credit: '학점 인정 결과',
};

// TODO: /experiences/{kind}/{id} 조회·수정 연결
const findRecord = (kind: string | undefined, id: number) =>
  kind === 'spec'
    ? getMySpec(id)
    : kind === 'report'
      ? getMyReport(id)
      : kind === 'credit'
        ? getMyCredit(id)
        : null;

export default function ExperienceEditPage() {
  const navigate = useNavigate();
  const params = useParams();
  const kind = params.kind as ExperienceKind;
  const record = findRecord(kind, Number(params.id));

  if (!record) {
    return (
      <EmptyState
        title="수정할 내역을 찾을 수 없어요"
        description="이미 삭제됐거나 주소가 잘못됐어요"
        action={<Button onClick={() => navigate(PATHS.experienceMine)}>내 등록 내역 보기</Button>}
      />
    );
  }

  return (
    <Stagger className="flex flex-col gap-8">
      <StaggerItem>
        <ExperienceHeader
          breadcrumb={[
            { label: '경험 등록', to: PATHS.experienceNew() },
            { label: '내 등록 내역', to: PATHS.experienceMine },
            { label: '수정' },
          ]}
          title={`${TITLE[kind]} 수정`}
          description="등록한 내용을 고치면 다른 지원자에게도 바로 반영돼요."
        />
      </StaggerItem>

      <StaggerItem>
        <div className="rounded-card shadow-card flex items-center gap-3 bg-white px-7 py-5">
          <Badge tone="primary">{BADGE[kind]}</Badge>
          <span className="text-[22px] font-bold">
            {getSchoolOption(record.universityId)?.name ?? '-'}
          </span>
          <span className="bg-line h-5 w-px" />
          <span className="text-ink-sub text-[19px]">
            {record.year}-{record.semester}학기
          </span>
          <div className="flex-1" />
          <span className="text-ink-muted flex items-center gap-1.5 text-[16px]">
            <Icon name="lock" size={17} />
            학교·학기는 수정할 수 없어요
          </span>
        </div>
      </StaggerItem>

      <StaggerItem>
        {kind === 'spec' && <SpecEdit record={record as MySpec} />}
        {kind === 'report' && <ReportEdit record={record as MyReport} />}
        {kind === 'credit' && <CreditEdit record={record as MyCredit} />}
      </StaggerItem>
    </Stagger>
  );
}

// 저장하면 확인 팝업 없이 내 등록 내역으로 이동
function useEditForm<T>(initial: T) {
  const navigate = useNavigate();
  const [value, setValue] = useState(initial);
  const [error, setError] = useState('');
  const [saved, setSaved] = useState(false);
  const dirty = !saved && JSON.stringify(value) !== JSON.stringify(initial);
  const blocker = useLeaveConfirm(dirty);

  useEffect(() => {
    if (saved) navigate(PATHS.experienceMine);
  }, [saved, navigate]);

  return {
    value,
    onChange: (v: T) => {
      setValue(v);
      setError('');
    },
    error,
    setError,
    blocker,
    finish: () => setSaved(true),
    cancel: () => navigate(PATHS.experienceMine),
  };
}

type EditForm = ReturnType<typeof useEditForm>;

function EditCard({
  form,
  onSave,
  children,
}: {
  form: Pick<EditForm, 'error' | 'cancel' | 'blocker'>;
  onSave: () => void;
  children: ReactNode;
}) {
  return (
    <Card className="flex flex-col gap-7">
      {children}
      <div className="flex items-center justify-end gap-3">
        {form.error && <span className="text-danger text-[16px] font-medium">{form.error}</span>}
        <Button variant="secondary" onClick={form.cancel}>
          취소
        </Button>
        <Button onClick={onSave}>저장</Button>
      </div>
      <LeaveConfirmModal blocker={form.blocker} />
    </Card>
  );
}

function SpecEdit({ record }: { record: MySpec }) {
  // 등록 당시 학점·전공, 어학은 내 조건에 등록 당시 점수를 합침
  const condition = {
    gpa: record.gpa,
    majorType: record.majorType,
    scores: [
      ...MY_CONDITION.scores.filter((s) => s.exam !== record.exam),
      { exam: record.exam, score: record.score },
    ],
  };
  const form = useEditForm<SpecForm>({
    result: record.result,
    exam: record.exam,
    note: record.note,
  });

  const onSave = () => {
    const score = condition.scores.find((s) => s.exam === form.value.exam)?.score;
    if (score === undefined) return form.setError('어학 성적을 골라 주세요');
    updateSpec(record.id, form.value, score);
    form.finish();
  };

  return (
    <EditCard form={form} onSave={onSave}>
      <SpecFormFields value={form.value} onChange={form.onChange} condition={condition} />
    </EditCard>
  );
}

function ReportEdit({ record }: { record: MyReport }) {
  const form = useEditForm<ReportForm>(record.form);

  const onSave = () => {
    updateReport(record.id, form.value);
    form.finish();
  };

  return (
    <EditCard form={form} onSave={onSave}>
      <InfoNote>귀국보고서는 원문을 저장하지 않아 항목만 수정할 수 있어요</InfoNote>
      <ReportFormFields value={form.value} onChange={form.onChange} />
    </EditCard>
  );
}

function CreditEdit({ record }: { record: MyCredit }) {
  const courses = getMyReport(record.reportId)?.form.courses ?? [];
  const form = useEditForm<CreditForm>({
    courseKey: String(record.courseKey),
    creditType: record.creditType,
    homeCourse: record.homeCourse ?? null,
    credits: String(record.credits),
  });

  const onSave = () => {
    const error = creditError(form.value);
    if (error) return form.setError(error);
    const course = courses.find((c) => String(c.key) === form.value.courseKey);
    updateCredit(record.id, form.value, course?.name ?? record.foreignCourse);
    form.finish();
  };

  return (
    <EditCard form={form} onSave={onSave}>
      <CreditFormFields value={form.value} onChange={form.onChange} courses={courses} />
    </EditCard>
  );
}
