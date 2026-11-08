import type { ReactNode } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import type { HousingType } from '@/features/schools/mock';
import Button from '@/shared/ui/Button';
import Icon from '@/shared/ui/Icon';
import Input from '@/shared/ui/Input';
import Segment from '@/shared/ui/Segment';
import { emptyCourse, type CourseRow, type ReportForm } from '../mock';

const HOUSING: { value: HousingType; label: string }[] = [
  { value: 'DORM', label: '기숙사' },
  { value: 'OFF_CAMPUS', label: '자취' },
  { value: 'OTHER', label: '기타' },
];

function Section({
  title,
  hint,
  right,
  children,
}: {
  title: string;
  hint?: string;
  right?: ReactNode;
  children: ReactNode;
}) {
  return (
    <section className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center gap-2">
        <h3 className="text-[20px] font-bold">{title}</h3>
        {hint && <span className="text-ink-muted text-[16px]">{hint}</span>}
        <div className="flex-1" />
        {right}
      </div>
      {children}
    </section>
  );
}

// Input이 이미 label이라 바깥은 div
function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="flex min-w-0 flex-1 flex-col gap-2">
      <span className="text-ink-sub text-[18px] font-semibold">{label}</span>
      {children}
    </div>
  );
}

function Stars({ value, onChange }: { value: number; onChange: (v: number) => void }) {
  return (
    <div className="flex gap-0.5" role="radiogroup" aria-label="수업 만족도">
      {[1, 2, 3, 4, 5].map((n) => (
        <motion.button
          key={n}
          type="button"
          role="radio"
          aria-checked={value === n}
          aria-label={`${n}점`}
          whileTap={{ scale: 0.8 }}
          onClick={() => onChange(value === n ? 0 : n)}
          className={n <= value ? 'text-accent' : 'text-line'}
        >
          <Icon name="star" size={24} fill={n <= value ? 'currentColor' : 'none'} />
        </motion.button>
      ))}
    </div>
  );
}

export default function ReportFormFields({
  value,
  onChange,
}: {
  value: ReportForm;
  onChange: (value: ReportForm) => void;
}) {
  const set = <K extends keyof ReportForm>(key: K, v: ReportForm[K]) =>
    onChange({ ...value, [key]: v });
  const setCourse = (key: number, patch: Partial<CourseRow>) =>
    set(
      'courses',
      value.courses.map((c) => (c.key === key ? { ...c, ...patch } : c)),
    );

  const costPlaceholder = '예: 120만원, 700 USD';

  return (
    <div className="flex flex-col gap-8">
      <Section
        title="비용"
        hint="자유 텍스트로 입력해요 (예: 약 300유로, 월 1,000유로) · 통화 환산은 하지 않아요"
      >
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <Field label="항공">
            <Input
              aria-label="항공"
              placeholder={costPlaceholder}
              value={value.flight}
              onChange={(e) => set('flight', e.target.value)}
            />
          </Field>
          <Field label="보험">
            <Input
              aria-label="보험"
              placeholder={costPlaceholder}
              value={value.insurance}
              onChange={(e) => set('insurance', e.target.value)}
            />
          </Field>
          <Field label="월 생활비">
            <Input
              aria-label="월 생활비"
              placeholder={costPlaceholder}
              value={value.monthlyLiving}
              onChange={(e) => set('monthlyLiving', e.target.value)}
            />
          </Field>
          <Field label="총액">
            <Input
              aria-label="총액"
              placeholder={costPlaceholder}
              value={value.total}
              onChange={(e) => set('total', e.target.value)}
            />
          </Field>
        </div>
        <div className="grid gap-4 md:grid-cols-3">
          <Field label="보험 구입처">
            <Input
              aria-label="보험 구입처"
              placeholder="예: 학교 단체보험 / 개인 구입"
              value={value.insurancePlace}
              onChange={(e) => set('insurancePlace', e.target.value)}
            />
          </Field>
          <Field label="비자 · 소요 기간">
            <Input
              aria-label="비자 · 소요 기간"
              placeholder="예: 약 4주"
              value={value.visaPeriod}
              onChange={(e) => set('visaPeriod', e.target.value)}
            />
          </Field>
          <Field label="비자 · 종류">
            <Input
              aria-label="비자 · 종류"
              placeholder="예: 학생비자"
              value={value.visaType}
              onChange={(e) => set('visaType', e.target.value)}
            />
          </Field>
        </div>
      </Section>

      <Section title="숙소" hint="유형 선택">
        <Segment items={HOUSING} value={value.housing} onChange={(v) => set('housing', v)} />
      </Section>

      <hr className="border-line-soft" />

      <Section
        title="수강 교과목"
        hint="학점 인정 결과를 등록할 때 이 목록에서 과목을 골라요"
        right={
          <Button
            variant="secondary"
            size="sm"
            icon="plus"
            onClick={() => set('courses', [...value.courses, emptyCourse()])}
          >
            추가
          </Button>
        }
      >
        {/* 좁은 화면에서는 표만 가로로 스크롤 */}
        <div className="flex min-w-0 flex-col overflow-x-auto">
          <div className="flex min-w-[760px] flex-col xl:min-w-0">
            <div className="bg-table-head rounded-small text-ink-muted flex gap-3 px-4 py-3 text-[16px] font-semibold">
              <span className="w-[190px]">교과목코드</span>
              <span className="flex-1">영문 교과목명</span>
              <span className="w-[150px]">외국 학점</span>
              <span className="w-[150px]">수업 만족도</span>
              <span className="w-11" />
            </div>
            <AnimatePresence initial={false}>
              {value.courses.map((c) => (
                <motion.div
                  key={c.key}
                  layout
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.2 }}
                  className="border-fill overflow-hidden border-b"
                >
                  <div className="flex items-center gap-3 px-1 py-2">
                    <Input
                      size="sm"
                      className="w-[202px]"
                      placeholder="입력"
                      aria-label="교과목코드"
                      value={c.code}
                      onChange={(e) => setCourse(c.key, { code: e.target.value })}
                    />
                    <Input
                      size="sm"
                      className="flex-1"
                      placeholder="입력"
                      aria-label="영문 교과목명"
                      value={c.name}
                      onChange={(e) => setCourse(c.key, { name: e.target.value })}
                    />
                    <Input
                      size="sm"
                      className="w-[150px]"
                      placeholder="입력"
                      aria-label="외국 학점"
                      value={c.credits}
                      onChange={(e) => setCourse(c.key, { credits: e.target.value })}
                    />
                    <div className="w-[150px]">
                      <Stars value={c.rating} onChange={(rating) => setCourse(c.key, { rating })} />
                    </div>
                    <button
                      type="button"
                      aria-label="과목 삭제"
                      onClick={() =>
                        set(
                          'courses',
                          value.courses.filter((x) => x.key !== c.key),
                        )
                      }
                      className="text-ink-muted hover:bg-panel hover:text-danger flex size-11 items-center justify-center rounded-[10px] transition-colors"
                    >
                      <Icon name="trash" size={20} />
                    </button>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
          {value.courses.length === 0 && (
            <p className="text-ink-muted py-5 text-center text-[17px]">
              추가 버튼으로 들은 과목을 넣어 주세요
            </p>
          )}
        </div>
      </Section>

      <hr className="border-line-soft" />

      <Section title="요약" hint="AI가 정리한 요약을 확인하고 수정해요">
        <textarea
          value={value.summary}
          onChange={(e) => set('summary', e.target.value)}
          placeholder="생활, 수업, 비용 등 핵심 내용을 2~3줄로 적어 주세요."
          className="border-line placeholder:text-ink-faint focus:border-primary h-[160px] w-full resize-none rounded-[16px] border bg-white p-5 text-[19px] leading-[1.6] outline-none"
        />
      </Section>
    </div>
  );
}
