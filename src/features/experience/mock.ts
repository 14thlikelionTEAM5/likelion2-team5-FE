// TODO: /universities/search, /experiences/check-duplicate, /consents, /return-reports/extract 연결 후 삭제
import type { ExperienceKind } from '@/app/paths';
import { MOCK_SCHOOLS, type HousingType } from '@/features/schools/mock';
import type { AdmissionResult, MajorType } from '@/shared/types/enums';

// TODO: useMe() 연결 후 삭제
export const MY_CONDITION = {
  gpa: 3.8,
  majorType: 'PRIMARY' as MajorType,
  scores: [
    { exam: 'NEW_TOEFL', score: 100 },
    { exam: 'IELTS', score: 7.0 },
  ],
};

export type SpecForm = {
  result: AdmissionResult;
  exam: string;
  note: string;
};

export const MAX_NOTE_LENGTH = 100;

// 어학 성적이 1개면 바로 채움
export const emptySpec = (): SpecForm => ({
  result: 'PASS',
  exam: MY_CONDITION.scores.length === 1 ? MY_CONDITION.scores[0].exam : '',
  note: '',
});

export type SchoolOption = { universityId: number; name: string; country: string };

const SCHOOLS: SchoolOption[] = MOCK_SCHOOLS.map(({ universityId, name, country }) => ({
  universityId,
  name,
  country,
}));

export const searchSchools = (q: string) => {
  const word = q.trim().toLowerCase();
  return SCHOOLS.filter(
    (s) => !word || s.name.toLowerCase().includes(word) || s.country.includes(word),
  ).sort((a, b) => a.name.localeCompare(b.name));
};

export const getSchoolOption = (id: number) => SCHOOLS.find((s) => s.universityId === id) ?? null;

// 이미 등록한 경험 (중복 확인용). 1번 학교 2026-1 귀국보고서가 있다고 가정
const MY_EXPERIENCES = [
  { id: 1, kind: 'report' as ExperienceKind, universityId: 1, year: 2026, semester: 1 },
];

export const findDuplicate = (
  kind: ExperienceKind,
  universityId: number,
  year: number,
  semester: number,
) =>
  MY_EXPERIENCES.find(
    (e) =>
      e.kind === kind &&
      e.universityId === universityId &&
      e.year === year &&
      e.semester === semester,
  ) ?? null;

// 외부 AI 처리 동의 (처음 한 번만)
let consented = false;
export const hasConsented = () => consented;
export const saveConsent = () => {
  consented = true;
};

export type CourseRow = {
  key: number;
  code: string;
  name: string;
  credits: string;
  rating: number;
};

export type ReportForm = {
  flight: string;
  insurance: string;
  monthlyLiving: string;
  total: string;
  insurancePlace: string;
  visaPeriod: string;
  visaType: string;
  housing: HousingType;
  courses: CourseRow[];
  summary: string;
};

export const emptyCourse = (): CourseRow => ({
  key: Date.now() + Math.random(),
  code: '',
  name: '',
  credits: '',
  rating: 0,
});

export const EMPTY_REPORT: ReportForm = {
  flight: '',
  insurance: '',
  monthlyLiving: '',
  total: '',
  insurancePlace: '',
  visaPeriod: '',
  visaType: '',
  housing: 'DORM',
  courses: [emptyCourse()],
  summary: '',
};

export const extractReport = (): Promise<ReportForm> =>
  new Promise((resolve) =>
    setTimeout(
      () =>
        resolve({
          flight: '왕복 약 130만 원',
          insurance: '약 300유로',
          monthlyLiving: '월 1,000유로',
          total: '',
          insurancePlace: '학교 단체보험',
          visaPeriod: '약 3주',
          visaType: '거주 허가(MVV)',
          housing: 'DORM',
          courses: [
            { key: 1, code: 'MKT201', name: 'Marketing 201', credits: '6 ECTS', rating: 4 },
            { key: 2, code: 'FIN301', name: 'Corporate Finance', credits: '6 ECTS', rating: 3 },
          ],
          summary:
            '기숙사는 학교 근처라 통학이 편했고, 수업은 토론과 팀 과제 비중이 높았어요. 물가가 높아 장보기 위주로 생활비를 아꼈어요.',
        }),
      1200,
    ),
  );
