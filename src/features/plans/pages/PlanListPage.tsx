import { useEffect, useState } from 'react';
import type { FormEvent } from 'react';
import { useNavigate } from 'react-router';

import { PATHS } from '@/app/paths';
import heroLight from '@/assets/decor/hero-light.svg';
import { api } from '@/shared/api/client';
import { useCreateStudyPlan, useDeleteStudyPlan } from '@/shared/api/studyPlans';
import { calculateMockPlan, getMockTotalExpectedCredit, readMockStudyPlans, writeMockStudyPlans } from '../mockStudyPlans';
import { searchUniversities } from '@/shared/api/universities';
import type { UniversitySearchResult } from '@/shared/api/universities';

type StudyPlanSummary = {
  studyPlanId: number;
  universityId: number;
  universityName: string;
  name: string;
  courseCount: number;
  totalExpectedCredits: number | null;
  createdAt: string;
  updatedAt: string;
};

type StudyPlanDetail = {
  studyPlanId: number;
  name: string;
  universityId: number;
  universityName: string;
  items: {
    itemId: number;
    courseName: string;
    recognitionType: 'MAJOR_REQUIRED' | 'MAJOR_ELECTIVE' | 'GENERAL';
    expectedCredit: number | null;
    homeCourseId: number | null;
    homeCourseName?: string | null;
  }[];
};

const MAX_PLANS = 5;
// Figma 예시의 기준 학점. 실제 개인별 기준은 추후 명세에 맞춰 변경할 수 있습니다.
const REFERENCE_CREDITS = 18;

// 학교 검색 API 연결 전 Mock 검색용 협정교 목록입니다.
// 실제 환경에서는 대학 검색 API 명세를 받은 뒤 교체해야 합니다.
const MOCK_UNIVERSITIES = [
  { id: 101, name: 'University of Toronto', country: '캐나다' },
  { id: 102, name: 'University of British Columbia', country: '캐나다' },
  { id: 103, name: 'University of Melbourne', country: '호주' },
  { id: 104, name: 'Waseda University', country: '일본' },
  { id: 105, name: 'University of Groningen', country: '네덜란드' },
  { id: 106, name: 'Texas State University', country: '미국' },
  { id: 107, name: 'Florida International University', country: '미국' },
] as const;

const DEFAULT_PLAN_NAME = '2027-1 교환학생 수강계획';
const USE_MOCK = import.meta.env.DEV && import.meta.env.VITE_USE_MOCK === 'true';
const recognitionLabel = {
  MAJOR_REQUIRED: '전필',
  MAJOR_ELECTIVE: '전선',
  GENERAL: '교양',
} as const;

function getSemester(name: string): string | null {
  const match = name.match(/\b(20\d{2}-[12])\b/);
  return match ? `${match[1]}학기` : null;
}

export default function PlanListPage() {
  const navigate = useNavigate();
  const [plans, setPlans] = useState<StudyPlanSummary[]>([]);
  const [details, setDetails] = useState<Record<number, StudyPlanDetail>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [deleteTargetId, setDeleteTargetId] = useState<number | null>(null);
  const [deleteError, setDeleteError] = useState('');
  const [notice, setNotice] = useState('');
  const [reloadKey, setReloadKey] = useState(0);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isLimitAlertOpen, setIsLimitAlertOpen] = useState(false);
  const [createName, setCreateName] = useState('');
  const [schoolResults, setSchoolResults] = useState<UniversitySearchResult[]>([]);
  const [selectedSchool, setSelectedSchool] = useState<UniversitySearchResult | null>(null);
  const [schoolSearchError, setSchoolSearchError] = useState('');
  const [schoolSearching, setSchoolSearching] = useState(false);
  const [schoolQuery, setSchoolQuery] = useState('');
  const [appliedSchoolQuery, setAppliedSchoolQuery] = useState('');
  const [selectedSchoolId, setSelectedSchoolId] = useState<number | null>(null);
  const [createError, setCreateError] = useState('');
  const createPlan = useCreateStudyPlan();
  const deletePlan = useDeleteStudyPlan();

  const handleSchoolSearch = async (keyword = schoolQuery) => {
    const normalized = keyword.trim();
    const length = Array.from(normalized).length;
    if (length < 1 || length > 50) {
      setSchoolSearchError('학교명은 1~50자로 입력해 주세요.');
      setSchoolResults([]);
      return;
    }
    setSchoolSearchError('');
    setAppliedSchoolQuery(normalized);
    if (USE_MOCK) {
      const matches = MOCK_UNIVERSITIES.filter((school) => school.name.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().includes(normalized.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase())).slice(0, 10);
      setSchoolResults(matches.map((school) => ({ universityId: school.id, name: school.name, country: school.country })));
      return;
    }
    setSchoolSearching(true);
    try {
      const result = await searchUniversities(normalized);
      setSchoolResults(result);
    } catch (err) {
      setSchoolResults([]);
      setSchoolSearchError(err instanceof Error ? err.message : '학교 검색에 실패했습니다.');
    } finally {
      setSchoolSearching(false);
    }
  };

  const handleCreate = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const universityId = selectedSchoolId;
    const name = USE_MOCK ? DEFAULT_PLAN_NAME : (createName.trim() || DEFAULT_PLAN_NAME);
    if (universityId === null || !Number.isSafeInteger(universityId) || universityId <= 0 || !name) {
      setCreateError('검색 결과에서 학교를 먼저 선택해 주세요.');
      return;
    }
    if (plans.length >= MAX_PLANS) {
      setIsCreateOpen(false);
      setIsLimitAlertOpen(true);
      return;
    }
    if (plans.some((plan) => plan.universityId === universityId)) {
      setCreateError('이미 해당 대학의 수강계획이 있습니다.');
      return;
    }
    setCreateError('');
    if (USE_MOCK) {
      const now = new Date().toISOString();
      const mockId = Date.now();
      const mockPlan = {
        studyPlanId: mockId,
        universityId,
        universityName: selectedSchool?.name ?? `대학 ID ${universityId}`,
        name,
        createdAt: now,
        updatedAt: now,
        items: [],
      };
      writeMockStudyPlans([mockPlan, ...readMockStudyPlans()]);
      setPlans((previous) => [{
        studyPlanId: mockId,
        universityId,
        universityName: selectedSchool?.name ?? `대학 ID ${universityId}`,
        name,
        courseCount: 0,
        totalExpectedCredits: 0,
        createdAt: now,
        updatedAt: now,
      }, ...previous]);
      setDetails((previous) => ({ ...previous, [mockId]: {
        studyPlanId: mockId,
        name,
        universityId,
        universityName: selectedSchool?.name ?? `대학 ID ${universityId}`,
        items: [],
      } }));
      setIsCreateOpen(false);
      setCreateName('');
      setSchoolResults([]);
      setSelectedSchool(null);
      setSchoolQuery('');
      setAppliedSchoolQuery('');
      setSelectedSchoolId(null);
      setNotice('수강계획이 생성되었습니다.');
      return;
    }
    try {
      const result = await createPlan.mutateAsync({ universityId, name });
      setIsCreateOpen(false);
      setCreateName('');
      setSchoolResults([]);
      setSelectedSchool(null);
      setSchoolQuery('');
      setAppliedSchoolQuery('');
      setSelectedSchoolId(null);
      setNotice('수강계획이 생성되었습니다.');
      setReloadKey((key) => key + 1);
      // 생성 API 응답의 실제 studyPlanId를 사용해 편집 화면으로 이동합니다.
      navigate(PATHS.planEdit(result.studyPlanId));
    } catch (err) {
      setCreateError(err instanceof Error ? err.message : '수강계획 생성에 실패했습니다.');
    }
  };

  useEffect(() => {
    if (USE_MOCK) {
      const saved = readMockStudyPlans().map(calculateMockPlan);
      setPlans(saved.map((plan) => ({
        studyPlanId: plan.studyPlanId,
        universityId: plan.universityId,
        universityName: plan.universityName,
        name: plan.name,
        courseCount: plan.items.length,
        totalExpectedCredits: getMockTotalExpectedCredit(plan),
        createdAt: plan.createdAt,
        updatedAt: plan.updatedAt,
      })));
      setDetails(Object.fromEntries(saved.map((plan) => [plan.studyPlanId, {
        studyPlanId: plan.studyPlanId,
        name: plan.name,
        universityId: plan.universityId,
        universityName: plan.universityName,
        items: plan.items,
      }])));
      setIsLoading(false);
      setError('');
      return;
    }
    let active = true;
    const load = async () => {
      setIsLoading(true);
      setError('');
      try {
        const list = await api<StudyPlanSummary[]>('/study-plans');
        if (!active) return;
        if (!Array.isArray(list)) {
          throw new Error('수강계획 목록 API 응답이 올바르지 않습니다. 백엔드 연결과 응답 데이터를 확인해 주세요.');
        }
        setPlans(list);
        setDetails({});
        // 목록 응답에는 개별 과목이 없어 상세 조회를 함께 호출합니다.
        const results = await Promise.allSettled(
          list.map((plan) => api<StudyPlanDetail>(`/study-plans/${plan.studyPlanId}`)),
        );
        if (!active) return;
        const next: Record<number, StudyPlanDetail> = {};
        results.forEach((result, index) => {
          if (result.status === 'fulfilled' && result.value && Array.isArray(result.value.items)) {
            next[list[index].studyPlanId] = result.value;
          }
        });
        setDetails(next);
      } catch (err) {
        if (active) setError(err instanceof Error ? err.message : '수강계획 목록을 불러오지 못했습니다.');
      } finally {
        if (active) setIsLoading(false);
      }
    };
    void load();
    return () => { active = false; };
  }, [reloadKey]);

  const handleDelete = async () => {
    if (deleteTargetId === null || deletePlan.isPending) return;
    setDeleteError('');
    if (USE_MOCK) {
      writeMockStudyPlans(readMockStudyPlans().filter((plan) => plan.studyPlanId !== deleteTargetId));
      setPlans((previous) => previous.filter((plan) => plan.studyPlanId !== deleteTargetId));
      setDetails((previous) => {
        const next = { ...previous };
        delete next[deleteTargetId];
        return next;
      });
      setDeleteTargetId(null);
      setNotice('수강계획이 삭제되었습니다.');
      return;
    }
    try {
      await deletePlan.mutateAsync(deleteTargetId);
      setDeleteTargetId(null);
      setNotice('수강계획이 삭제되었습니다.');
      setReloadKey((key) => key + 1);
    } catch (err) {
      setDeleteError(err instanceof Error ? err.message : '수강계획 삭제에 실패했습니다.');
    }
  };

  return (
    <div className="mx-auto flex w-full max-w-[1440px] flex-col gap-9">
      <section
        className="relative flex min-h-[212px] flex-col justify-center overflow-hidden rounded-card bg-primary-soft bg-cover bg-center px-6 py-8 sm:px-11"
        style={{ backgroundImage: `url("${heroLight}")` }}
      >
        <div className="relative z-10 flex flex-col gap-3">
          <p className="text-sm font-semibold text-ink-sub">수강계획</p>
          <h1 className="text-[30px] font-bold text-primary sm:text-[34px]">내 수강계획 목록</h1>
          <p className="text-base text-ink-sub sm:text-lg">파견교별 수강계획을 만들고 관리하세요.</p>
        </div>
      </section>

      <section className="min-h-[720px] rounded-[24px] bg-white px-5 py-8 sm:px-10 sm:py-12">
        <div className="mb-5 flex flex-wrap items-center justify-between gap-4">
          <p className="text-[16px] text-ink-muted sm:text-[18px]">
            수강계획은 최대 5개까지, 대학별로 1개만 만들 수 있음
          </p>
          <button
            type="button"
            onClick={() => {
              if (plans.length >= MAX_PLANS) {
                setIsLimitAlertOpen(true);
                return;
              }
              setCreateError('');
              setIsCreateOpen(true);
            }}
            disabled={isLoading}
            className="min-h-[52px] min-w-[190px] rounded-[10px] bg-primary px-6 text-[18px] font-semibold text-white transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40 sm:min-w-[240px]"
          >
            + 새 계획 만들기
          </button>
        </div>
        {notice && <p role="status" className="mb-4 text-sm text-ink-sub">{notice}</p>}

        {isLoading ? (
          <p role="status" className="py-12 text-center text-ink-muted">수강계획을 불러오는 중입니다...</p>
        ) : error ? (
          <div className="flex flex-col items-center gap-4 py-12">
            <p role="alert" className="text-danger">{error}</p>
            <button type="button" className="rounded-[8px] border border-primary px-5 py-2 text-primary" onClick={() => setReloadKey((key) => key + 1)}>다시 시도</button>
          </div>
        ) : plans.length === 0 ? (
          <div className="flex min-h-[370px] flex-col items-center justify-center gap-3 rounded-[18px] border border-line bg-white px-6 text-center">
            <p className="text-[24px] font-semibold text-ink">아직 작성한 수강계획이 없습니다</p>
            <p className="text-[17px] text-ink-muted">새 계획 만들기를 통해 수강계획을 작성할 수 있습니다.</p>
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            {plans.map((plan) => (
              <article key={plan.studyPlanId} className="overflow-hidden rounded-[18px] border border-line bg-white p-5 sm:p-6">
                <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <h2 className="text-[22px] font-semibold leading-snug text-ink sm:text-[26px]">{plan.universityName}</h2>
                    <p className="mt-1 text-sm text-ink-muted">{plan.name}</p>
                  </div>
                  {getSemester(plan.name) && <span className="text-[18px] text-ink-muted">{getSemester(plan.name)}</span>}
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full min-w-[690px] table-fixed text-left text-ink">
                    <colgroup><col className="w-[28%]" /><col className="w-[20%]" /><col className="w-[32%]" /><col className="w-[20%]" /></colgroup>
                    <thead className="bg-panel text-[17px] font-semibold sm:text-[18px]">
                      <tr><th className="px-3 py-3 font-semibold">교과목</th><th className="px-3 py-3 font-semibold">인정 구분</th><th className="px-3 py-3 font-semibold">본교 과목</th><th className="px-3 py-3 font-semibold">인정 학점</th></tr>
                    </thead>
                    <tbody className="text-[16px] sm:text-[17px]">
                      {details[plan.studyPlanId] ? (
                        details[plan.studyPlanId].items.length ? details[plan.studyPlanId].items.map((item) => (
                          <tr key={item.itemId} className="border-b border-line">
                            <td className="px-3 py-3">{item.courseName}</td>
                            <td className="px-3 py-3">{recognitionLabel[item.recognitionType] ?? '확인 필요'}</td>
                            <td className="px-3 py-3">{item.homeCourseName ?? '-'}</td>
                            <td className="px-3 py-3">{item.expectedCredit ?? '-'}</td>
                          </tr>
                        )) : <tr><td colSpan={4} className="px-3 py-6 text-center text-ink-muted">등록된 과목이 없습니다.</td></tr>
                      ) : <tr><td colSpan={4} className="px-3 py-6 text-center text-ink-muted">과목 상세 정보를 불러오지 못했습니다.</td></tr>}
                    </tbody>
                  </table>
                </div>

                <div className="mt-7 flex flex-wrap items-center justify-between gap-4">
                  <p className="text-[17px] font-semibold text-primary sm:text-[19px]">
                    {(() => {
                      const items = details[plan.studyPlanId]?.items;
                      const totalCredits = items
                        ? (items.length === 0 ? 0 : items.every((item) => item.expectedCredit === null)
                          ? null : Math.round(items.reduce((sum, item) => sum + (item.expectedCredit ?? 0), 0) * 100) / 100)
                        : plan.totalExpectedCredits;
                      return totalCredits === null
                        ? '합계 계산 불가'
                        : `합계 ${totalCredits} / ${REFERENCE_CREDITS}학점`;
                    })()}
                    <span className="font-normal text-ink-muted"> · 참고용 예상치</span>
                  </p>
                  <div className="flex items-center gap-3">
                    <button type="button" onClick={() => navigate(PATHS.planEdit(plan.studyPlanId))} className="min-h-[46px] min-w-[95px] rounded-[7px] border border-primary px-4 text-[17px] font-semibold text-primary hover:bg-primary-soft">편집</button>
                    <button type="button" onClick={() => { setDeleteError(''); setDeleteTargetId(plan.studyPlanId); }} className="min-h-[46px] min-w-[95px] rounded-[7px] border border-primary px-4 text-[17px] font-semibold text-primary hover:bg-primary-soft">삭제</button>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
        <p className="mt-7 text-sm text-ink-muted">예상 인정 학점은 참고용이며, 최종 학점 인정은 학과 확인이 필요합니다.</p>
      </section>


      {isCreateOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-3 py-6"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget && !createPlan.isPending) setIsCreateOpen(false);
          }}
        >
          <form
            onSubmit={(event) => { void handleCreate(event); }}
            role="dialog"
            aria-modal="true"
            aria-labelledby="create-plan-title"
            className="flex w-full max-w-[780px] flex-col overflow-hidden rounded-[15px] bg-white shadow-2xl"
          >
            <header className="flex min-h-[64px] items-center justify-between bg-primary px-6 text-white">
              <h2 id="create-plan-title" className="text-[23px] font-bold">새 수강계획 만들기</h2>
              <button type="button" aria-label="닫기" disabled={createPlan.isPending} onClick={() => setIsCreateOpen(false)} className="rounded p-2 text-[28px] leading-none hover:bg-white/10">×</button>
            </header>

            <>
                <div className="border-b border-line bg-[#f1f5f9] px-6 py-5">
                  <label htmlFor="school-search" className="mb-2 block text-[16px] font-semibold text-primary">학교 검색</label>
                  <div className="flex items-center gap-3">
                    <input
                      id="school-search"
                      type="search"
                      value={schoolQuery}
                      onChange={(event) => { setSchoolQuery(event.target.value); setSchoolSearchError(''); setSchoolResults([]); setAppliedSchoolQuery(''); setSelectedSchoolId(null); setSelectedSchool(null); }}
                      onKeyDown={(event) => { if (event.key === 'Enter') { event.preventDefault(); void handleSchoolSearch(); } }}
                      placeholder="학교명을 입력하세요"
                      className="min-w-0 flex-1 rounded-[7px] border border-line bg-white px-4 py-3 text-ink outline-none focus:border-primary"
                    />
                    <button type="button" onClick={() => void handleSchoolSearch()} className="min-w-[100px] rounded-full bg-[#398aa2] px-5 py-3 font-semibold text-white hover:opacity-90" disabled={schoolSearching}>{schoolSearching ? '검색 중...' : '검색'}</button>
                  </div>
                </div>

                <div className="grid min-h-[300px] grid-cols-1 gap-0 border-b border-line sm:grid-cols-2">
                  <section className="min-w-0 border-b border-line sm:border-b-0 sm:border-r" aria-labelledby="school-results-title">
                    <h3 id="school-results-title" className="bg-[#e5ecf3] px-5 py-3 text-base font-semibold text-primary">검색 결과</h3>
                    <div className="max-h-[310px] space-y-2 overflow-y-auto p-4">
                      {schoolSearchError && <p role="alert" className="px-3 text-sm text-danger">{schoolSearchError}</p>}
                      {schoolResults.map((school) => {
                        const alreadyAdded = plans.some((plan) => plan.universityId === school.universityId);
                        const isSelected = selectedSchoolId === school.universityId;
                        return (
                          <button
                            key={school.universityId}
                            type="button"
                            disabled={alreadyAdded || createPlan.isPending}
                            onClick={() => { setSelectedSchoolId(school.universityId); setSelectedSchool(school); setCreateError(''); }}
                            aria-pressed={isSelected}
                            className={`flex w-full items-center gap-3 rounded-[12px] border px-4 py-3 text-left transition-colors ${isSelected ? 'border-primary bg-[#edf5f7]' : 'border-line bg-[#f7fafc] hover:border-primary'} disabled:cursor-not-allowed disabled:opacity-50`}
                          >
                            <span className={`flex h-[17px] w-[17px] shrink-0 items-center justify-center rounded-full border ${isSelected ? 'border-primary' : 'border-[#bbcad7]'}`}>
                              {isSelected && <span className="h-[9px] w-[9px] rounded-full bg-primary" />}
                            </span>
                            <span className="min-w-0 flex-1">
                              <span className="block break-words text-[14px] font-semibold text-ink">{school.name}</span>
                              <span className="block text-[12px] text-ink-muted">{school.country}</span>
                            </span>
                            {alreadyAdded && <span className="shrink-0 text-[11px] text-ink-muted">이미 계획 있음</span>}
                          </button>
                        );
                      })}
                      {appliedSchoolQuery && !schoolSearching && !schoolSearchError && schoolResults.length === 0 && (
                        <p className="py-8 text-center text-sm text-ink-muted">검색 결과가 없습니다.</p>
                      )}
                    </div>
                  </section>
                  <section className="min-w-0" aria-labelledby="selected-school-title">
                    <h3 id="selected-school-title" className="bg-[#e5ecf3] px-5 py-3 text-base font-semibold text-primary">선택한 학교</h3>
                    {selectedSchool ? (
                      <dl className="grid grid-cols-[75px_minmax(0,1fr)] gap-x-3 gap-y-5 px-5 py-6 text-sm">
                        <dt className="font-semibold text-ink-sub">학교명</dt>
                        <dd className="break-words font-semibold text-primary">{selectedSchool?.name}</dd>
                        <dt className="font-semibold text-ink-sub">국가</dt>
                        <dd className="text-ink">{selectedSchool?.country}</dd>
                      </dl>
                    ) : (
                      <p className="px-5 py-6 text-sm text-ink-muted">왼쪽 검색 결과에서 학교를 선택해 주세요.</p>
                    )}
                  </section>
                </div>
                <div className="px-6 py-4">
                  <label htmlFor="create-plan-name" className="mb-2 block text-sm font-semibold text-ink">계획 이름</label>
                  <input id="create-plan-name" type="text" maxLength={100} value={createName} onChange={(event) => setCreateName(event.target.value)} className="w-full rounded-[8px] border border-line px-4 py-3 text-ink" placeholder={DEFAULT_PLAN_NAME} />
                </div>
            </>
            {createError && <p role="alert" className="px-6 pt-3 text-sm text-danger">{createError}</p>}
            <footer className="flex items-center justify-end gap-3 p-5">
              <button type="button" onClick={() => setIsCreateOpen(false)} disabled={createPlan.isPending} className="rounded-[8px] border border-line px-5 py-3 font-semibold text-ink">취소</button>
              <button type="submit" disabled={createPlan.isPending || selectedSchoolId === null} className="rounded-full bg-[#398aa2] px-7 py-3 font-semibold text-white hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40">{createPlan.isPending ? '생성 중...' : '생성하기'}</button>
            </footer>
          </form>
        </div>
      )}

      {isLimitAlertOpen && (
        <div
          className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 px-4 py-8"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) setIsLimitAlertOpen(false);
          }}
        >
          <div
            role="alertdialog"
            aria-modal="true"
            aria-labelledby="plan-limit-title"
            className="w-full max-w-[420px] rounded-[16px] bg-white px-5 py-5 shadow-xl sm:px-6"
          >
            <h2 id="plan-limit-title" className="text-[18px] font-semibold text-primary">
              수강계획은 최대 5개까지 만들 수 있어요.
            </h2>
            <div className="mt-5 flex justify-start">
              <button
                type="button"
                autoFocus
                onClick={() => setIsLimitAlertOpen(false)}
                className="min-h-[40px] rounded-[8px] bg-[#398aa2] px-5 text-[15px] font-semibold text-white hover:opacity-90"
              >
                확인
              </button>
            </div>
          </div>
        </div>
      )}

      {deleteTargetId !== null && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4" onMouseDown={(event) => {
          if (event.target === event.currentTarget && !deletePlan.isPending) setDeleteTargetId(null);
        }}>
          <div role="alertdialog" aria-modal="true" aria-labelledby="delete-plan-title" className="w-full max-w-[416px] rounded-[18px] bg-white p-8 shadow-xl">
            <div className="mb-6 flex items-start justify-between gap-3">
              <h3 id="delete-plan-title" className="text-[24px] font-semibold text-ink">삭제하시겠습니까?</h3>
              <button type="button" aria-label="닫기" disabled={deletePlan.isPending} onClick={() => setDeleteTargetId(null)} className="text-2xl text-ink-muted">×</button>
            </div>
            <p className="mb-5 text-sm text-ink-muted">"이 계획과 연결된 과목도 함께 삭제되며 되돌릴 수 없습니다."</p>
            {deleteError && <p role="alert" className="mb-4 text-sm text-danger">{deleteError}</p>}
            <div className="flex gap-3">
              <button type="button" disabled={deletePlan.isPending} onClick={() => setDeleteTargetId(null)} className="min-h-[55px] flex-1 rounded-[8px] border border-line font-semibold text-ink disabled:opacity-50">취소</button>
              <button type="button" disabled={deletePlan.isPending} onClick={() => { void handleDelete(); }} className="min-h-[55px] flex-1 rounded-[8px] bg-primary font-semibold text-white disabled:opacity-50">{deletePlan.isPending ? "삭제 중..." : "확인"}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
