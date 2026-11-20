import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router';

import { PATHS } from '@/app/paths';
import heroLight from '@/assets/decor/hero-light.svg';
import { api } from '@/shared/api/client';
import { searchHomeCourses } from '@/shared/api/homeCourses';
import type { HomeCourseSearchResult } from '@/shared/api/homeCourses';
import { useAddStudyPlanItem, useDeleteStudyPlanItem, useRenameStudyPlan, useUpdateStudyPlanItem } from '@/shared/api/studyPlans';
import { calculateMockPlan, getMockTotalExpectedCredit, MOCK_SEMESTER_LIMIT, readMockStudyPlans, saveMockStudyPlan } from '../mockStudyPlans';
import type { MockPlanItem } from '../mockStudyPlans';

type RecognitionType = 'MAJOR_REQUIRED' | 'MAJOR_ELECTIVE' | 'GENERAL';
type PlanItem = {
  itemId: number;
  itemType: string;
  courseName: string;
  foreignCredit: number | null;
  sourceCourseId: number | null;
  homeCourseId: number | null;
  homeCourseName?: string | null;
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

// 화면 테스트용 예시 과목입니다. 공식 본교 교과목 데이터가 아니며 서버로 전송하지 않습니다.
const MOCK_HOME_COURSES: { id: number; name: string; category: RecognitionType }[] = [
  { id: 900001, name: '마케팅원론', category: 'MAJOR_ELECTIVE' },
  { id: 900002, name: '재무회계', category: 'MAJOR_ELECTIVE' },
  { id: 900003, name: '경영학원론', category: 'MAJOR_REQUIRED' },
  { id: 900004, name: '국제경영', category: 'MAJOR_ELECTIVE' },
  { id: 900005, name: '글로벌문화의 이해', category: 'GENERAL' },
];

type HomeCourseFieldProps = {
  isMock: boolean;
  value: string;
  onChange: (value: string) => void;
  recognitionType: RecognitionType;
};

function HomeCourseField({ isMock, value, onChange, recognitionType }: HomeCourseFieldProps) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<HomeCourseSearchResult[]>([]);
  const [selected, setSelected] = useState<HomeCourseSearchResult | null>(null);
  const [searchError, setSearchError] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  const search = async () => {
    const keyword = query.trim();
    const length = Array.from(keyword).length;
    if (length < 1 || length > 50) {
      setSearchError('과목명은 1~50자로 입력해 주세요.');
      setResults([]);
      return;
    }
    if (recognitionType === 'GENERAL') return;
    setSearchError('');
    setHasSearched(true);
    setIsSearching(true);
    try {
      if (isMock) {
        const found = MOCK_HOME_COURSES.filter((course) => course.category === recognitionType && course.name.toLowerCase().includes(keyword.toLowerCase())).slice(0, 10);
        setResults(found.map((course) => ({ homeCourseId: course.id, name: course.name, code: `TEST${course.id}`, credit: 3, category: course.category as 'MAJOR_REQUIRED' | 'MAJOR_ELECTIVE' })));
      } else {
        setResults(await searchHomeCourses(keyword, recognitionType));
      }
    } catch (err) {
      setResults([]);
      setSearchError(err instanceof Error ? err.message : '본교 과목 검색에 실패했습니다.');
    }
    setIsSearching(false);
  };

  if (recognitionType === 'GENERAL') return <p className="text-[14px] text-ink-muted">교양 과목은 본교 인정 과목 선택 없이도 예상 인정 학점을 확인할 수 있습니다.</p>;

  return <div className="max-w-[660px] text-ink">
    <label htmlFor={`home-course-search-${recognitionType}`} className="mb-2 block text-[17px] font-semibold">본교 과목명 검색 (선택)</label>
    <div className="flex gap-2">
      <input id={`home-course-search-${recognitionType}`} className={inputClass}
        value={query} maxLength={50} placeholder="본교 과목명 검색"
        onChange={(e) => { setQuery(e.target.value); setResults([]); setHasSearched(false); setSearchError(''); if (value) onChange(''); setSelected(null); }}
        onKeyDown={(event) => { if (event.key === 'Enter') { event.preventDefault(); void search(); } }} />
      <button type="button" className={outlineButtonClass} disabled={isSearching} onClick={() => void search()}>{isSearching ? '검색 중...' : '검색'}</button>
    </div>
    {searchError && <p role="alert" className="mt-2 text-sm text-danger">{searchError}</p>}
    {hasSearched && !searchError && <div className="mt-2 max-h-[210px] overflow-y-auto rounded-[10px] border border-line bg-white p-2" role="listbox" aria-label="본교 과목 검색 결과">
      {results.length ? results.map((course) => <button type="button" role="option" aria-selected={value === String(course.homeCourseId)} key={course.homeCourseId}
        onClick={() => { onChange(String(course.homeCourseId)); setSelected(course); setQuery(course.name); setHasSearched(false); }}
        className="block w-full rounded-[7px] px-3 py-2 text-left text-[15px] hover:bg-primary-soft">
        {course.name} <span className="ml-1 text-xs text-ink-muted">{course.code} · {course.credit}학점 · {LABELS[course.category]}</span>
      </button>) : <p className="px-3 py-3 text-sm text-ink-muted">검색 결과가 없습니다.</p>}
    </div>}
    <div className="mt-2 flex flex-wrap items-center gap-3">
      <p className="text-xs text-ink-muted">{selected ? `선택: ${selected.name} (${selected.code}, ${selected.credit}학점)` : value ? `선택된 본교 과목 ID ${value}` : '선택하지 않으면 본교 과목을 연결하지 않습니다.'}</p>
      {value && <button type="button" className="text-sm font-semibold text-primary underline" onClick={() => { onChange(''); setQuery(''); setSelected(null); setResults([]); setHasSearched(false); }}>선택 해제</button>}
    </div>
  </div>;
}


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
        const stored = isMock
          ? readMockStudyPlans().find((entry) => entry.studyPlanId === Number(planId))
          : undefined;
        if (isMock && !stored) throw new Error('수강계획을 찾을 수 없습니다. 목록에서 다시 선택해 주세요.');
        const calculatedMock = stored ? calculateMockPlan(stored) : undefined;
        const result: PlanDetail = isMock && calculatedMock
          ? {
              studyPlanId: calculatedMock.studyPlanId,
              name: calculatedMock.name,
              universityId: calculatedMock.universityId,
              universityName: calculatedMock.universityName,
              calculation: { status: (calculatedMock.mockCalculationRule ? 'CALCULABLE' : 'NOT_CALCULABLE'), rule: calculatedMock.mockCalculationRule ?? null, reasonCode: calculatedMock.mockCalculationRule ? null : 'MOCK_UNVERIFIED' },
              items: calculatedMock.items,
              totalExpectedCredit: getMockTotalExpectedCredit(calculatedMock),
              semesterCreditLimit: MOCK_SEMESTER_LIMIT,
              semesterCreditLimitWarning: (getMockTotalExpectedCredit(calculatedMock) ?? 0) > MOCK_SEMESTER_LIMIT,
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
    if (isMock) {
      const stored = readMockStudyPlans().find((entry) => entry.studyPlanId === plan.studyPlanId);
      if (stored) saveMockStudyPlan({ ...stored, name, updatedAt: new Date().toISOString() });
      setPlan((previous) => previous ? { ...previous, name } : previous);
      setPlanName(name);
      setRenameMessage('계획 이름을 수정했습니다.');
      return;
    }
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
      const stored = readMockStudyPlans().find((entry) => entry.studyPlanId === plan.studyPlanId);
      if (stored) saveMockStudyPlan({
        ...stored,
        updatedAt: new Date().toISOString(),
        items: stored.items.map((item) => item.itemId === editingItemId ? { ...item, ...changes } : item),
      });
      setReloadKey((key) => key + 1);
      setEditingItemId(null);
      setMessage('과목 정보를 수정했습니다.');
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
      const stored = readMockStudyPlans().find((entry) => entry.studyPlanId === plan.studyPlanId);
      if (stored) saveMockStudyPlan({ ...stored, updatedAt: new Date().toISOString(), items: stored.items.filter((item) => item.itemId !== itemId) });
      setReloadKey((key) => key + 1);
      setMessage('과목을 삭제했습니다.');
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
      const newItem: MockPlanItem = {
        itemId: Date.now(), itemType: 'DIRECT', courseName: trimmedName,
        foreignCredit: credits, sourceCourseId: null, homeCourseId,
        recognitionType, expectedCredit: null, creditLimitWarning: false,
      };
      const stored = readMockStudyPlans().find((entry) => entry.studyPlanId === plan.studyPlanId);
      if (stored) saveMockStudyPlan({ ...stored, updatedAt: new Date().toISOString(), items: [...stored.items, newItem] });
      setReloadKey((key) => key + 1);
      setCourseName(''); setForeignCredits(''); setHomeCourse('');
      setMessage('과목을 추가했습니다.');
      return;
    }

    try {
      await addItemMutation.mutateAsync({
        itemType: 'CUSTOM', // 과목 추가 API의 요청 enum은 별도 명세 확인 전까지 유지
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
                    <td className="break-words px-3 py-4">{item.homeCourseName ?? '-'}</td>
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
                <HomeCourseField
                  key={`edit-${editingItemId}-${plan.items.find((item) => item.itemId === editingItemId)?.recognitionType}`}
                  isMock={isMock}
                  recognitionType={plan.items.find((item) => item.itemId === editingItemId)?.recognitionType ?? 'MAJOR_ELECTIVE'}
                  value={editHomeCourseId}
                  onChange={setEditHomeCourseId}
                />
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

            <div className="grid gap-6 lg:grid-cols-[minmax(0,1.4fr)_minmax(0,0.8fr)_minmax(0,1.8fr)]">
              <label className="flex min-w-0 flex-col gap-3 text-[17px] font-semibold text-ink">교과목명<input className={inputClass} value={courseName} onChange={(event) => setCourseName(event.target.value)} placeholder="교과목명" /></label>
              <label className="flex min-w-0 flex-col gap-3 text-[17px] font-semibold text-ink">외국 학점<input className={inputClass} type="number" min="0.1" step="0.1" value={foreignCredits} onChange={(event) => setForeignCredits(event.target.value)} placeholder="예: 3" /></label>
              <fieldset className="min-w-0"><legend className="mb-3 text-[17px] font-semibold text-ink">인정 구분</legend><div className="flex flex-wrap gap-2">
                {(['MAJOR_REQUIRED', 'MAJOR_ELECTIVE', 'GENERAL'] as const).map((type) => <label key={type} className={`inline-flex min-h-[50px] cursor-pointer items-center gap-2 rounded-[7px] border px-4 text-[17px] ${recognitionType === type ? 'border-primary bg-primary-soft' : 'border-line bg-white'}`}><input type="radio" name="recognitionType" checked={recognitionType === type} onChange={() => { setRecognitionType(type); setHomeCourse(''); }}/>{LABELS[type]}</label>)}
              </div></fieldset>
            </div>
            <div className="mt-7">
              <HomeCourseField key={`create-${recognitionType}`} isMock={isMock} recognitionType={recognitionType} value={homeCourse} onChange={setHomeCourse} />
            </div>
            <button type="button" className={`mt-7 ${outlineButtonClass} disabled:cursor-not-allowed disabled:opacity-50`} onClick={() => void handleAddCourse()} disabled={addItemMutation.isPending}>{addItemMutation.isPending ? '추가 중...' : '과목 추가'}</button>
            {message && <p role="status" className="mt-4 text-sm text-ink-sub">{message}</p>}
          </section>

          <section className="rounded-[16px] border border-line bg-primary-soft px-6 py-6">
            <h2 className="mb-5 text-[22px] font-semibold text-ink">학점 계산 및 인정 기준</h2>
            <p className="mb-5 text-[16px] text-ink">인증교 ECTS: 외국 학점 × 적용 환산율　·　US_STYLE: 외국 학점 그대로 적용</p>
            <p className="mb-4 text-[15px] text-ink-muted">전필·전선은 본교 과목을 지정해야 계산 가능하며, 교양은 지정하지 않아도 됩니다. 계산 불가 과목은 합계에서 제외됩니다.</p>
            <p className="text-[15px] text-ink-muted">학점 상한을 초과해도 계산값은 유지하고 경고를 표시합니다. 실제 한도는 적용 정책에 따라 달라집니다.</p>
          </section>
          <p className="mt-5 px-2 text-[15px] text-ink-muted">경영대학 내규 기준 계산이며 소속 학과 기준과 다를 수 있음</p>

        </>}
      </div>

    </div>
  );
}
