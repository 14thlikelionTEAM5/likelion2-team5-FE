import type { AdmissionResult, MajorType } from '@/shared/types/enums';

// TODO: /universities, /universities/countries, /bookmarks 연결 후 삭제. 필드 이름은 BE 명세에 맞추기

export type Eligibility = 'ELIGIBLE' | 'INELIGIBLE' | 'UNKNOWN';
export type ChangeType = 'NEW' | 'QUOTA_CHANGED';

export type SchoolSummary = {
  universityId: number;
  name: string;
  country: string;
  recruiting: boolean;
  eligibility: Eligibility;
  changeType?: ChangeType;
  conditionSummary?: string;
  ineligibleReason?: string;
  hasExperience: boolean;
  recruitCount: number;
  baseDate: string;
  bookmarked: boolean;
  languageExams: string[];
  expectedCost?: number;
};

export const MOCK_SCHOOLS: SchoolSummary[] = [
  {
    universityId: 1,
    name: 'University of Amsterdam',
    country: '네덜란드',
    recruiting: true,
    eligibility: 'ELIGIBLE',
    changeType: 'NEW',
    conditionSummary: '학점 3.0 이상 · 뉴토플 80 이상',
    hasExperience: true,
    recruitCount: 2,
    baseDate: '2026-10-06',
    bookmarked: false,
    languageExams: ['NEW_TOEFL', 'IELTS'],
    expectedCost: 9000000,
  },
  {
    universityId: 2,
    name: 'University of Sydney',
    country: '호주',
    recruiting: true,
    eligibility: 'INELIGIBLE',
    changeType: 'QUOTA_CHANGED',
    conditionSummary: '학점 3.5 이상 · IELTS 6.5 이상',
    ineligibleReason: '학점 부족 (기준 3.5 / 내 값 3.2)',
    hasExperience: true,
    recruitCount: 3,
    baseDate: '2026-10-06',
    bookmarked: false,
    languageExams: ['IELTS'],
    expectedCost: 12000000,
  },
  {
    universityId: 3,
    name: 'University of Toronto',
    country: '캐나다',
    recruiting: true,
    eligibility: 'UNKNOWN',
    hasExperience: true,
    recruitCount: 1,
    baseDate: '2026-10-06',
    bookmarked: true,
    languageExams: ['OLD_TOEFL', 'NEW_TOEFL'],
  },
  {
    universityId: 4,
    name: 'Lund University',
    country: '스웨덴',
    recruiting: false,
    eligibility: 'UNKNOWN',
    hasExperience: false,
    recruitCount: 0,
    baseDate: '2026-10-06',
    bookmarked: false,
    languageExams: ['ITP_TOEFL'],
  },
];

export type SchoolDetail = SchoolSummary & { exchangeStart: string; exchangeEnd: string };

export const getMockSchool = (id: number): SchoolDetail | undefined => {
  const school = MOCK_SCHOOLS.find((s) => s.universityId === id);
  return school && { ...school, exchangeStart: '2027-02-24', exchangeEnd: '2027-06-30' };
};

export type CriterionResult = 'MET' | 'NOT_MET' | 'UNKNOWN';

export type OfficialInfo = {
  gpaCriterion?: string;
  languageCriterion?: string;
  summary?: string;
  sourceUrl?: string;
  courseListUrl?: string;
  baseDate: string;
  judgment: {
    result: Eligibility;
    reason: string;
    rows: { item: string; criterion: string; mine: string; result: CriterionResult }[];
  };
};

const MOCK_JUDGMENT: Record<Eligibility, OfficialInfo['judgment']> = {
  ELIGIBLE: {
    result: 'ELIGIBLE',
    reason: '학점 기준 충족 · 어학 기준 충족',
    rows: [
      { item: '누적 학점', criterion: '3.0 이상', mine: '4.0', result: 'MET' },
      { item: '어학', criterion: '뉴토플 80', mine: '뉴토플 100', result: 'MET' },
    ],
  },
  INELIGIBLE: {
    result: 'INELIGIBLE',
    reason: '학점 기준 미충족',
    rows: [
      { item: '누적 학점', criterion: '3.5 이상', mine: '3.2', result: 'NOT_MET' },
      { item: '어학', criterion: 'IELTS 6.5', mine: 'IELTS 7.0', result: 'MET' },
    ],
  },
  UNKNOWN: {
    result: 'UNKNOWN',
    reason: '학교 기준 정보가 없어요',
    rows: [
      { item: '누적 학점', criterion: '-', mine: '4.0', result: 'UNKNOWN' },
      { item: '어학', criterion: '-', mine: '뉴토플 100', result: 'UNKNOWN' },
    ],
  },
};

export const getMockOfficial = (school: SchoolSummary): OfficialInfo => ({
  gpaCriterion: school.eligibility === 'UNKNOWN' ? undefined : '3.5 이상',
  languageCriterion: school.eligibility === 'UNKNOWN' ? undefined : '뉴토플 80 / IELTS 6.0',
  summary:
    school.eligibility === 'UNKNOWN'
      ? undefined
      : '학기당 예상 비용은 약 900만 원이에요. 기숙사 우선 배정과 학기 시작 전 오리엔테이션이 제공돼요.',
  sourceUrl: 'https://example.com',
  courseListUrl: 'https://example.com',
  baseDate: school.baseDate,
  judgment: MOCK_JUDGMENT[school.eligibility],
});

export type AdmissionReport = {
  reportId: number;
  result: AdmissionResult;
  semester: string;
  majorType: MajorType;
  gpa: number;
  exam: string;
  score: number;
  note?: string;
  isSample?: boolean;
};

// 3번 학교는 비어 있음 화면 확인용
export const getMockAdmissionReports = (universityId: number): AdmissionReport[] =>
  universityId === 3
    ? []
    : [
        {
          reportId: 1,
          result: 'PASS',
          semester: '2026-1',
          majorType: 'PRIMARY',
          gpa: 3.8,
          exam: 'NEW_TOEFL',
          score: 100,
        },
        {
          reportId: 2,
          result: 'PASS',
          semester: '2026-1',
          majorType: 'DOUBLE',
          gpa: 4.4,
          exam: 'NEW_TOEFL',
          score: 95,
          note: '교환 동아리 활동',
        },
        {
          reportId: 3,
          result: 'FAIL',
          semester: '2026-1',
          majorType: 'PRIMARY',
          gpa: 3.1,
          exam: 'ITP_TOEFL',
          score: 560,
        },
        {
          reportId: 4,
          result: 'PASS',
          semester: '2025-2',
          majorType: 'MINOR',
          gpa: 3.2,
          exam: 'NEW_TOEFL',
          score: 90,
          isSample: true,
        },
        {
          reportId: 5,
          result: 'PASS',
          semester: '2025-2',
          majorType: 'PRIMARY',
          gpa: 3.6,
          exam: 'IELTS',
          score: 6.5,
          isSample: true,
        },
        {
          reportId: 6,
          result: 'FAIL',
          semester: '2025-2',
          majorType: 'DOUBLE',
          gpa: 3.4,
          exam: 'NEW_TOEFL',
          score: 82,
          isSample: true,
        },
        {
          reportId: 7,
          result: 'PASS',
          semester: '2025-1',
          majorType: 'PRIMARY',
          gpa: 4.0,
          exam: 'NEW_TOEFL',
          score: 112,
          isSample: true,
        },
      ];

// TODO: useMe() 연결 후 삭제
export const MOCK_ME = {
  gpa: 3.8,
  scores: { NEW_TOEFL: 100, IELTS: 7.0 } as Record<string, number>,
};

export type CreditType = 'MAJOR_REQUIRED' | 'MAJOR_ELECTIVE' | 'GENERAL' | 'FREE_ELECTIVE';

export type Course = {
  courseId: number;
  name: string;
  code: string;
  credits: number;
  hasCase: boolean;
};

export type CourseCase = {
  caseId: number;
  foreignCourse: string;
  homeCourse: string;
  creditType: CreditType;
  credits: number;
  majorType: MajorType;
  semester: string;
  isSample?: boolean;
};

// 3번 학교는 비어 있음 화면 확인용
export const getMockCourses = (universityId: number): Course[] =>
  universityId === 3
    ? []
    : [
        { courseId: 1, name: 'Marketing 201', code: 'MKT201', credits: 3, hasCase: true },
        { courseId: 2, name: 'Consumer Behavior', code: 'MKT202', credits: 3, hasCase: true },
        { courseId: 3, name: 'Corporate Finance', code: 'FIN301', credits: 3, hasCase: false },
        {
          courseId: 4,
          name: 'Organizational Behavior',
          code: 'MGT210',
          credits: 3,
          hasCase: false,
        },
      ];

export const getMockCourseCases = (universityId: number): CourseCase[] =>
  universityId === 3
    ? []
    : [
        {
          caseId: 1,
          foreignCourse: 'Marketing 201',
          homeCourse: '마케팅원론',
          creditType: 'MAJOR_ELECTIVE',
          credits: 3,
          majorType: 'PRIMARY',
          semester: '2026-1',
        },
        {
          caseId: 2,
          foreignCourse: 'Consumer Behavior',
          homeCourse: '소비자행동론',
          creditType: 'MAJOR_ELECTIVE',
          credits: 3,
          majorType: 'DOUBLE',
          semester: '2025-2',
          isSample: true,
        },
        {
          caseId: 3,
          foreignCourse: 'Marketing 201',
          homeCourse: '교양 선택',
          creditType: 'GENERAL',
          credits: 2,
          majorType: 'MINOR',
          semester: '2025-2',
          isSample: true,
        },
      ];

export type HousingType = 'DORM' | 'OFF_CAMPUS' | 'OTHER';

// 비용은 등록자가 입력한 원문 그대로 (통화·기간이 달라 환산하지 않음)
export type ReturnReport = {
  reportId: number;
  semester: string;
  cost: { flight?: string; insurance?: string; monthlyLiving?: string; total?: string };
  housing: HousingType;
  visa?: string;
  insurancePlace?: string;
  summary: string;
  isSample?: boolean;
};

// 3번 학교는 비어 있음 화면 확인용
export const getMockReturnReports = (universityId: number): ReturnReport[] =>
  universityId === 3
    ? []
    : [
        {
          reportId: 1,
          semester: '2026-1',
          cost: {
            flight: '왕복 약 130만 원',
            insurance: '약 300유로',
            monthlyLiving: '월 1,000유로',
            total: '약 900만 원',
          },
          housing: 'DORM',
          visa: '약 3주 · 거주 허가(MVV)',
          insurancePlace: '학교 지정 보험',
          summary:
            '기숙사는 학교 근처라 통학이 편했고, 수업은 토론과 팀 과제 비중이 높았어요. 물가가 높아 장보기 위주로 생활비를 아꼈어요.',
        },
        {
          reportId: 2,
          semester: '2025-2',
          cost: { flight: '왕복 120만 원', monthlyLiving: '월 900유로', total: '800만 원 정도' },
          housing: 'OFF_CAMPUS',
          visa: '약 1달 · 학생 비자',
          insurancePlace: '국내 유학생 보험',
          summary:
            '자취방은 학교 커뮤니티에서 구했어요. 경영 과목은 출석과 발표 점수 비중이 커서 준비를 많이 해야 했어요.',
          isSample: true,
        },
        {
          reportId: 3,
          semester: '2025-1',
          cost: { monthlyLiving: '월 120만 원' },
          housing: 'DORM',
          visa: '2주',
          insurancePlace: '학교 지정 보험',
          summary: '현지 학생 버디 프로그램이 있어 적응이 빨랐어요. 시험은 서술형이 많았어요.',
          isSample: true,
        },
        {
          reportId: 4,
          semester: '2024-2',
          cost: {
            flight: '왕복 150만 원',
            insurance: '25만 원',
            monthlyLiving: '월 1,100유로',
            total: '1,000만 원',
          },
          housing: 'OTHER',
          visa: '약 3주 · 거주 허가',
          summary:
            '홈스테이로 지내며 현지 문화를 가까이 경험했어요. 교통비가 생각보다 많이 들었어요.',
          isSample: true,
        },
      ];
