// 개발용 수강계획 미리보기 저장소. 실제 API 및 서버 데이터와 분리됩니다.
// 같은 탭에서 목록과 편집 페이지를 이동해도 Mock 계획을 유지합니다.
const STORAGE_KEY = 'passhufs:mock-study-plans:v1';

export type MockPlanItem = {
  itemId: number;
  itemType: 'CUSTOM' | 'REGISTERED';
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
};

export function readMockStudyPlans(): MockStudyPlan[] {
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed: unknown = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed as MockStudyPlan[] : [];
  } catch {
    return [];
  }
}

export function writeMockStudyPlans(plans: MockStudyPlan[]): void {
  sessionStorage.setItem(STORAGE_KEY, JSON.stringify(plans));
}

export function saveMockStudyPlan(plan: MockStudyPlan): void {
  const current = readMockStudyPlans();
  writeMockStudyPlans(current.map((entry) => entry.studyPlanId === plan.studyPlanId ? plan : entry));
}
