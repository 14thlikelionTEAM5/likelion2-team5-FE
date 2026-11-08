import type { ReactNode } from 'react';
import { LANGUAGE_EXAMS } from '@/features/schools/components/SchoolFilterCard';
import {
  ADMISSION_RESULT_LABEL,
  MAJOR_TYPE_LABEL,
  type AdmissionResult,
} from '@/shared/types/enums';
import Icon from '@/shared/ui/Icon';
import Input from '@/shared/ui/Input';
import Segment from '@/shared/ui/Segment';
import Select from '@/shared/ui/Select';
import { MAX_NOTE_LENGTH, MY_CONDITION, type SpecForm } from '../mock';

const RESULTS = (['PASS', 'FAIL'] as AdmissionResult[]).map((value) => ({
  value,
  label: ADMISSION_RESULT_LABEL[value],
}));

const examLabel = (v: string) => LANGUAGE_EXAMS.find((e) => e.value === v)?.label ?? v;

function Field({ label, hint, children }: { label: string; hint?: string; children: ReactNode }) {
  return (
    <div className="flex min-w-0 flex-1 flex-col gap-2">
      <span className="text-ink-sub text-[18px] font-semibold">
        {label}
        {hint && <span className="text-ink-muted ml-1.5 text-[16px] font-normal">· {hint}</span>}
      </span>
      {children}
    </div>
  );
}

function Hint({ icon = 'info', children }: { icon?: 'info' | 'lock'; children: string }) {
  return (
    <p className="text-ink-muted flex items-center gap-1.5 text-[16px]">
      <Icon name={icon} size={17} />
      {children}
    </p>
  );
}

export default function SpecFormFields({
  value,
  onChange,
}: {
  value: SpecForm;
  onChange: (value: SpecForm) => void;
}) {
  const set = <K extends keyof SpecForm>(key: K, v: SpecForm[K]) =>
    onChange({ ...value, [key]: v });
  const score = MY_CONDITION.scores.find((s) => s.exam === value.exam)?.score;

  return (
    <div className="flex flex-col gap-7">
      <Field label="결과">
        <div>
          <Segment items={RESULTS} value={value.result} onChange={(v) => set('result', v)} />
        </div>
      </Field>

      <div className="flex gap-4">
        <Field label="어학 성적" hint="여러 개면 하나를 골라요">
          <Select
            aria-label="어학 성적"
            placeholder="내 지원 조건에서 선택"
            value={value.exam}
            onChange={(v) => set('exam', v)}
            disabled={MY_CONDITION.scores.length === 0}
            options={MY_CONDITION.scores.map((s) => ({ value: s.exam, label: examLabel(s.exam) }))}
          />
          <Hint>가입 정보에 1개면 자동으로 채워져요. 0개면 비워둘 수 있어요.</Hint>
        </Field>
        <Field label="점수">
          <Input
            aria-label="점수"
            disabled
            placeholder="자동 채움"
            value={score === undefined ? '' : value.exam === 'IELTS' ? score.toFixed(1) : score}
            readOnly
          />
        </Field>
      </div>

      <div className="flex gap-4">
        <Field label="누적 학점">
          <Input
            aria-label="누적 학점"
            disabled
            value={`${MY_CONDITION.gpa.toFixed(1)} / 4.5`}
            readOnly
          />
          <Hint icon="lock">자동 입력 · 수정 불가</Hint>
        </Field>
        <Field label="전공 구분">
          <Input
            aria-label="전공 구분"
            disabled
            value={MAJOR_TYPE_LABEL[MY_CONDITION.majorType]}
            readOnly
          />
          <Hint icon="lock">마이페이지 정보 자동 표시 · 수정 불가</Hint>
        </Field>
      </div>

      <Field label="비고" hint="선택">
        <Input
          aria-label="비고"
          placeholder="예: 교환 동아리 활동, 면접 있음"
          maxLength={MAX_NOTE_LENGTH}
          value={value.note}
          onChange={(e) => set('note', e.target.value)}
          unit={`${value.note.length} / ${MAX_NOTE_LENGTH}`}
        />
      </Field>
    </div>
  );
}
