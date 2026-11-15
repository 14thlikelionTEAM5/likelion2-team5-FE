
import { useState } from 'react';
import { useNavigate } from 'react-router';

import { PATHS } from '@/app/paths';
import heroLight from '@/assets/decor/hero-light.svg';

type Course = {
  id: number;
  name: string;
  category: string;
  homeCourse: string;
  credits: number;
};

type StudyPlan = {
  id: number;
  university: string;
  semester: string;
  courses: Course[];
  totalCourseCount: number;
  estimatedTotalCredits: number;
};

// 피그마 UI 확인용 예시 데이터입니다. 실제 API 응답이 아닙니다.
const SAMPLE_PLANS: StudyPlan[] = [
  {
    id: 1,
    university: 'University of Groningen',
    semester: '2027-1',
    totalCourseCount: 6,
    estimatedTotalCredits: 18,
    courses: [
      {
        id: 1,
        name: 'Marketing Principles',
        category: '전선',
        homeCourse: '마케팅원론',
        credits: 3,
      },
      {
        id: 2,
        name: 'International Business',
        category: '교양',
        homeCourse: '-',
        credits: 3,
      },
    ],
  },
  {
    id: 2,
    university: 'University of Mannheim',
    semester: '2027-1',
    totalCourseCount: 3,
    estimatedTotalCredits: 18,
    courses: [
      {
        id: 3,
        name: 'Financial Accounting',
        category: '전선',
        homeCourse: '재무회계',
        credits: 3,
      },
    ],
  },
];

const MAX_PLANS = 5;

export default function PlanListPage() {
  const navigate = useNavigate();

  const [plans, setPlans] = useState<StudyPlan[]>(SAMPLE_PLANS);
  const [deleteTargetId, setDeleteTargetId] = useState<number | null>(null);

  const handleDelete = () => {
    if (deleteTargetId === null) return;

    // UI 테스트용 삭제입니다. 서버에 저장되지 않습니다.
    setPlans((previous) =>
      previous.filter((plan) => plan.id !== deleteTargetId),
    );

    setDeleteTargetId(null);
  };

  const handleNewPlan = () => {
    // 새 계획 생성 화면 연결은 추후 진행
    window.alert('수강계획 작성 화면 연결 전입니다.');
  };

  // 편집 버튼 클릭 시 해당 수강계획 편집 페이지로 이동
  const handleEditPlan = (planId: number) => {
    navigate(PATHS.planEdit(planId));
  };

  return (
    <div className="mx-auto flex w-full max-w-[1440px] flex-col gap-9">
      {/* 상단 배너 */}
      <section
        className="relative flex min-h-[212px] flex-col justify-center overflow-hidden rounded-card bg-primary-soft bg-cover bg-center px-6 py-8 sm:px-11"
        style={{ backgroundImage: `url("${heroLight}")` }}
      >
        <div className="relative z-10 flex flex-col gap-3">
          <p className="text-sm font-semibold text-ink-sub">
            수강계획
          </p>

          <h1 className="text-[30px] font-bold text-primary sm:text-[34px]">
            내 수강계획 목록
          </h1>

          <p className="text-base text-ink-sub sm:text-lg">
            파견교별 수강계획을 만들고 관리하세요.
          </p>
        </div>
      </section>

      {/* 수강계획 목록 */}
      <section className="min-h-[720px] rounded-[24px] bg-white px-5 py-8 sm:px-10 sm:py-12">
        <div className="mb-5 flex flex-wrap items-center justify-between gap-4">
          <p className="text-[16px] text-ink-muted sm:text-[18px]">
            수강계획은 최대 5개까지, 학교당 학기별 1개만 만들 수 있음
          </p>

          <button
            type="button"
            onClick={handleNewPlan}
            disabled={plans.length >= MAX_PLANS}
            className="min-h-[52px] min-w-[190px] rounded-[10px] bg-primary px-6 text-[18px] font-semibold text-white transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40 sm:min-w-[240px]"
          >
            + 새 계획 만들기
          </button>
        </div>

        {plans.length === 0 ? (
          <div className="flex min-h-[370px] flex-col items-center justify-center gap-3 rounded-[18px] border border-line bg-white px-6 text-center">
            <p className="text-[24px] font-semibold text-ink">
              아직 작성한 수강계획이 없습니다
            </p>

            <p className="text-[17px] text-ink-muted">
              새 계획 만들기를 눌러 수강계획을 작성해 보세요.
            </p>
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            {plans.map((plan) => (
              <article
                key={plan.id}
                className="overflow-hidden rounded-[18px] border border-line bg-white p-5 sm:p-6"
              >
                {/* 학교명 및 학기 */}
                <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
                  <h2 className="text-[22px] font-semibold leading-snug text-ink sm:text-[26px]">
                    {plan.university}
                  </h2>

                  <span className="text-[18px] text-ink-muted">
                    {plan.semester}학기
                  </span>
                </div>

                {/* 수강 과목 표 */}
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[690px] table-fixed text-left text-ink">
                    <colgroup>
                      <col className="w-[28%]" />
                      <col className="w-[20%]" />
                      <col className="w-[32%]" />
                      <col className="w-[20%]" />
                    </colgroup>

                    <thead className="bg-panel text-[17px] font-semibold sm:text-[18px]">
                      <tr>
                        <th className="px-3 py-3 font-semibold">
                          교과목
                        </th>
                        <th className="px-3 py-3 font-semibold">
                          인정 구분
                        </th>
                        <th className="px-3 py-3 font-semibold">
                          본교 과목
                        </th>
                        <th className="px-3 py-3 font-semibold">
                          인정 학점
                        </th>
                      </tr>
                    </thead>

                    <tbody className="text-[16px] sm:text-[17px]">
                      {plan.courses.map((course) => (
                        <tr
                          key={course.id}
                          className="border-b border-line"
                        >
                          <td className="px-3 py-3">
                            {course.name}
                          </td>
                          <td className="px-3 py-3">
                            {course.category}
                          </td>
                          <td className="px-3 py-3">
                            {course.homeCourse}
                          </td>
                          <td className="px-3 py-3">
                            {course.credits}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* 학점 합계 및 버튼 */}
                <div className="mt-7 flex flex-wrap items-center justify-between gap-4">
                  <p className="text-[17px] font-semibold text-primary sm:text-[19px]">
                    합계 {plan.totalCourseCount} /{' '}
                    {plan.estimatedTotalCredits}학점

                    <span className="font-normal text-ink-muted">
                      {' '}
                      · 참고용 예상치
                    </span>
                  </p>

                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={() => handleEditPlan(plan.id)}
                      className="min-h-[46px] min-w-[95px] rounded-[7px] border border-primary px-4 text-[17px] font-semibold text-primary hover:bg-primary-soft"
                    >
                      편집
                    </button>

                    <button
                      type="button"
                      onClick={() =>
                        setDeleteTargetId(plan.id)
                      }
                      className="min-h-[46px] min-w-[95px] rounded-[7px] border border-primary px-4 text-[17px] font-semibold text-primary hover:bg-primary-soft"
                    >
                      삭제
                    </button>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}

        <p className="mt-7 text-sm text-ink-muted">
          예상 인정 학점은 참고용이며, 최종 학점 인정은 학과 확인이
          필요합니다.
        </p>
      </section>

      {/* 삭제 확인창 */}
      {deleteTargetId !== null && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              setDeleteTargetId(null);
            }
          }}
        >
          <div
            role="alertdialog"
            aria-modal="true"
            aria-labelledby="delete-plan-title"
            className="w-full max-w-[416px] rounded-[18px] bg-white p-8 shadow-xl"
          >
            <div className="mb-6 flex items-start justify-between gap-3">
              <h3
                id="delete-plan-title"
                className="text-[24px] font-semibold text-ink"
              >
                삭제하시겠습니까?
              </h3>

              <button
                type="button"
                aria-label="닫기"
                onClick={() => setDeleteTargetId(null)}
                className="text-2xl text-ink-muted"
              >
                ×
              </button>
            </div>

            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setDeleteTargetId(null)}
                className="min-h-[55px] flex-1 rounded-[8px] border border-line font-semibold text-ink"
              >
                취소
              </button>

              <button
                type="button"
                onClick={handleDelete}
                className="min-h-[55px] flex-1 rounded-[8px] bg-primary font-semibold text-white"
              >
                확인
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
