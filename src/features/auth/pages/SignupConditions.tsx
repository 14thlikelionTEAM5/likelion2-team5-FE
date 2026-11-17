import { LANGUAGE_TEST_LABEL, LANGUAGE_TESTS, type LanguageTestType } from '@/shared/types/enums';
import type { SignupConditionsInput } from '../api/signup';
import { useEffect, useRef, useState, type FormEvent } from 'react';
import SignupStepBadge from './SignupStepBadge';

const fieldClass =
  'h-11 w-full min-w-0 rounded-lg border border-[#cdd7e6] bg-white px-3 text-sm aria-invalid:border-[#8E5656]';
type Exam = { id: number; test: LanguageTestType | ''; score: string };

export default function SignupConditions({
  active,
  onBack,
  onComplete,
  pending,
  submitError,
}: {
  active: boolean;
  onBack: () => void;
  onComplete: (conditions: SignupConditionsInput) => void;
  pending: boolean;
  submitError: string;
}) {
  const heading = useRef<HTMLHeadingElement>(null);
  const nextExamId = useRef(1);
  const [gpa, setGpa] = useState('');
  const [exams, setExams] = useState<Exam[]>([{ id: 0, test: '', score: '' }]);
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    if (active) heading.current?.focus();
  }, [active]);

  const gpaError = !gpa.trim()
    ? '누적 학점을 입력해주세요.'
    : !/^\d+(\.\d{1,2})?$/.test(gpa.trim()) || Number(gpa) > 4.5
      ? '0부터 4.5까지 소수점 둘째 자리 이내로 입력해주세요.'
      : '';

  function examError(exam: Exam) {
    if (!exam.test && !exam.score.trim()) return '';
    if (!exam.test) return '시험 종류를 선택해주세요.';
    if (!/^\d+(\.\d+)?$/.test(exam.score.trim()) || !Number.isFinite(Number(exam.score))) {
      return '올바른 점수를 입력해주세요.';
    }
    return '';
  }

  function updateExam(id: number, change: Partial<Pick<Exam, 'test' | 'score'>>) {
    setExams((current) => current.map((exam) => (exam.id === id ? { ...exam, ...change } : exam)));
  }

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitted(true);
    if (pending || gpaError || exams.some(examError)) return;
    onComplete({
      gpa: Number(gpa),
      languageScores: exams.flatMap(({ test, score }) =>
        test ? [{ testType: test, score: Number(score) }] : [],
      ),
    });
  }

  if (!active) return null;

  return (
    <section
      aria-labelledby="conditions-heading"
      className="mx-auto w-full max-w-xl rounded-[14px] border border-[#e4e9f1] bg-white shadow-sm"
    >
      <header className="border-b border-[#edf0f5] px-[clamp(1rem,3vw,1.75rem)] py-[clamp(1rem,3dvh,1.5rem)]">
        <SignupStepBadge step={4} />
        <h1
          id="conditions-heading"
          ref={heading}
          tabIndex={-1}
          className="mt-2 text-xl font-semibold tracking-tight outline-none sm:text-2xl"
        >
          지원 조건을 입력해주세요
        </h1>
        <p className="mt-1 text-sm text-[#586782]">지원 자격 확인에 필요한 정보예요.</p>
      </header>

      <form
        noValidate
        onSubmit={submit}
        className="divide-y divide-[#edf0f5] px-[clamp(1rem,3vw,1.75rem)]"
      >
        <div className="grid max-w-[430px] gap-2 py-[clamp(1rem,3dvh,1.5rem)]">
          <label htmlFor="signup-gpa" className="text-sm font-medium">
            누적 학점 <span className="text-[#8E5656]">*</span>
          </label>
          <div className="relative">
            <input
              id="signup-gpa"
              readOnly={pending}
              required
              inputMode="decimal"
              placeholder="예: 3.82"
              value={gpa}
              onChange={(event) => {
                setGpa(event.target.value);
              }}
              className={fieldClass + ' pr-16'}
              aria-invalid={submitted && !!gpaError}
              aria-describedby="signup-gpa-message"
            />
            <span
              aria-hidden="true"
              className="pointer-events-none absolute top-1/2 right-3 -translate-y-1/2 rounded bg-[#eef2f7] px-2 py-1 text-xs text-[#586782]"
            >
              / 4.5
            </span>
          </div>
          <p
            id="signup-gpa-message"
            className={submitted && gpaError ? 'text-xs text-[#8E5656]' : 'text-xs text-[#586782]'}
            role={submitted && gpaError ? 'alert' : undefined}
          >
            {submitted && gpaError ? gpaError : '4.5점 만점 기준으로 입력해주세요.'}
          </p>
        </div>

        <fieldset
          disabled={pending}
          className="min-w-0 py-[clamp(1rem,3dvh,1.5rem)]"
          aria-labelledby="signup-exams-heading"
        >
          <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 id="signup-exams-heading" className="text-sm font-semibold">
                어학 성적 <span className="font-normal text-[#586782]">(선택)</span>
              </h2>
              <p className="mt-1 text-xs text-[#586782]">보유한 시험 성적을 추가할 수 있어요.</p>
            </div>
            <button
              type="button"
              onClick={() => {
                const id = nextExamId.current++;
                setExams((current) => [...current, { id, test: '', score: '' }]);
              }}
              className="cursor-pointer rounded-full border border-[#cdd7e6] px-3 py-1.5 text-sm"
            >
              ＋ 시험 추가
            </button>
          </div>
          <div className="grid gap-3">
            {exams.map((exam, index) => {
              const error = submitted ? examError(exam) : '';
              const messageId = 'signup-exam-error-' + exam.id;
              return (
                <div
                  key={exam.id}
                  className="grid grid-cols-[minmax(0,1fr)_auto] items-end gap-3 rounded-xl border border-[#e4e9f1] bg-[#f8fafc] p-4 sm:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)_auto]"
                >
                  <label className="col-span-2 grid gap-1.5 text-xs font-medium sm:col-span-1">
                    시험 종류
                    <select
                      value={exam.test}
                      onChange={(event) =>
                        updateExam(exam.id, { test: event.target.value as Exam['test'] })
                      }
                      className={fieldClass}
                      aria-invalid={!!error && !exam.test}
                      aria-describedby={error ? messageId : undefined}
                    >
                      <option value="">선택 안함</option>
                      {LANGUAGE_TESTS.map((test) => (
                        <option key={test} value={test}>
                          {LANGUAGE_TEST_LABEL[test]}
                        </option>
                      ))}
                    </select>
                  </label>
                  <label className="grid gap-1.5 text-xs font-medium">
                    점수
                    <input
                      value={exam.score}
                      onChange={(event) => updateExam(exam.id, { score: event.target.value })}
                      inputMode="decimal"
                      placeholder="점수 입력"
                      className={fieldClass}
                      aria-invalid={!!error && !!exam.test}
                      aria-describedby={error ? messageId : undefined}
                    />
                  </label>
                  <button
                    type="button"
                    aria-label={`시험 ${index + 1} 삭제`}
                    onClick={() => {
                      setExams((current) => current.filter(({ id }) => id !== exam.id));
                    }}
                    className="size-11 cursor-pointer rounded-lg border border-[#cdd7e6] bg-white text-[#586782]"
                  >
                    ×
                  </button>
                  {error && (
                    <p id={messageId} role="alert" className="col-span-full text-xs text-[#8E5656]">
                      {error}
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        </fieldset>

        <div className="py-5">
          <div className="flex justify-between gap-3">
            <button
              type="button"
              onClick={onBack}
              disabled={pending}
              className="min-h-11 min-w-0 cursor-pointer rounded-xl border border-[#cdd7e6] px-4 text-sm font-semibold sm:min-w-24"
            >
              이전
            </button>
            <button
              type="submit"
              disabled={pending}
              className="min-h-11 cursor-pointer rounded-xl bg-[#253357] px-5 text-sm font-semibold text-white sm:min-w-44"
            >
              {pending ? '가입 처리 중…' : '가입 완료'} <span aria-hidden="true">✓</span>
            </button>
          </div>
          {submitError && (
            <p role="alert" className="mt-3 text-sm text-[#8E5656]">
              {submitError}
            </p>
          )}
        </div>
      </form>
    </section>
  );
}
