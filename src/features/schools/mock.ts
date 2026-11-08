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
    ineligibleReason: '학점 부족 (기준 3.5 / 내 3.2)',
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
