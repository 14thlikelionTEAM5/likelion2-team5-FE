// 개발용 수강계획 미리보기 저장소. 실제 API 및 서버 데이터와 분리됩니다.
const STORAGE_KEY = 'passhufs:mock-study-plans:v1';

export type MockCalculationRule = 'ECTS_X0_6' | 'AS_IS' | null;
export type MockPlanItem = {
  itemId: number;
  itemType: 'CUSTOM' | 'REGISTERED' | 'DIRECT' | 'REFERENCE';
  courseName: string;
  foreignCredit: number;
  sourceCourseId: number | null;
  homeCourseId: number | null;
  recognitionType: 'MAJOR_REQUIRED' | 'MAJOR_ELECTIVE' | 'GENERAL';
  expectedCredit: number | null;
  creditLimitWarning: boolean;
};
export type MockStudyPlan = {
  studyPlanId: number;
  universityId: number;
  universityName: string;
  name: string;
  createdAt: string;
  updatedAt: string;
  items: MockPlanItem[];
  // 사용자가 Mock 테스트를 위해 계산 조건을 명시적으로 확인한 경우에만 설정.
  mockCalculationRule?: MockCalculationRule;
};

export const MOCK_SEMESTER_LIMIT = 18;
export const MOCK_COURSE_LIMIT = 3;

// 등록된 학교의 인증 여부·학점 체계는 Mock 데이터로 확인할 수 없음.
// 사용자가 직접 확인한 규칙을 선택하지 않으면 인정 학점을 임의 계산하지 않음.
export function calculateMockPlan(plan: MockStudyPlan): MockStudyPlan {
  const rule = plan.mockCalculationRule ?? null;
  const items = plan.items.map((item) => {
    const foreignCredit = Number(item.foreignCredit);
    const validCredit = Number.isFinite(foreignCredit) && foreignCredit > 0;
    const eligible = item.recognitionType === 'GENERAL' || item.homeCourseId !== null;
    const converted = !validCredit || !rule || !eligible ? null : rule === 'ECTS_X0_6' ? foreignCredit * 0.6 : foreignCredit;
    // 계산 대상 학점의 소수점 오차를 피하기 위해 결과를 정리.
    const expectedCredit = converted === null ? null : Math.round(converted * 100) / 100;
    return {
      ...item,
      expectedCredit,
      creditLimitWarning: converted !== null && converted > MOCK_COURSE_LIMIT,
    };
  });
  return { ...plan, items };
}

export function getMockTotalExpectedCredit(plan: MockStudyPlan): number | null {
  const items = calculateMockPlan(plan).items;
  if (items.length === 0) return 0;
  if (items.every((item) => item.expectedCredit === null)) return null;
  return Math.round(items.reduce((sum, item) => sum + (item.expectedCredit ?? 0), 0) * 100) / 100;
}

export function readMockStudyPlans(): MockStudyPlan[] {
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed: unknown = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed as MockStudyPlan[] : [];
  } catch { return []; }
}

export function writeMockStudyPlans(plans: MockStudyPlan[]): void {
  sessionStorage.setItem(STORAGE_KEY, JSON.stringify(plans.map(calculateMockPlan)));
}

export function saveMockStudyPlan(plan: MockStudyPlan): void {
  const current = readMockStudyPlans();
  writeMockStudyPlans(current.map((entry) => entry.studyPlanId === plan.studyPlanId ? plan : entry));
}
