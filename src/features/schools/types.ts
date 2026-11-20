import type { MyProfile } from '@/shared/api/users';
import type {
  LanguageRequirement,
  UniversityAdmissionReport,
  UniversityCourse,
  UniversityCourseCase,
  UniversityDetail,
  UniversityListItem,
  UniversityReturnReport,
} from '@/shared/api/universities';
import {
  languageTestLabel,
  type AdmissionResult,
  type EligibilityStatus,
  type HousingType,
  type MajorType,
  type RecognitionType,
} from '@/shared/types/enums';

// API 응답을 화면에서 쓰는 모양으로 바꿈

export type Eligibility = EligibilityStatus;
export type ChangeType = 'NEW' | 'QUOTA_CHANGED';

export type SchoolSummary = {
  universityId: number;
  name: string;
  country: string;
  recruiting: boolean;
  eligibility: Eligibility;
  eligibilityMessage: string | null;
  changeType?: ChangeType;
  conditionSummary?: string;
  hasExperience: boolean;
  recruitCount: number | null;
  baseDate: string | null;
  bookmarked: boolean;
};

// 3 → 3.0, 3.25 → 3.25
const gpaText = (n: number) => (Number.isInteger(n) ? n.toFixed(1) : String(n));

type LanguageReq = { testType: string; minScore: number | null };

const languageText = (reqs: LanguageReq[]) =>
  reqs
    .map((r) => `${languageTestLabel(r.testType)}${r.minScore != null ? ` ${r.minScore}` : ''}`)
    .join(' / ');

export const conditionSummary = (minGpa: number | null, reqs: LanguageReq[]) => {
  const parts = [
    minGpa != null && `학점 ${gpaText(minGpa)} 이상`,
    reqs.length > 0 && `${languageText(reqs)} 이상`,
  ].filter(Boolean);
  return parts.length ? parts.join(' · ') : undefined;
};

export const toSchoolSummary = (u: UniversityListItem): SchoolSummary => ({
  universityId: u.universityId,
  name: u.name,
  country: u.country,
  recruiting: u.agreementId != null && !u.semesterChanges.includes('RECRUITMENT_STOPPED'),
  eligibility: u.eligibility.status,
  eligibilityMessage: u.eligibility.message,
  changeType: u.semesterChanges.find((c): c is ChangeType => c === 'NEW' || c === 'QUOTA_CHANGED'),
  conditionSummary: conditionSummary(u.minGpa, u.languageRequirements ?? []),
  hasExperience: u.hasExperienceData,
  recruitCount: u.quota,
  baseDate: u.announcedAt,
  bookmarked: u.isBookmarked,
});

export type SchoolDetail = SchoolSummary & { exchangePeriod: string | null };

export const toSchoolDetail = (d: UniversityDetail): SchoolDetail => {
  const a = d.agreement;
  return {
    universityId: d.universityId,
    name: d.name,
    country: d.country,
    recruiting: !!a?.isOpen,
    eligibility: d.eligibility.status,
    eligibilityMessage: d.eligibility.message,
    conditionSummary: a ? conditionSummary(a.minGpa, a.languageRequirements ?? []) : undefined,
    hasExperience: true,
    recruitCount: a?.quota ?? null,
    baseDate: a?.announcedAt ?? null,
    bookmarked: d.isBookmarked,
    exchangePeriod: a?.exchangePeriod ?? null,
  };
};

export type CriterionResult = 'MET' | 'NOT_MET' | 'UNKNOWN';

export type OfficialInfo = {
  gpaCriterion?: string;
  languageCriterion?: string;
  summary?: string;
  sourceUrl?: string;
  courseListUrl?: string;
  baseDate: string | null;
  judgment: {
    result: Eligibility;
    reason: string;
    rows: { item: string; criterion: string; mine: string; result: CriterionResult }[];
  };
};

const GPA_UNKNOWN = ['GPA_NOT_PROVIDED', 'GPA_REQUIREMENT_UNKNOWN'];
const LANGUAGE_UNKNOWN = [
  'LANGUAGE_REQUIREMENT_UNKNOWN',
  'LANGUAGE_DETAIL_NEEDS_CHECK',
  'LANGUAGE_SCORE_NOT_PROVIDED',
];
const NO_AGREEMENT = ['NO_CURRENT_AGREEMENT', 'RECRUITMENT_STOPPED'];

// BE는 학점에서 판정이 끝나면 어학을 보지 않아서, 그때는 어학만 직접 비교함
const compareLanguage = (reqs: LanguageRequirement[], profile?: MyProfile): CriterionResult => {
  const comparable = reqs.filter(
    (r) => r.minScore != null && profile?.languageScores.some((s) => s.testType === r.testType),
  );
  if (comparable.length === 0) return 'UNKNOWN';
  return comparable.some(
    (r) =>
      (profile?.languageScores.find((s) => s.testType === r.testType)?.score ?? 0) >= r.minScore!,
  )
    ? 'MET'
    : 'NOT_MET';
};

export const toOfficialInfo = (d: UniversityDetail, profile?: MyProfile): OfficialInfo => {
  const a = d.agreement;
  const reqs = a?.languageRequirements ?? [];
  const codes = d.eligibility.reasonCodes;
  const has = (list: string[]) => codes.some((c) => list.includes(c));

  const gpaResult: CriterionResult =
    has(NO_AGREEMENT) || has(GPA_UNKNOWN)
      ? 'UNKNOWN'
      : codes.includes('GPA_BELOW_MIN')
        ? 'NOT_MET'
        : 'MET';
  const languageResult: CriterionResult = has(NO_AGREEMENT)
    ? 'UNKNOWN'
    : codes.includes('LANGUAGE_BELOW_MIN')
      ? 'NOT_MET'
      : has(LANGUAGE_UNKNOWN)
        ? 'UNKNOWN'
        : gpaResult === 'MET'
          ? 'MET'
          : compareLanguage(reqs, profile);

  const myLanguage = (profile?.languageScores ?? [])
    .filter((s) => reqs.length === 0 || reqs.some((r) => r.testType === s.testType))
    .map((s) => `${languageTestLabel(s.testType)} ${s.score}`)
    .join(' / ');

  return {
    gpaCriterion: a?.minGpa != null ? `${gpaText(a.minGpa)} 이상` : undefined,
    languageCriterion: reqs.length ? languageText(reqs) : undefined,
    summary:
      [a?.costSummary, a?.benefitSummary, a?.remarkSummary, a?.courseRestriction]
        .filter(Boolean)
        .join('\n') || undefined,
    sourceUrl: a?.sourceUrl ?? undefined,
    courseListUrl: d.courseListUrl ?? undefined,
    baseDate: a?.announcedAt ?? null,
    judgment: {
      result: d.eligibility.status,
      reason:
        d.eligibility.message ??
        (d.eligibility.status === 'ELIGIBLE' ? '학점·어학 기준을 모두 충족해요' : '-'),
      rows: [
        {
          item: '누적 학점',
          criterion: a?.minGpa != null ? `${gpaText(a.minGpa)} 이상` : '-',
          mine: profile?.gpa != null ? profile.gpa.toFixed(2) : '-',
          result: gpaResult,
        },
        {
          item: '어학',
          criterion: reqs.length ? languageText(reqs) : '-',
          mine: myLanguage || '-',
          result: languageResult,
        },
      ],
    },
  };
};

export type AdmissionReport = {
  reportId: number;
  result: AdmissionResult;
  semester: string;
  majorType: MajorType;
  gpa: number;
  exam: string | null;
  score: number | null;
};

export const toAdmissionReport = (r: UniversityAdmissionReport): AdmissionReport => ({
  reportId: r.admissionReportId,
  result: r.result,
  semester: r.semester,
  majorType: r.majorType,
  gpa: r.gpa,
  exam: r.languageTestType,
  score: r.languageScore,
});

export type CreditType = RecognitionType;

export type Course = {
  courseId: number;
  name: string;
  code: string;
  credits: number | null;
  hasCase: boolean;
};

export const toCourse = (c: UniversityCourse): Course => ({
  courseId: c.courseId,
  name: c.courseName,
  code: c.courseCode ?? '-',
  credits: c.foreignCredit,
  hasCase: c.hasRecognition,
});

export type CourseCase = {
  caseId: number;
  foreignCourse: string;
  homeCourse: string;
  creditType: CreditType;
  credits: number;
  majorType: MajorType;
  semester: string;
};

export const toCourseCase = (c: UniversityCourseCase): CourseCase => ({
  caseId: c.courseCaseId,
  foreignCourse: c.foreignCourseName,
  homeCourse: c.homeCourseName ?? '-',
  creditType: c.recognitionType,
  credits: c.recognizedCredit,
  majorType: c.majorType,
  semester: c.semester,
});

export type { HousingType };

// 비용은 등록자가 입력한 원문 그대로 (통화·기간이 달라 환산하지 않음)
export type ReturnReport = {
  reportId: number;
  semester: string;
  cost: { flight?: string; insurance?: string; monthlyLiving?: string; total?: string };
  housing: HousingType | null;
  visa?: string;
  insurancePlace?: string;
  summary: string;
};

const text = (v: string | null) => v?.trim() || undefined;

export const toReturnReport = (r: UniversityReturnReport): ReturnReport => ({
  reportId: r.returnReportId,
  semester: r.semester,
  cost: {
    flight: text(r.costFlight),
    insurance: text(r.costInsurance),
    monthlyLiving: text(r.costLivingMonthly),
    total: text(r.costTotal),
  },
  housing: (r.housingType as HousingType | null) ?? null,
  visa: [text(r.visaDuration), text(r.visaType)].filter(Boolean).join(' · ') || undefined,
  insurancePlace: text(r.insuranceProvider),
  summary: r.reviewSummary ?? '',
});
