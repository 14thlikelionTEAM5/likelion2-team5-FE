import type { ExperienceKind } from '@/app/paths';
import type {
  MyExperiencesResponse,
  ReturnReportBody,
  ReturnReportExtractResponse,
} from '@/shared/api/experiences';
import type { MyProfile } from '@/shared/api/users';
import type {
  AdmissionResult,
  HousingType,
  MajorType,
  RecognitionType as CreditType,
} from '@/shared/types/enums';

export type SchoolOption = { universityId: number; name: string; country: string };

// 학기 값은 BE 형식 YYYY-1 / YYYY-2
export const toSemester = (year: string | number, semester: string | number) =>
  `${year}-${semester}`;

const splitSemester = (s: string) => {
  const [year, semester] = s.split('-').map(Number);
  return { year, semester };
};

// 내 지원 조건 (마이페이지 값)
export type SpecCondition = {
  gpa: number | null;
  majorType: MajorType | null;
  scores: { exam: string; score: number }[];
};

export const toCondition = (profile?: MyProfile): SpecCondition => ({
  gpa: profile?.gpa ?? null,
  majorType: (profile?.majorType as MajorType | null) ?? null,
  scores: (profile?.languageScores ?? []).map((s) => ({ exam: s.testType, score: s.score })),
});

export type SpecForm = {
  result: AdmissionResult;
  exam: string;
};

// 어학 성적이 1개면 바로 채움
export const emptySpec = (condition: SpecCondition): SpecForm => ({
  result: 'PASS',
  exam: condition.scores.length === 1 ? condition.scores[0].exam : '',
});

export type CourseRow = {
  key: number;
  courseId?: number; // 수정할 때 기존 행
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

const HOUSING_TYPES: HousingType[] = ['DORM', 'SELF', 'OTHER'];
const toHousing = (v: string | null | undefined): HousingType =>
  HOUSING_TYPES.includes(v as HousingType) ? (v as HousingType) : 'DORM';

// 추출 결과·내 귀국보고서를 폼 값으로
export const toReportForm = (
  r: Pick<
    ReturnReportExtractResponse,
    'cost' | 'housingType' | 'visa' | 'insuranceProvider' | 'reviewSummary'
  > & {
    courses:
      | {
          courseId?: number;
          courseCode?: string | null;
          courseNameEn?: string | null;
          foreignCredit?: number | null;
          satisfaction?: number | null;
        }[]
      | null;
  },
): ReportForm => ({
  flight: r.cost?.flight ?? '',
  insurance: r.cost?.insurance ?? '',
  monthlyLiving: r.cost?.livingMonthly ?? '',
  total: r.cost?.total ?? '',
  insurancePlace: r.insuranceProvider ?? '',
  visaPeriod: r.visa?.duration ?? '',
  visaType: r.visa?.type ?? '',
  housing: toHousing(r.housingType),
  courses: r.courses?.length
    ? r.courses.map((c) => ({
        key: c.courseId ?? Date.now() + Math.random(),
        courseId: c.courseId,
        code: c.courseCode ?? '',
        name: c.courseNameEn ?? '',
        credits: c.foreignCredit != null ? String(c.foreignCredit) : '',
        rating: c.satisfaction ?? 0,
      }))
    : [emptyCourse()],
  summary: r.reviewSummary ?? '',
});

const orNull = (v: string) => v.trim() || null;
const isCourseFilled = (c: CourseRow) => !!(c.code.trim() || c.name.trim() || c.credits.trim());

export const reportFormError = (f: ReportForm) => {
  const rows = f.courses.filter(isCourseFilled);
  if (rows.some((c) => !c.name.trim())) return '영문 교과목명을 입력해 주세요';
  if (rows.some((c) => !isForeignCredit(c.credits)))
    return '외국 학점은 99.9 이하 숫자로 입력해 주세요';
  return '';
};

export const isForeignCredit = (v: string) => {
  const n = Number(v);
  return v.trim() !== '' && Number.isFinite(n) && n > 0 && n <= 99.9;
};

// 빈 행은 빼고 보냄
export const toReportBody = (f: ReportForm): ReturnReportBody => ({
  cost: {
    flight: orNull(f.flight),
    insurance: orNull(f.insurance),
    livingMonthly: orNull(f.monthlyLiving),
    total: orNull(f.total),
  },
  housingType: f.housing,
  visa: { duration: orNull(f.visaPeriod), type: orNull(f.visaType) },
  insuranceProvider: orNull(f.insurancePlace),
  courses: f.courses.filter(isCourseFilled).map((c) => ({
    ...(c.courseId && { courseId: c.courseId }),
    courseCode: orNull(c.code),
    courseNameEn: c.name.trim(),
    foreignCredit: Number(c.credits),
    satisfaction: c.rating || null,
  })),
  reviewSummary: orNull(f.summary),
});

// 목록의 '구조화 항목' 칸
export const reportFields = (f: ReportForm) =>
  [
    [f.flight, f.insurance, f.monthlyLiving, f.total].some(Boolean) && '비용',
    '숙소',
    (f.visaPeriod || f.visaType) && '비자',
    f.insurancePlace && '보험',
  ].filter(Boolean) as string[];

// 내 등록 내역
type Term = {
  id: number;
  universityId: number;
  universityName: string;
  year: number;
  semester: number;
};

export type MySpec = Term & {
  result: AdmissionResult;
  exam: string | null;
  score: number | null;
  gpa: number;
  majorType: MajorType;
};

export type MyReport = Term & { form: ReportForm };

export type HomeCourse = { homeCourseId: number; code: string; name: string };

export type MyCredit = Term & {
  reportId: number | null;
  courseKey: number; // 귀국보고서 수강 교과목 ID
  foreignCourse: string;
  creditType: CreditType;
  homeCourse?: HomeCourse;
  credits: number;
};

export type MyExperiences = { spec: MySpec[]; report: MyReport[]; credit: MyCredit[] };

export const toMyExperiences = (r: MyExperiencesResponse): MyExperiences => ({
  spec: r.admissionReports.map((e) => ({
    id: e.admissionReportId,
    universityId: e.universityId,
    universityName: e.universityName,
    ...splitSemester(e.semester),
    result: e.result,
    exam: e.languageTestType,
    score: e.languageScore,
    gpa: e.gpa,
    majorType: e.majorType,
  })),
  report: r.returnReports.map((e) => ({
    id: e.returnReportId,
    universityId: e.universityId,
    universityName: e.universityName,
    ...splitSemester(e.semester),
    form: toReportForm(e),
  })),
  credit: r.courseCases.map((e) => ({
    id: e.courseCaseId,
    universityId: e.universityId,
    universityName: e.universityName,
    ...splitSemester(e.semester),
    reportId:
      r.returnReports.find((rr) => rr.courses.some((c) => c.courseId === e.returnReportCourseId))
        ?.returnReportId ?? null,
    courseKey: e.returnReportCourseId,
    foreignCourse: e.courseNameEn,
    creditType: e.recognitionType,
    homeCourse: e.homeCourse ?? undefined,
    credits: e.recognizedCredit,
  })),
});

// 학교의 내 귀국보고서 수강 교과목 (학점 인정 결과의 대상 과목)
export const reportCoursesOf = (mine: MyExperiences | undefined, universityId: number) =>
  (mine?.report ?? [])
    .filter((r) => r.universityId === universityId)
    .flatMap((r) => r.form.courses);

export const findMine = (mine: MyExperiences | undefined, kind: ExperienceKind, id: number) =>
  (mine?.[kind] as Term[] | undefined)?.find((e) => e.id === id) ?? null;

export type CreditForm = {
  courseKey: string;
  creditType: CreditType;
  homeCourse: HomeCourse | null;
  credits: string;
};

export const MAX_CREDITS = 3;

export const EMPTY_CREDIT: CreditForm = {
  courseKey: '',
  creditType: 'MAJOR_ELECTIVE',
  homeCourse: null,
  credits: '',
};

// 교양은 본교 과목을 고르지 않음
export const needsHomeCourse = (t: CreditType) => t === 'MAJOR_REQUIRED' || t === 'MAJOR_ELECTIVE';

export const isCreditInRange = (v: string) => {
  const n = Number(v);
  return v.trim() !== '' && Number.isFinite(n) && n > 0 && n <= MAX_CREDITS;
};

export const creditError = (f: CreditForm) => {
  if (!f.courseKey) return '대상 과목을 골라 주세요';
  if (needsHomeCourse(f.creditType) && !f.homeCourse) return '본교 인정 과목을 골라 주세요';
  if (!isCreditInRange(f.credits)) return '인정 학점을 확인해 주세요';
  return '';
};

export const toCreditBody = (f: CreditForm) => ({
  returnReportCourseId: Number(f.courseKey),
  recognitionType: f.creditType,
  homeCourseId: needsHomeCourse(f.creditType) ? (f.homeCourse?.homeCourseId ?? null) : null,
  recognizedCredit: Number(f.credits),
});
