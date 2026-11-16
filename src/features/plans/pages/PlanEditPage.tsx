import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router';

import { PATHS } from '@/app/paths';
import heroLight from '@/assets/decor/hero-light.svg';
import { api } from '@/shared/api/client';
import { useRenameStudyPlan } from '@/shared/api/studyPlans';

type RecognitionType = 'MAJOR_REQUIRED' | 'MAJOR_ELECTIVE' | 'GENERAL';
type PlanItem = {
  itemId: number;
  itemType: string;
  courseName: string;
  foreignCredit: number | null;
  sourceCourseId: number | null;
  homeCourseId: number | null;
  recognitionType: RecognitionType;
  expectedCredit: number | null;
  creditLimitWarning: boolean;
};
type PlanDetail = {
  studyPlanId: number;
  name: string;
  universityId: number;
  universityName: string;
  calculation: { status: 'CALCULABLE' | 'NOT_CALCULABLE'; rule: string | null; reasonCode: string | null };
  items: PlanItem[];
  totalExpectedCredit: number | null;
  semesterCreditLimit: number | null;
  semesterCreditLimitWarning: boolean;
};

type DemoItem = { id: number; name: string; credits: number; recognitionType: RecognitionType; homeCourse: string };
const LABELS: Record<RecognitionType, string> = {
  MAJOR_REQUIRED: '전필', MAJOR_ELECTIVE: '전선', GENERAL: '교양',
};
const inputClass = 'h-[52px] w-full rounded-[10px] border border-line bg-white px-4 text-[17px] text-ink outline-none focus:border-primary';
const outlineButtonClass = 'inline-flex min-h-[43px] items-center justify-center rounded-[7px] border border-primary px-5 text-[16px] font-semibold text-primary hover:bg-primary-soft';

export default function PlanEditPage() {
  const navigate = useNavigate();
  const { planId } = useParams<{ planId: string }>();
  const [plan, setPlan] = useState<PlanDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [reloadKey, setReloadKey] = useState(0);
  const [demoItems, setDemoItems] = useState<DemoItem[]>([]);
  const [hiddenIds, setHiddenIds] = useState<number[]>([]);
  const [courseName, setCourseName] = useState('');
  const [foreignCredits, setForeignCredits] = useState('');
  const [recognitionType, setRecognitionType] = useState<RecognitionType>('MAJOR_ELECTIVE');
  const [homeCourse, setHomeCourse] = useState('');
  const [message, setMessage] = useState('');
  const [planName, setPlanName] = useState('');
  const [renameMessage, setRenameMessage] = useState('');
  const renameMutation = useRenameStudyPlan();

  useEffect(() => {
    let active = true;
    const load = async () => {
      setError('');
      setIsLoading(true);
      setPlan(null);
      setPlanName('');
      setRenameMessage('');
      setDemoItems([]);
      setHiddenIds([]);
      if (!planId || !/^[1-9]\d*$/.test(planId)) {
        setError('유효한 수강계획 ID가 아닙니다.');
        setIsLoading(false);
        return;
      }
      try {
        const result = await api<PlanDetail>(`/study-plans/${planId}`);
        if (!active) return;
        if (!result || !Array.isArray(result.items) || !result.calculation) {
          throw new Error('수강계획 상세 API 응답이 올바르지 않습니다. 백엔드 연결과 응답 데이터를 확인해 주세요.');
        }
        setPlan(result);
        setPlanName(result.name);
      } catch (err) {
        if (active) setError(err instanceof Error ? err.message : '수강계획을 불러오지 못했습니다.');
      } finally {
        if (active) setIsLoading(false);
      }
    };
    void load();
    return () => { active = false; };
  }, [planId, reloadKey]);

  const handleRename = async () => {
    if (!plan || renameMutation.isPending) return;
    const name = planName.trim();
    if (!name || name.length > 100) {
      setRenameMessage('계획 이름은 공백 제외 1~100자로 입력해 주세요.');
      return;
    }
    if (name === plan.name) {
      setRenameMessage('변경된 이름이 없습니다.');
      return;
    }
    setRenameMessage('');
    try {
      const updated = await renameMutation.mutateAsync({ studyPlanId: plan.studyPlanId, name });
      setPlan((previous) => previous ? { ...previous, name: updated.name } : previous);
      setPlanName(updated.name);
      setRenameMessage('계획 이름을 수정했습니다.');
    } catch (err) {
      setRenameMessage(err instanceof Error ? err.message : '계획 이름 수정에 실패했습니다.');
    }
  };

  const visibleItems = plan?.items.filter((item) => !hiddenIds.includes(item.itemId)) ?? [];
  const addDemoCourse = () => {
    const credits = Number(foreignCredits);
    if (!courseName.trim() || !foreignCredits.trim() || !Number.isFinite(credits) || credits <= 0) {
      setMessage('교과목명과 올바른 외국 학점을 입력해 주세요.');
      return;
    }
    setDemoItems((prev) => [...prev, { id: Date.now(), name: courseName.trim(), credits, recognitionType, homeCourse: homeCourse.trim() }]);
    setCourseName(''); setForeignCredits(''); setHomeCourse('');
    setMessage('테스트용으로 화면에만 추가했습니다. 서버에는 저장되지 않습니다.');
  };

  return (
    <div className="mx-auto flex w-full max-w-[1440px] flex-col gap-8 pb-12">
      <section className="relative flex min-h-[212px] flex-col justify-center overflow-hidden rounded-card bg-primary-soft bg-cover bg-center px-6 py-8 sm:px-11" style={{ backgroundImage: `url("${heroLight}")` }}>
        <div className="relative z-10 flex items-center gap-4">
          <button type="button" onClick={() => navigate(PATHS.plans)} aria-label="수강계획 목록으로 돌아가기" className="flex h-11 w-11 shrink-0 items-center justify-center rounded-[10px] bg-white text-xl font-semibold text-primary hover:bg-primary-soft">←</button>
          <div className="min-w-0">
            <p className="mb-2 text-sm font-semibold text-ink-sub">수강계획</p>
            <h1 className="text-[30px] font-bold text-primary sm:text-[34px]">수강계획 편집</h1>
            <p className="mt-2 text-base text-ink-sub sm:text-lg">파견교별 과목을 담고 예상 인정 학점을 확인하세요.</p>
          </div>
        </div>
      </section>

      <div className="rounded-[24px] bg-white px-5 py-9 sm:px-10">
        {isLoading ? <p role="status" className="py-12 text-center text-ink-muted">수강계획을 불러오는 중입니다...</p> : error ? (
          <div className="flex flex-col items-center gap-4 py-12">
            <p role="alert" className="text-danger">{error}</p>
            <button type="button" className={outlineButtonClass} onClick={() => setReloadKey((key) => key + 1)}>다시 시도</button>
          </div>
        ) : plan && <>
          <div className="mb-6 text-left">
            <p className="text-[18px] text-ink-muted">{plan.universityName} · {plan.name}</p>
          </div>

          <section className="mb-6 rounded-[18px] border border-line bg-white px-5 py-6">
            <h2 className="mb-4 text-[25px] font-semibold text-ink">수강계획 이름 수정</h2>
            <div className="flex flex-wrap items-end gap-3">
              <label className="flex min-w-[220px] flex-1 flex-col gap-2 text-[17px] font-semibold text-ink">
                계획 이름
                <input
                  className={inputClass}
                  value={planName}
                  maxLength={100}
                  onChange={(event) => { setPlanName(event.target.value); setRenameMessage(''); }}
                  placeholder="수강계획 이름"
                />
              </label>
              <button
                type="button"
                className="min-h-[52px] rounded-[10px] bg-primary px-6 text-[17px] font-semibold text-white disabled:cursor-not-allowed disabled:opacity-50"
                onClick={() => void handleRename()}
                disabled={renameMutation.isPending}
              >
                {renameMutation.isPending ? '수정 중...' : '이름 수정'}
              </button>
            </div>
            {renameMessage && <p role="status" className="mt-3 text-sm text-ink-sub">{renameMessage}</p>}
          </section>

          <section className="mb-6 rounded-[18px] border border-line bg-white px-5 py-6">
            <div className="mb-5 flex flex-wrap items-center justify-between gap-2">
              <h2 className="text-[25px] font-semibold text-ink">담은 과목</h2>
              <p className="text-[18px] font-semibold text-ink">합계 {plan.totalExpectedCredit === null ? '계산 불가' : plan.totalExpectedCredit}{plan.totalExpectedCredit === null ? '' : ` / ${plan.semesterCreditLimit ?? '-'}학점`}</p>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[850px] table-fixed text-left text-[16px] text-ink">
                <colgroup><col className="w-[26%]"/><col className="w-[14%]"/><col className="w-[14%]"/><col className="w-[16%]"/><col className="w-[22%]"/><col className="w-[8%]"/></colgroup>
                <thead className="bg-panel text-[17px] font-semibold"><tr><th className="px-3 py-3">교과목</th><th className="px-3 py-3">외국 학점</th><th className="px-3 py-3">인정 학점</th><th className="px-3 py-3">인정 구분</th><th className="px-3 py-3">본교 과목</th><th className="px-2 py-3"><span className="sr-only">삭제</span></th></tr></thead>
                <tbody>
                  {visibleItems.map((item) => <tr key={item.itemId} className="border-b border-line">
                    <td className="break-words px-3 py-4">{item.courseName}</td><td className="px-3 py-4">{item.foreignCredit ?? '-'}</td>
                    <td className="px-3 py-4">{item.expectedCredit ?? '-'}{item.creditLimitWarning && <span className="ml-2 text-danger">한도 초과</span>}</td>
                    <td className="px-3 py-4">{LABELS[item.recognitionType] ?? '확인 필요'}</td>
                    <td className="break-words px-3 py-4">{item.homeCourseId === null ? '-' : `본교 과목 ID ${item.homeCourseId}`}</td>
                    <td className="px-2 py-3"><button type="button" className={outlineButtonClass} onClick={() => { setHiddenIds((prev) => [...prev, item.itemId]); setMessage('화면에서만 숨겼습니다. 서버 과목은 삭제되지 않았습니다.'); }}>삭제</button></td>
                  </tr>)}
                  {demoItems.map((item) => <tr key={item.id} className="border-b border-line">
                    <td className="break-words px-3 py-4">{item.name} <span className="text-xs text-ink-muted">(임시)</span></td>
                    <td className="px-3 py-4">{item.credits}</td><td className="px-3 py-4">-</td><td className="px-3 py-4">{LABELS[item.recognitionType]}</td><td className="px-3 py-4">{item.homeCourse || '-'}</td>
                    <td className="px-2 py-3"><button type="button" className={outlineButtonClass} onClick={() => setDemoItems((prev) => prev.filter((x) => x.id !== item.id))}>삭제</button></td>
                  </tr>)}
                  {!visibleItems.length && !demoItems.length && <tr><td colSpan={6} className="px-3 py-10 text-center text-ink-muted">담은 과목이 없습니다.</td></tr>}
                </tbody>
              </table>
            </div>
            {hiddenIds.length > 0 && <button type="button" className={`mt-4 ${outlineButtonClass}`} onClick={() => setHiddenIds([])}>임시 삭제 취소</button>}
          </section>

          <section className="mb-6 rounded-[18px] border border-line bg-white px-5 py-7">
            <h2 className="mb-3 text-[25px] font-semibold text-ink">직접 입력</h2>
            <p className="mb-6 text-sm text-ink-muted">아래 과목 추가는 화면 테스트용이며 서버에 저장되지 않습니다.</p>
            <div className="grid gap-6 lg:grid-cols-[minmax(0,1.4fr)_minmax(0,0.8fr)_minmax(0,1.8fr)]">
              <label className="flex min-w-0 flex-col gap-3 text-[17px] font-semibold text-ink">교과목명<input className={inputClass} value={courseName} onChange={(event) => setCourseName(event.target.value)} placeholder="교과목명" /></label>
              <label className="flex min-w-0 flex-col gap-3 text-[17px] font-semibold text-ink">외국 학점<input className={inputClass} type="number" min="0.1" step="0.1" value={foreignCredits} onChange={(event) => setForeignCredits(event.target.value)} placeholder="예: 3" /></label>
              <fieldset className="min-w-0"><legend className="mb-3 text-[17px] font-semibold text-ink">인정 구분</legend><div className="flex flex-wrap gap-2">
                {(['MAJOR_REQUIRED', 'MAJOR_ELECTIVE', 'GENERAL'] as const).map((type) => <label key={type} className={`inline-flex min-h-[50px] cursor-pointer items-center gap-2 rounded-[7px] border px-4 text-[17px] ${recognitionType === type ? 'border-primary bg-primary-soft' : 'border-line bg-white'}`}><input type="radio" name="recognitionType" checked={recognitionType === type} onChange={() => setRecognitionType(type)}/>{LABELS[type]}</label>)}
              </div></fieldset>
            </div>
            <label className="mt-7 flex max-w-[660px] flex-col gap-3 text-[17px] font-semibold text-ink">본교 과목<input className={inputClass} value={homeCourse} onChange={(event) => setHomeCourse(event.target.value)} placeholder="본교 과목명 (화면 테스트용)" /></label>
            <button type="button" className={`mt-7 ${outlineButtonClass}`} onClick={addDemoCourse}>과목 추가</button>
            {message && <p role="status" className="mt-4 text-sm text-ink-sub">{message}</p>}
          </section>

          <section className="rounded-[16px] border border-line bg-primary-soft px-6 py-6">
            <h2 className="mb-4 text-[22px] font-semibold text-ink">학점 계산 및 인정 기준</h2>
            <p className="mb-3 text-[17px] text-ink">계산 규칙: {plan.calculation.rule === 'ECTS_X0_6' ? 'ECTS 환산 (정확한 비율은 서버 정책 적용)' : plan.calculation.rule === 'AS_IS' ? '외국 학점 그대로 인정' : '계산 불가'}</p>
            <p className="mb-3 text-[17px] text-ink-muted">과목별 인정 학점 및 경고는 서버 조회 결과를 사용합니다.</p>
            {plan.semesterCreditLimitWarning && <p role="alert" className="mb-3 font-semibold text-danger">학기당 예상 인정 학점 한도를 초과했습니다.</p>}
            <p className="text-[17px] text-ink-muted">참고용 예상치입니다. 최종 인정 학점은 소속 학과 확인이 필요합니다.</p>
          </section>
          <div className="mt-6 flex flex-wrap items-center justify-between gap-4">
            <p className="text-sm text-ink-muted">직접 입력 및 화면상 삭제는 실제 API 연동 전 임시 기능입니다.</p>
            <button type="button" onClick={() => setMessage('저장 API가 연결되지 않았습니다. 현재 변경사항은 서버에 저장되지 않습니다.')} className="min-h-[49px] min-w-[140px] rounded-[10px] bg-primary px-6 text-[17px] font-semibold text-white hover:opacity-90">저장</button>
          </div>
        </>}
      </div>
    </div>
  );
}
