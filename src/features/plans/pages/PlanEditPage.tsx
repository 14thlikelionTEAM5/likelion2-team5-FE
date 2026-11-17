import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router';

import { PATHS } from '@/app/paths';
import heroLight from '@/assets/decor/hero-light.svg';
import { api } from '@/shared/api/client';
import { useAddStudyPlanItem, useDeleteStudyPlanItem, useRenameStudyPlan, useUpdateStudyPlanItem } from '@/shared/api/studyPlans';

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
  const [courseName, setCourseName] = useState('');
  const [foreignCredits, setForeignCredits] = useState('');
  const [recognitionType, setRecognitionType] = useState<RecognitionType>('MAJOR_ELECTIVE');
  const [homeCourse, setHomeCourse] = useState('');
  const [message, setMessage] = useState('');
  const [planName, setPlanName] = useState('');
  const [renameMessage, setRenameMessage] = useState('');
  const renameMutation = useRenameStudyPlan();
  const addItemMutation = useAddStudyPlanItem(Number(planId));
  const deleteItemMutation = useDeleteStudyPlanItem(Number(planId));
  const [deletingItemId, setDeletingItemId] = useState<number | null>(null);
  const updateItemMutation = useUpdateStudyPlanItem();
  const [editingItemId, setEditingItemId] = useState<number | null>(null);
  const [editCredits, setEditCredits] = useState('');
  const [editHomeCourseId, setEditHomeCourseId] = useState('');
  const [editMessage, setEditMessage] = useState('');
  const isMock = import.meta.env.VITE_USE_MOCK === 'true';

  useEffect(() => {
    let active = true;
    const load = async () => {
      setError('');
      setIsLoading(true);
      setPlan(null);
      setPlanName('');
      setRenameMessage('');
      setDemoItems([]);
      setEditingItemId(null);
      setEditMessage('');
      if (!planId || !/^[1-9]\d*$/.test(planId)) {
        setError('유효한 수강계획 ID가 아닙니다.');
        setIsLoading(false);
        return;
      }
      try {
        // 개발용 mock 데이터: 실제 API 호출 및 서버 저장을 하지 않음.
        const result: PlanDetail = isMock
          ? {
              studyPlanId: Number(planId),
              name: '테스트 수강계획',
              universityId: 1,
              universityName: '테스트 대학 (Mock)',
              calculation: { status: 'NOT_CALCULABLE', rule: null, reasonCode: 'MOCK_DATA' },
              items: [],
              totalExpectedCredit: 0,
              semesterCreditLimit: null,
              semesterCreditLimitWarning: false,
            }
          : await api<PlanDetail>(`/study-plans/${planId}`);
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
  }, [planId, reloadKey, isMock]);

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

  const openCourseEdit = (item: PlanItem) => {
    setEditingItemId(item.itemId);
    setEditCredits(item.foreignCredit === null ? '' : String(item.foreignCredit));
    setEditHomeCourseId(item.homeCourseId === null ? '' : String(item.homeCourseId));
    setEditMessage('');
  };

  const handleUpdateCourse = async () => {
    if (!plan || editingItemId === null || updateItemMutation.isPending) return;
    const original = plan.items.find((item) => item.itemId === editingItemId);
    if (!original) return;

    const rawCredits = editCredits.trim();
    const creditNumber = Number(rawCredits);
    if (!/^\d{1,2}(?:\.\d)?$/.test(rawCredits) || creditNumber <= 0 || creditNumber > 99.9) {
      setEditMessage('외국 학점은 0.1~99.9 사이이며 소수 첫째 자리까지만 입력할 수 있습니다.');
      return;
    }
    const rawHomeId = editHomeCourseId.trim();
    const homeId = rawHomeId ? Number(rawHomeId) : null;
    if (homeId !== null && (!/^\d+$/.test(rawHomeId) || !Number.isSafeInteger(homeId) || homeId <= 0)) {
      setEditMessage('본교 과목 ID는 양의 정수로 입력하거나 비워 주세요.');
      return;
    }

    const changes: { foreignCredit?: number; homeCourseId?: number | null } = {};
    if (creditNumber !== original.foreignCredit) changes.foreignCredit = creditNumber;
    if (homeId !== original.homeCourseId) changes.homeCourseId = homeId;
    if (!Object.keys(changes).length) {
      setEditMessage('변경된 내용이 없습니다.');
      return;
    }

    setEditMessage('');
    if (isMock) {
      setPlan((current) => current ? {
        ...current,
        items: current.items.map((item) => item.itemId === editingItemId ? { ...item, ...changes } : item),
      } : current);
      setEditingItemId(null);
      setMessage('Mock 모드: 화면에서만 과목을 수정했습니다. 서버에는 저장되지 않습니다.');
      return;
    }

    try {
      await updateItemMutation.mutateAsync({
        studyPlanId: plan.studyPlanId,
        itemId: editingItemId,
        changes,
      });
      setEditingItemId(null);
      setMessage('과목을 수정했습니다. 학점을 다시 계산합니다.');
      setReloadKey((key) => key + 1);
    } catch (err) {
      setEditMessage(err instanceof Error ? err.message : '과목 수정에 실패했습니다.');
    }
  };

  const visibleItems = plan?.items ?? [];
  const handleDeleteCourse = async (itemId: number) => {
    if (!plan || deleteItemMutation.isPending) return;
    setMessage('');
    if (isMock) {
      setPlan((current) => current ? {
        ...current,
        items: current.items.filter((item) => item.itemId !== itemId),
      } : current);
      setMessage('Mock 모드: 화면에서만 과목을 삭제했습니다. 서버에는 반영되지 않습니다.');
      return;
    }
    setDeletingItemId(itemId);
    try {
      await deleteItemMutation.mutateAsync(itemId);
      setPlan((current) => current ? {
        ...current,
        items: current.items.filter((item) => item.itemId !== itemId),
      } : current);
      // 삭제 후 서버에서 학점 합계와 경고도 다시 조회함.
      setReloadKey((key) => key + 1);
    } catch (err) {
      setMessage(err instanceof Error ? err.message : '과목 삭제에 실패했습니다.');
    } finally {
      setDeletingItemId(null);
    }
  };
  const handleAddCourse = async () => {
    if (!plan || addItemMutation.isPending) return;
    const credits = Number(foreignCredits);
    const trimmedName = courseName.trim();
    if (!trimmedName || trimmedName.length > 200 || !foreignCredits.trim() ||
        !Number.isFinite(credits) || credits <= 0 || credits > 99.9 ||
        Math.round(credits * 10) !== credits * 10) {
      setMessage('교과목명(최대 200자)과 외국 학점(0.1~99.9, 소수 첫째 자리)을 확인해 주세요.');
      return;
    }

    // API의 homeCourseId는 과목명이 아닌 양의 정수 ID이며 선택값임.
    const homeCourseValue = homeCourse.trim();
    const homeCourseId = homeCourseValue ? Number(homeCourseValue) : null;
    if (homeCourseId !== null && (!Number.isSafeInteger(homeCourseId) || homeCourseId <= 0)) {
      setMessage('본교 과목 ID는 양의 정수로 입력하거나 비워 주세요.');
      return;
    }

    setMessage('');
    if (isMock) {
      setDemoItems((prev) => [...prev, {
        id: Date.now(), name: trimmedName, credits, recognitionType,
        homeCourse: homeCourseId === null ? '' : `본교 과목 ID ${homeCourseId}`,
      }]);
      setCourseName(''); setForeignCredits(''); setHomeCourse('');
      setMessage('Mock 모드: 과목을 화면에만 추가했습니다. 서버에 저장되지 않습니다.');
      return;
    }

    try {
      await addItemMutation.mutateAsync({
        itemType: 'CUSTOM',
        courseName: trimmedName,
        foreignCredit: credits,
        sourceCourseId: null,
        homeCourseId,
        recognitionType,
      });
      setCourseName(''); setForeignCredits(''); setHomeCourse('');
      setMessage('과목이 추가되었습니다. 최신 정보를 불러옵니다.');
      setReloadKey((key) => key + 1);
    } catch (err) {
      setMessage(err instanceof Error ? err.message : '과목 추가에 실패했습니다.');
    }
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
                <thead className="bg-panel text-[17px] font-semibold"><tr><th className="px-3 py-3">교과목</th><th className="px-3 py-3">외국 학점</th><th className="px-3 py-3">인정 학점</th><th className="px-3 py-3">인정 구분</th><th className="px-3 py-3">본교 과목</th><th className="px-2 py-3"><span className="sr-only">수정 및 삭제</span></th></tr></thead>
                <tbody>
                  {visibleItems.map((item) => <tr key={item.itemId} className="border-b border-line">
                    <td className="break-words px-3 py-4">{item.courseName}</td><td className="px-3 py-4">{item.foreignCredit ?? '-'}</td>
                    <td className="px-3 py-4">{item.expectedCredit ?? '-'}{item.creditLimitWarning && <span className="ml-2 text-danger">한도 초과</span>}</td>
                    <td className="px-3 py-4">{LABELS[item.recognitionType] ?? '확인 필요'}</td>
                    <td className="break-words px-3 py-4">{item.homeCourseId === null ? '-' : `본교 과목 ID ${item.homeCourseId}`}</td>
                    <td className="px-2 py-3"><div className="flex flex-wrap gap-2"><button type="button" className={outlineButtonClass} onClick={() => openCourseEdit(item)}>수정</button><button type="button" className={`${outlineButtonClass} disabled:cursor-not-allowed disabled:opacity-50`} disabled={deleteItemMutation.isPending || updateItemMutation.isPending} onClick={() => void handleDeleteCourse(item.itemId)}>{deletingItemId === item.itemId ? '삭제 중...' : '삭제'}</button></div></td>
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
          </section>

          {editingItemId !== null && (
            <section className="mb-6 rounded-[18px] border border-line bg-white px-5 py-6">
              <h2 className="mb-3 text-[23px] font-semibold text-ink">과목 수정</h2>
              <p className="mb-4 text-sm text-ink-muted">
                {plan.items.find((item) => item.itemId === editingItemId)?.courseName} · 외국 학점과 본교 과목 연결만 수정할 수 있습니다.
              </p>
              <div className="grid gap-4 sm:grid-cols-2">
                <label className="flex flex-col gap-2 text-[17px] font-semibold text-ink">
                  외국 학점
                  <input className={inputClass} type="number" min="0.1" max="99.9" step="0.1" value={editCredits} onChange={(event) => setEditCredits(event.target.value)} />
                </label>
                <label className="flex flex-col gap-2 text-[17px] font-semibold text-ink">
                  본교 과목 ID (선택)
                  <input className={inputClass} inputMode="numeric" value={editHomeCourseId} onChange={(event) => setEditHomeCourseId(event.target.value)} placeholder="비우면 본교 과목 연결 해제" />
                </label>
              </div>
              {editMessage && <p role="alert" className="mt-3 text-sm text-danger">{editMessage}</p>}
              <div className="mt-5 flex flex-wrap gap-3">
                <button type="button" className="min-h-[49px] rounded-[10px] bg-primary px-6 text-[17px] font-semibold text-white disabled:opacity-50" onClick={() => void handleUpdateCourse()} disabled={updateItemMutation.isPending}>{updateItemMutation.isPending ? '수정 중...' : '변경사항 저장'}</button>
                <button type="button" className={outlineButtonClass} onClick={() => { setEditingItemId(null); setEditMessage(''); }} disabled={updateItemMutation.isPending}>취소</button>
              </div>
            </section>
          )}

          <section className="mb-6 rounded-[18px] border border-line bg-white px-5 py-7">
            <h2 className="mb-3 text-[25px] font-semibold text-ink">직접 입력</h2>
            <p className="mb-6 text-sm text-ink-muted">{isMock ? 'Mock 모드에서는 화면 테스트용이며 서버에 저장되지 않습니다.' : '직접 입력 과목은 CUSTOM 유형으로 서버에 저장됩니다.'}</p>
            <div className="grid gap-6 lg:grid-cols-[minmax(0,1.4fr)_minmax(0,0.8fr)_minmax(0,1.8fr)]">
              <label className="flex min-w-0 flex-col gap-3 text-[17px] font-semibold text-ink">교과목명<input className={inputClass} value={courseName} onChange={(event) => setCourseName(event.target.value)} placeholder="교과목명" /></label>
              <label className="flex min-w-0 flex-col gap-3 text-[17px] font-semibold text-ink">외국 학점<input className={inputClass} type="number" min="0.1" step="0.1" value={foreignCredits} onChange={(event) => setForeignCredits(event.target.value)} placeholder="예: 3" /></label>
              <fieldset className="min-w-0"><legend className="mb-3 text-[17px] font-semibold text-ink">인정 구분</legend><div className="flex flex-wrap gap-2">
                {(['MAJOR_REQUIRED', 'MAJOR_ELECTIVE', 'GENERAL'] as const).map((type) => <label key={type} className={`inline-flex min-h-[50px] cursor-pointer items-center gap-2 rounded-[7px] border px-4 text-[17px] ${recognitionType === type ? 'border-primary bg-primary-soft' : 'border-line bg-white'}`}><input type="radio" name="recognitionType" checked={recognitionType === type} onChange={() => setRecognitionType(type)}/>{LABELS[type]}</label>)}
              </div></fieldset>
            </div>
            <label className="mt-7 flex max-w-[660px] flex-col gap-3 text-[17px] font-semibold text-ink">본교 과목 ID (선택)<input className={inputClass} inputMode="numeric" value={homeCourse} onChange={(event) => setHomeCourse(event.target.value)} placeholder="예: 16 (없으면 비워두세요)" /></label>
            <button type="button" className={`mt-7 ${outlineButtonClass} disabled:cursor-not-allowed disabled:opacity-50`} onClick={() => void handleAddCourse()} disabled={addItemMutation.isPending}>{addItemMutation.isPending ? '추가 중...' : '과목 추가'}</button>
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
            <p className="text-sm text-ink-muted">아래 저장 버튼은 아직 서버에 연결되지 않았습니다. 과목 추가·수정·삭제는 각각의 버튼에서 처리됩니다.</p>
            <button type="button" onClick={() => setMessage('저장 API가 연결되지 않았습니다. 현재 변경사항은 서버에 저장되지 않습니다.')} className="min-h-[49px] min-w-[140px] rounded-[10px] bg-primary px-6 text-[17px] font-semibold text-white hover:opacity-90">저장</button>
          </div>
        </>}
      </div>
    </div>
  );
}
