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
