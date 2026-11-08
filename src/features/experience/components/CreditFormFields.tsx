import type { ReactNode } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { CREDIT_TYPE } from '@/features/schools/components/CoursesTab';
import type { CreditType } from '@/features/schools/mock';
import Icon from '@/shared/ui/Icon';
import Input from '@/shared/ui/Input';
import Segment from '@/shared/ui/Segment';
import Select from '@/shared/ui/Select';
import {
  isCreditInRange,
  MAX_CREDITS,
  needsHomeCourse,
  searchHomeCourses,
  type CourseRow,
  type CreditForm,
} from '../mock';
import SearchSelect from './SearchSelect';

const TYPES = (Object.keys(CREDIT_TYPE) as CreditType[]).map((value) => ({
  value,
  label: CREDIT_TYPE[value].label,
}));

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="flex min-w-0 flex-col gap-2">
      <span className="text-ink-sub text-[18px] font-semibold">{label}</span>
      {children}
    </div>
  );
}

function Hint({ tone = 'muted', children }: { tone?: 'muted' | 'danger'; children: string }) {
  return (
    <p
      className={`flex items-center gap-1.5 text-[16px] ${
        tone === 'danger' ? 'text-danger' : 'text-ink-muted'
      }`}
    >
      <Icon name="info" size={17} />
      {children}
    </p>
  );
}

export default function CreditFormFields({
  value,
  onChange,
  courses,
}: {
  value: CreditForm;
  onChange: (value: CreditForm) => void;
  courses: CourseRow[];
}) {
  const set = (patch: Partial<CreditForm>) => onChange({ ...value, ...patch });
  const homeEnabled = needsHomeCourse(value.creditType);
  const creditsError = value.credits.trim() !== '' && !isCreditInRange(value.credits);

  return (
    <div className="flex flex-col gap-7">
      <Field label="대상 과목">
        <Select
          aria-label="대상 과목"
          placeholder={courses.length ? '교환교 과목 선택' : '학교를 먼저 선택해 주세요'}
          disabled={courses.length === 0}
          value={value.courseKey}
          onChange={(courseKey) => set({ courseKey })}
          options={courses.map((c) => ({
            value: String(c.key),
            label: `${c.code} · ${c.name} (${c.credits})`,
          }))}
        />
        <Hint>귀국보고서에 등록한 수강 교과목에서 선택해요</Hint>
      </Field>

      <Field label="구분">
        <div>
          <Segment
            items={TYPES}
            value={value.creditType}
            onChange={(creditType) =>
              set({
                creditType,
                homeCourse: needsHomeCourse(creditType) ? value.homeCourse : null,
              })
            }
          />
        </div>
        <AnimatePresence initial={false}>
          {value.creditType === 'MAJOR_REQUIRED' && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.2 }}
              className="overflow-hidden"
            >
              <Hint>전공필수는 부전공자만 외국 대학에서 인정받을 수 있어요</Hint>
            </motion.div>
          )}
        </AnimatePresence>
      </Field>

      <div className="flex flex-col gap-4 lg:flex-row lg:items-start">
        <div className="flex min-w-0 flex-1 flex-col gap-2">
          <Field label="본교 인정 과목">
            <SearchSelect
              value={value.homeCourse}
              onChange={(homeCourse) => set({ homeCourse })}
              // TODO: 본교 과목 검색 API 연결
              search={searchHomeCourses}
              getKey={(c) => c.courseId}
              getLabel={(c) => `${c.name} (${c.code})`}
              renderOption={(c) => (
                <>
                  <span className="text-ink font-medium">{c.name}</span>
                  <span className="text-ink-muted">{c.code}</span>
                </>
              )}
              placeholder={homeEnabled ? '과목명 검색' : '교양·자선은 선택하지 않아요'}
              clearLabel="본교 과목 선택 지우기"
              disabled={!homeEnabled}
            />
          </Field>
          <Hint>구분이 전필·전선일 때만 검색해 선택해요. 교양·자선이면 비활성돼요.</Hint>
        </div>
        <div className="flex flex-col gap-2 lg:w-[360px]">
          <Field label="인정 학점">
            <Input
              aria-label="인정 학점"
              inputMode="decimal"
              placeholder={`직접 입력 (0 초과 ${MAX_CREDITS} 이하)`}
              value={value.credits}
              onChange={(e) => set({ credits: e.target.value })}
              unit="학점"
            />
          </Field>
          {creditsError && (
            <Hint tone="danger">{`0 초과 ${MAX_CREDITS} 이하로 입력해 주세요`}</Hint>
          )}
        </div>
      </div>
    </div>
  );
}
