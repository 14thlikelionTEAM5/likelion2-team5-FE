import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router';
import { AnimatePresence, motion } from 'motion/react';
import { PATHS, type ExperienceKind } from '@/app/paths';
import { useLeaveConfirm } from '@/shared/hooks/useLeaveConfirm';
import Badge from '@/shared/ui/Badge';
import Button from '@/shared/ui/Button';
import Card from '@/shared/ui/Card';
import Icon from '@/shared/ui/Icon';
import InfoNote from '@/shared/ui/InfoNote';
import Segment from '@/shared/ui/Segment';
import Select from '@/shared/ui/Select';
import { Stagger, StaggerItem } from '@/shared/ui/Stagger';
import CompleteModal from '../components/CompleteModal';
import CreditFormFields from '../components/CreditFormFields';
import ConsentModal from '../components/ConsentModal';
import ExperienceHeader from '../components/ExperienceHeader';
import KindSelector from '../components/KindSelector';
import LeaveConfirmModal from '../components/LeaveConfirmModal';
import ReportFormFields from '../components/ReportFormFields';
import ReportPaste, { MAX_REPORT_LENGTH } from '../components/ReportPaste';
import SchoolSearch from '../components/SchoolSearch';
import SpecFormFields from '../components/SpecFormFields';
import StepTitle from '../components/StepTitle';
import {
  creditError,
  EMPTY_CREDIT,
  EMPTY_REPORT,
  emptySpec,
  extractReport,
  findDuplicate,
  getMyReportCourses,
  getSchoolOption,
  hasConsented,
  MY_CONDITION,
  saveConsent,
  type CreditForm,
  type ReportForm,
  type SchoolOption,
  type SpecForm,
} from '../mock';

const KINDS: ExperienceKind[] = ['report', 'spec', 'credit'];
const KIND_LABEL: Record<ExperienceKind, string> = {
  report: '귀국보고서',
  spec: '합격/탈락 스펙',
  credit: '학점 인정 결과',
};

const now = new Date();
const YEARS = Array.from({ length: 5 }, (_, i) => String(now.getFullYear() - i));
const SEMESTERS = [
  { value: '1', label: '1학기' },
  { value: '2', label: '2학기' },
];

export default function ExperienceNewPage() {
  const navigate = useNavigate();
  const [params, setParams] = useSearchParams();
  const kind = KINDS.find((k) => k === params.get('type')) ?? 'report';

  const [school, setSchool] = useState<SchoolOption | null>(() =>
    getSchoolOption(Number(params.get('universityId'))),
  );
  const [year, setYear] = useState(YEARS[0]);
  const [semester, setSemester] = useState(now.getMonth() >= 7 ? '2' : '1');

  // 귀국보고서: 붙여넣기 → (첫 1회 동의) → 추출 결과 확인·수정 → 저장
  const [phase, setPhase] = useState<'paste' | 'review'>('paste');
  const [text, setText] = useState('');
  const [privacyChecked, setPrivacyChecked] = useState(false);
  const [extracting, setExtracting] = useState(false);
  const [extracted, setExtracted] = useState(false);
  const [form, setForm] = useState<ReportForm>(EMPTY_REPORT);
  const [consentOpen, setConsentOpen] = useState(false);
  const [completeOpen, setCompleteOpen] = useState(false);
  const [error, setError] = useState('');

  const [spec, setSpec] = useState<SpecForm>(emptySpec);
  const [specTouched, setSpecTouched] = useState(false);

  const [credit, setCredit] = useState<CreditForm>(EMPTY_CREDIT);
  const [creditTouched, setCreditTouched] = useState(false);
  // TODO: 내 귀국보고서 조회 API 연결
  const reportCourses = school ? getMyReportCourses(school.universityId) : [];
  const noReport = kind === 'credit' && !!school && reportCourses.length === 0;

  const dirty =
    !completeOpen &&
    (text.length > 0 ||
      phase === 'review' ||
      (kind === 'spec' && specTouched) ||
      (kind === 'credit' && creditTouched));
  const blocker = useLeaveConfirm(dirty);

  // TODO: /experiences/check-duplicate 연결
  const duplicate = school
    ? findDuplicate(kind, school.universityId, Number(year), Number(semester))
    : null;

  const reset = () => {
    setPhase('paste');
    setText('');
    setPrivacyChecked(false);
    setExtracted(false);
    setForm(EMPTY_REPORT);
    setSpec(emptySpec());
    setSpecTouched(false);
    setCredit(EMPTY_CREDIT);
    setCreditTouched(false);
    setError('');
  };

  const runExtract = async () => {
    setExtracting(true);
    // TODO: /return-reports/extract 연결
    const result = await extractReport();
    setForm(result);
    setExtracted(true);
    setExtracting(false);
    setPhase('review');
  };

  const onExtract = () => (hasConsented() ? runExtract() : setConsentOpen(true));

  const onSave = () => {
    if (!school) return setError('학교를 선택해 주세요');
    if (kind === 'spec' && MY_CONDITION.scores.length > 0 && !spec.exam)
      return setError('어학 성적을 골라 주세요');
    if (kind === 'credit' && creditError(credit)) return setError(creditError(credit));
    // TODO: report → /return-reports (원문 text는 보내지 않음), spec → /admission-reports, credit → /credit-cases
    setError('');
    setCompleteOpen(true);
  };

  const saveRow = (note: string) => (
    <div className="flex flex-wrap items-center gap-3">
      <Icon name="lock" size={19} className="text-ink-muted" />
      <span className="text-ink-muted text-[16px]">{note}</span>
      <div className="flex-1" />
      {error && <span className="text-danger text-[16px] font-medium">{error}</span>}
      <Button className="ml-auto" onClick={onSave}>
        저장
      </Button>
    </div>
  );

  return (
    <Stagger className="flex flex-col gap-8">
      <StaggerItem>
        <ExperienceHeader />
      </StaggerItem>

      <StaggerItem>
        <Card className="flex flex-col gap-6">
          <StepTitle no={1}>등록 유형 선택</StepTitle>
          <KindSelector
            value={kind}
            onChange={(k) => {
              const next = new URLSearchParams(params);
              next.set('type', k);
              setParams(next, { replace: true });
              setError('');
            }}
          />

          <hr className="border-line-soft" />

          <StepTitle no={2}>학교/학기 선택</StepTitle>
          <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:gap-3">
            <div className="flex min-w-0 flex-1 flex-col gap-2">
              <span className="text-ink-sub text-[18px] font-semibold">학교</span>
              <SchoolSearch
                value={school}
                onChange={(s) => {
                  setSchool(s);
                  setCredit((c) => ({ ...c, courseKey: '' }));
                  setError('');
                }}
              />
              <Hint>협정교 상세에서 들어오면 학교가 자동으로 선택돼요</Hint>
            </div>
            <div className="flex flex-col gap-2">
              <span className="text-ink-sub text-[18px] font-semibold">연도</span>
              <Select
                className="w-full lg:w-[207px]"
                aria-label="연도"
                value={year}
                onChange={setYear}
                options={YEARS.map((y) => ({ value: y, label: `${y}년` }))}
              />
            </div>
            <div className="flex flex-col items-start gap-2">
              <span className="text-ink-sub text-[18px] font-semibold">학기</span>
              <Segment items={SEMESTERS} value={semester} onChange={setSemester} />
              <Hint>같은 유형은 한 학기에 1건만 등록할 수 있어요</Hint>
            </div>
          </div>
        </Card>
      </StaggerItem>

      <StaggerItem>
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={duplicate ? 'dup' : `${kind}-${phase}-${noReport ? 'empty' : ''}`}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.25 }}
          >
            {duplicate ? (
              <Card className="flex flex-col gap-5">
                <StepTitle no={3}>{KIND_LABEL[kind]}</StepTitle>
                <InfoNote tone="primary">
                  이미 {year}-{semester}학기에 이 학교의 {KIND_LABEL[kind]}를 등록했어요. 같은
                  유형은 한 학기에 1건만 등록할 수 있어 기존 등록을 수정해 주세요.
                </InfoNote>
                <Button
                  variant="secondary"
                  icon="edit"
                  className="self-start"
                  onClick={() => navigate(PATHS.experienceEdit(kind, duplicate.id))}
                >
                  기존 등록 수정하기
                </Button>
              </Card>
            ) : kind === 'spec' ? (
              <Card className="flex flex-col gap-7">
                <StepTitle no={3}>합격 / 탈락 스펙 입력</StepTitle>
                <SpecFormFields
                  value={spec}
                  onChange={(v) => {
                    setSpec(v);
                    setSpecTouched(true);
                    setError('');
                  }}
                />
                {saveRow('저장하면 입력값을 확인한 뒤 등록돼요')}
              </Card>
            ) : noReport ? (
              <Card className="flex flex-col gap-5">
                <StepTitle no={3}>학점 인정 결과 입력</StepTitle>
                <InfoNote tone="primary">
                  이 학교의 귀국보고서가 없어서 고를 수강 교과목이 없어요. 귀국보고서를 먼저
                  등록하면 수강 교과목에서 골라 인정 결과를 남길 수 있어요.
                </InfoNote>
                <Button
                  variant="secondary"
                  icon="file"
                  className="self-start"
                  onClick={() => {
                    const next = new URLSearchParams(params);
                    next.set('type', 'report');
                    setParams(next, { replace: true });
                  }}
                >
                  귀국보고서 먼저 등록하기
                </Button>
              </Card>
            ) : kind === 'credit' ? (
              <Card className="flex flex-col gap-7">
                <StepTitle no={3}>학점 인정 결과 입력</StepTitle>
                <CreditFormFields
                  value={credit}
                  courses={reportCourses}
                  onChange={(v) => {
                    setCredit(v);
                    setCreditTouched(true);
                    setError('');
                  }}
                />
                {saveRow('저장하면 입력값을 확인한 뒤 등록돼요')}
              </Card>
            ) : phase === 'paste' ? (
              <Card className="flex flex-col gap-6">
                <StepTitle
                  no={3}
                  right={
                    <span className="text-ink-muted text-[18px] font-medium">
                      {text.length.toLocaleString()} / {MAX_REPORT_LENGTH.toLocaleString()}자
                    </span>
                  }
                >
                  {semester}학기 귀국보고서 붙여넣기
                </StepTitle>
                <ReportPaste
                  text={text}
                  onText={setText}
                  checked={privacyChecked}
                  onChecked={setPrivacyChecked}
                  extracting={extracting}
                  canExtract={!!school && text.trim().length > 0 && privacyChecked}
                  onExtract={onExtract}
                  onManual={() => {
                    setExtracted(false);
                    setPhase('review');
                  }}
                />
                {!school && <Hint>학교를 먼저 선택해 주세요</Hint>}
              </Card>
            ) : (
              <Card className="flex flex-col gap-6">
                <StepTitle
                  no={3}
                  right={
                    <Button
                      variant="subtle"
                      size="sm"
                      icon="arrowL"
                      onClick={() => setPhase('paste')}
                    >
                      붙여넣기로 돌아가기
                    </Button>
                  }
                >
                  {semester}학기 귀국보고서 — {extracted ? '추출 결과 확인 · 수정' : '직접 입력'}
                  {extracted && (
                    <Badge tone="accent">
                      <Icon name="sparkle" size={15} className="mr-1" />
                      AI 추출 완료
                    </Badge>
                  )}
                </StepTitle>
                <ReportFormFields value={form} onChange={setForm} />
                {saveRow('저장 시 붙여넣은 원문은 저장하지 않고 항목과 요약만 보관해요')}
              </Card>
            )}
          </motion.div>
        </AnimatePresence>
      </StaggerItem>

      <ConsentModal
        open={consentOpen}
        onClose={() => setConsentOpen(false)}
        onAgree={() => {
          // TODO: /consents 기록
          saveConsent();
          setConsentOpen(false);
          runExtract();
        }}
      />

      <CompleteModal
        open={completeOpen}
        onClose={() => {
          setCompleteOpen(false);
          reset();
        }}
        onGoMine={() => navigate(PATHS.experienceMine)}
      />

      <LeaveConfirmModal blocker={blocker} />
    </Stagger>
  );
}

function Hint({ children }: { children: string }) {
  return (
    <p className="text-ink-muted flex items-center gap-1.5 text-[16px]">
      <Icon name="info" size={17} />
      {children}
    </p>
  );
}
