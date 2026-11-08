import { useState } from 'react';
import { useNavigate } from 'react-router';
import { AnimatePresence, motion } from 'motion/react';
import { PATHS } from '@/app/paths';
import { MAJOR_TYPE_LABEL } from '@/shared/types/enums';
import Badge from '@/shared/ui/Badge';
import Button from '@/shared/ui/Button';
import Card from '@/shared/ui/Card';
import EmptyState from '@/shared/ui/EmptyState';
import Icon from '@/shared/ui/Icon';
import InfoNote from '@/shared/ui/InfoNote';
import Segment from '@/shared/ui/Segment';
import Select from '@/shared/ui/Select';
import { Stagger, StaggerItem } from '@/shared/ui/Stagger';
import type { AdmissionReport } from '../mock';
import { LANGUAGE_EXAMS } from './SchoolFilterCard';

type ResultFilter = 'PASS' | 'FAIL' | 'ALL';

const RESULT_ITEMS: { value: ResultFilter; label: string }[] = [
  { value: 'PASS', label: '합격' },
  { value: 'FAIL', label: '탈락' },
  { value: 'ALL', label: '전체' },
];

const PREVIEW_COUNT = 3;
const examLabel = (v: string) => LANGUAGE_EXAMS.find((e) => e.value === v)?.label ?? v;

export default function SpecTab({
  universityId,
  reports,
  me,
}: {
  universityId: number;
  reports: AdmissionReport[];
  me: { gpa?: number; scores: Record<string, number> };
}) {
  const navigate = useNavigate();
  const goRegister = () => navigate(PATHS.experienceNew('spec', universityId));

  const passes = reports.filter((r) => r.result === 'PASS');
  const examsWithPass = LANGUAGE_EXAMS.filter((e) => passes.some((r) => r.exam === e.value));
  const [exam, setExam] = useState(
    () =>
      examsWithPass.find((e) => me.scores[e.value] !== undefined)?.value ??
      examsWithPass[0]?.value ??
      LANGUAGE_EXAMS[0].value,
  );
  const [filter, setFilter] = useState<ResultFilter>('PASS');
  const [expanded, setExpanded] = useState(false);

  if (reports.length === 0) {
    return (
      <Stagger delay={0.12}>
        <StaggerItem>
          <EmptyState
            title="아직 등록된 스펙이 없어요"
            description="합격/탈락 경험을 등록하면 다른 지원자에게 도움이 돼요"
            action={
              <Button icon="pen" onClick={goRegister}>
                경험 등록하기
              </Button>
            }
          />
        </StaggerItem>
      </Stagger>
    );
  }

  const gpas = passes.map((r) => r.gpa);
  const examScores = passes.filter((r) => r.exam === exam).map((r) => r.score);
  const listed = reports.filter((r) => filter === 'ALL' || r.result === filter);
  const shown = expanded ? listed : listed.slice(0, PREVIEW_COUNT);

  return (
    <Stagger delay={0.12} className="flex flex-col gap-6">
      <StaggerItem className="flex flex-wrap items-center gap-3">
        <Segment
          items={RESULT_ITEMS}
          value={filter}
          onChange={(v) => {
            setFilter(v);
            setExpanded(false);
          }}
        />
        <div className="flex-1" />
        <Button icon="pen" onClick={goRegister}>
          내 합격/탈락 경험 등록하기
        </Button>
      </StaggerItem>

      <div className="3xl:flex-row 3xl:items-start flex flex-col gap-6">
        <StaggerItem className="min-w-0 flex-1">
          <Card
            title="합격 스펙 범위"
            description="합격자들의 최저 ~ 최고 범위 위에 내 위치를 보여줘요"
          >
            <div className="flex flex-col gap-5">
              <RangePanel
                title="누적 학점"
                values={gpas}
                mine={me.gpa}
                format={(n) => n.toFixed(1)}
              />
              <RangePanel
                title="어학"
                values={examScores}
                mine={me.scores[exam]}
                format={(n) => String(n)}
                control={
                  <Select
                    size="sm"
                    className="w-[160px]"
                    aria-label="어학 시험 종류"
                    value={exam}
                    onChange={setExam}
                    options={LANGUAGE_EXAMS}
                  />
                }
              />
              <InfoNote>
                내 누적 학점과 어학 점수를 범위 위에 표시해요. 어학은 시험 종류를 바꿔서 볼 수
                있어요.
              </InfoNote>
            </div>
          </Card>
        </StaggerItem>

        <StaggerItem className="3xl:w-[600px] 3xl:shrink-0">
          <Card title="스펙 목록" description="최근 등록순">
            <div className="flex flex-col gap-5">
              <motion.div layout className="flex flex-col gap-3">
                <AnimatePresence mode="popLayout" initial={false}>
                  {shown.map((r) => (
                    <motion.div
                      key={r.reportId}
                      layout
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.97 }}
                      transition={{ duration: 0.2 }}
                      className="rounded-note bg-panel flex items-center gap-3.5 p-4"
                    >
                      <Badge tone={r.result === 'PASS' ? 'accent' : 'neutral'}>
                        {r.result === 'PASS' ? '합격' : '탈락'}
                      </Badge>
                      <div className="flex min-w-0 flex-1 flex-col gap-1">
                        <p className="flex flex-wrap items-center gap-x-2 text-[17px] font-semibold sm:text-[19px]">
                          {r.semester}학기 · {MAJOR_TYPE_LABEL[r.majorType]} · 학점{' '}
                          {r.gpa.toFixed(1)}
                          /4.5
                          {r.isSample && (
                            <span className="border-line text-ink-muted rounded-[6px] border bg-white px-1.5 text-[13px] font-medium">
                              시연용 샘플
                            </span>
                          )}
                        </p>
                        <p className="text-ink-muted text-[16px]">
                          {examLabel(r.exam)} {r.score} · {r.note ?? '어학 외 비고 없음'}
                        </p>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
                {listed.length === 0 && (
                  <p className="text-ink-muted py-6 text-center text-[18px]">
                    {filter === 'PASS' ? '합격' : '탈락'} 기록이 아직 없어요
                  </p>
                )}
              </motion.div>

              {listed.length > PREVIEW_COUNT && (
                <motion.div layout>
                  <Button
                    variant="secondary"
                    className="w-full"
                    onClick={() => setExpanded((v) => !v)}
                  >
                    {expanded ? '접기' : `더보기 (+${listed.length - PREVIEW_COUNT}건)`}
                    <Icon
                      name="down"
                      className={`transition-transform ${expanded ? 'rotate-180' : ''}`}
                    />
                  </Button>
                </motion.div>
              )}

              <motion.p layout className="text-ink-muted flex items-center gap-2 text-[16px]">
                <Icon name="lock" size={19} />
                누구나 열람할 수 있고, 개인 식별 정보는 공개하지 않아요
              </motion.p>
            </div>
          </Card>
        </StaggerItem>
      </div>
    </Stagger>
  );
}

function RangePanel({
  title,
  values,
  mine,
  format,
  control,
}: {
  title: string;
  values: number[];
  mine?: number;
  format: (n: number) => string;
  control?: React.ReactNode;
}) {
  return (
    <div className="rounded-panel bg-panel flex flex-col gap-3.5 p-4 sm:p-5">
      <div className="flex flex-wrap items-center gap-2.5">
        <h3 className="text-[20px] font-bold">{title}</h3>
        {control}
        <div className="flex-1" />
        <span className="text-ink-muted text-[16px]">합격 {values.length}건 기준</span>
      </div>
      {values.length > 0 ? (
        <RangeBar min={Math.min(...values)} max={Math.max(...values)} mine={mine} format={format} />
      ) : (
        <p className="text-ink-muted flex h-24 items-center justify-center text-[18px]">
          이 시험으로 합격한 기록이 아직 없어요
        </p>
      )}
    </div>
  );
}

function RangeBar({
  min,
  max,
  mine,
  format,
}: {
  min: number;
  max: number;
  mine?: number;
  format: (n: number) => string;
}) {
  // 범위 양옆에 여백을 두고, 내 값이 범위 밖이어도 보이게 함
  const lo0 = Math.min(min, mine ?? min);
  const hi0 = Math.max(max, mine ?? max);
  const pad = (hi0 - lo0 || 1) * 0.35;
  const pct = (v: number) => ((v - (lo0 - pad)) / (hi0 - lo0 + pad * 2)) * 100;
  const spring = { type: 'spring', stiffness: 160, damping: 22 } as const;

  return (
    <div className="relative h-24">
      <div className="bg-primary-soft absolute top-11 h-2.5 w-full rounded-[5px]" />
      <motion.div
        className="bg-accent absolute top-11 h-2.5 min-w-2.5 rounded-[5px]"
        initial={{ left: `${pct(min)}%`, width: 0 }}
        animate={{ left: `${pct(min)}%`, width: `${pct(max) - pct(min)}%` }}
        transition={spring}
      />
      <RangeLabel at={pct(min)}>{format(min)}</RangeLabel>
      {max !== min && <RangeLabel at={pct(max)}>{format(max)}</RangeLabel>}

      {mine !== undefined ? (
        <motion.div
          className="absolute top-0 flex -translate-x-1/2 flex-col items-center"
          initial={{ left: `${pct(min)}%`, opacity: 0 }}
          animate={{ left: `${pct(mine)}%`, opacity: 1 }}
          transition={spring}
        >
          <span className="bg-primary flex h-6 items-center rounded-xl px-2.5 text-[15px] font-bold whitespace-nowrap text-white">
            내 위치 {format(mine)}
          </span>
          <span className="bg-primary mt-[15px] size-5 rounded-full border-[3px] border-white shadow-[0_1px_4px_rgba(16,40,72,0.25)]" />
        </motion.div>
      ) : (
        <span className="text-ink-muted absolute top-0 left-0 text-[15px]">
          내 점수가 없어 위치를 표시하지 않아요
        </span>
      )}
    </div>
  );
}

function RangeLabel({ at, children }: { at: number; children: string }) {
  return (
    <motion.span
      className="text-ink-muted absolute top-[66px] -translate-x-1/2 text-[16px] font-semibold"
      animate={{ left: `${at}%` }}
      initial={false}
      transition={{ type: 'spring', stiffness: 160, damping: 22 }}
    >
      {children}
    </motion.span>
  );
}
