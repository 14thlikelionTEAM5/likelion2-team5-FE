import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router';

import { PATHS } from '@/app/paths';
import heroLight from '@/assets/decor/hero-light.svg';
import { api } from '@/shared/api/client';

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
  }[];
};

const MAX_PLANS = 5;
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
  const [notice, setNotice] = useState('');
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
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

  const handleDelete = () => {
    setDeleteTargetId(null);
    setNotice('실제 삭제 API는 아직 연결되지 않았습니다. 수강계획이 삭제되지 않았습니다.');
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
            수강계획은 최대 5개까지, 학교당 학기별 1개만 만들 수 있음
          </p>
          <button
            type="button"
            onClick={() => setNotice('새 계획 생성 API는 아직 연결되지 않았습니다.')}
            disabled={plans.length >= MAX_PLANS || isLoading}
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
                            <td className="px-3 py-3">{item.homeCourseId === null ? '-' : `본교 과목 ID ${item.homeCourseId}`}</td>
                            <td className="px-3 py-3">{item.expectedCredit ?? '-'}</td>
                          </tr>
                        )) : <tr><td colSpan={4} className="px-3 py-6 text-center text-ink-muted">등록된 과목이 없습니다.</td></tr>
                      ) : <tr><td colSpan={4} className="px-3 py-6 text-center text-ink-muted">과목 상세 정보를 불러오지 못했습니다.</td></tr>}
                    </tbody>
                  </table>
                </div>

                <div className="mt-7 flex flex-wrap items-center justify-between gap-4">
                  <p className="text-[17px] font-semibold text-primary sm:text-[19px]">
                    합계 {plan.courseCount}과목 / {plan.totalExpectedCredits === null ? '계산 불가' : `${plan.totalExpectedCredits}학점`}
                    <span className="font-normal text-ink-muted"> · 참고용 예상치</span>
                  </p>
                  <div className="flex items-center gap-3">
                    <button type="button" onClick={() => navigate(PATHS.planEdit(plan.studyPlanId))} className="min-h-[46px] min-w-[95px] rounded-[7px] border border-primary px-4 text-[17px] font-semibold text-primary hover:bg-primary-soft">편집</button>
                    <button type="button" onClick={() => setDeleteTargetId(plan.studyPlanId)} className="min-h-[46px] min-w-[95px] rounded-[7px] border border-primary px-4 text-[17px] font-semibold text-primary hover:bg-primary-soft">삭제</button>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
        <p className="mt-7 text-sm text-ink-muted">예상 인정 학점은 참고용이며, 최종 학점 인정은 학과 확인이 필요합니다.</p>
      </section>

      {deleteTargetId !== null && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4" onMouseDown={(event) => {
          if (event.target === event.currentTarget) setDeleteTargetId(null);
        }}>
          <div role="alertdialog" aria-modal="true" aria-labelledby="delete-plan-title" className="w-full max-w-[416px] rounded-[18px] bg-white p-8 shadow-xl">
            <div className="mb-6 flex items-start justify-between gap-3">
              <h3 id="delete-plan-title" className="text-[24px] font-semibold text-ink">삭제하시겠습니까?</h3>
              <button type="button" aria-label="닫기" onClick={() => setDeleteTargetId(null)} className="text-2xl text-ink-muted">×</button>
            </div>
            <p className="mb-5 text-sm text-ink-muted">삭제 API 연동 전이므로 실제 삭제되지는 않습니다.</p>
            <div className="flex gap-3">
              <button type="button" onClick={() => setDeleteTargetId(null)} className="min-h-[55px] flex-1 rounded-[8px] border border-line font-semibold text-ink">취소</button>
              <button type="button" onClick={handleDelete} className="min-h-[55px] flex-1 rounded-[8px] bg-primary font-semibold text-white">확인</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
