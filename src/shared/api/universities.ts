// TODO
// /universities                                   협정교 목록
// /universities/countries                         국가 목록
// /universities/search                            학교 검색
// /universities/{universityId}                    협정교 상세
// /universities/{universityId}/admission-reports  합격·탈락 스펙 분포, 목록
// /universities/{universityId}/courses            수강 과목 목록
// /universities/{universityId}/course-cases       인정 사례 목록
// /universities/{universityId}/return-reports     귀국보고서

import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type {
  AdmissionResult,
  EligibilityStatus,
  LanguageTestType,
  MajorType,
  RecognitionType,
} from '@/shared/types/enums';
import { addBookmark, removeBookmark } from './bookmarks';
import { api } from './client';

export type UniversitySearchResult = {
  universityId: number;
  name: string;
  country: string;
};

/** Requires login. The server trims, matches without case/accents and returns up to 10 rows. */
export function searchUniversities(keyword: string): Promise<UniversitySearchResult[]> {
  const normalized = keyword.trim();
  const length = Array.from(normalized).length;
  if (length < 1 || length > 50) {
    return Promise.reject(new Error('학교명은 앞뒤 공백을 제외하고 1~50자로 입력해 주세요.'));
  }
  return api<UniversitySearchResult[]>(
    `/universities/search?${new URLSearchParams({ keyword: normalized })}`,
  );
}

export type LanguageRequirement = {
  testType: LanguageTestType;
  minScore: number | null;
  conditionNote?: string | null; // 영역별 최저점 등 추가 조건
};

export type Eligibility = {
  status: EligibilityStatus;
  reasonCodes: string[];
  message: string | null;
};

export type UniversityListItem = {
  universityId: number;
  name: string;
  country: string;
  isEquis: boolean | null;
  isAacsb: boolean | null;
  creditSystem: string;
  agreementId: number | null;
  quota: number | null;
  minGpa: number | null;
  languageRequirements: LanguageRequirement[];
  costSummary: string | null;
  hasExperienceData: boolean;
  announcedAt: string | null;
  semesterChanges: string[]; // NEW, QUOTA_CHANGED, RECRUITMENT_STOPPED
  eligibility: Eligibility;
  isBookmarked: boolean;
};

export type UniversityListResponse = {
  semester: string | null;
  totalCount: number;
  universities: UniversityListItem[];
};

export type UniversityListParams = {
  keyword?: string;
  country?: string;
  languageTest?: LanguageTestType;
  eligibleOnly?: boolean;
  sort?: 'NAME' | 'COUNTRY';
};

const toQuery = (params: Record<string, string | number | boolean | undefined>) => {
  const q = new URLSearchParams();
  Object.entries(params).forEach(([k, v]) => {
    if (v !== undefined && v !== '' && v !== false) q.set(k, String(v));
  });
  return q.size ? `?${q}` : '';
};

export const getUniversities = (params: UniversityListParams) =>
  api<UniversityListResponse>(`/universities${toQuery(params)}`);

// 필터 바뀔 때 이전 목록을 유지해서 깜빡이지 않게 함
export const useUniversities = (params: UniversityListParams) =>
  useQuery({
    queryKey: ['universities', 'list', params],
    queryFn: () => getUniversities(params),
    placeholderData: keepPreviousData,
  });

export type UniversityCountry = { country: string; universityCount: number };

export const useUniversityCountries = () =>
  useQuery({
    queryKey: ['universities', 'countries'],
    queryFn: () => api<{ countries: UniversityCountry[] }>('/universities/countries'),
    select: (data) => data.countries,
    staleTime: Infinity,
  });

export type UniversityDetail = {
  universityId: number;
  name: string;
  country: string;
  isEquis: boolean | null;
  isAacsb: boolean | null;
  creditSystem: string;
  courseListUrl: string | null;
  semester: string | null;
  availableSemesters: string[];
  agreement: {
    agreementId: number;
    quota: number | null;
    exchangePeriod: string | null;
    minGpa: number | null;
    costSummary: string | null;
    benefitSummary: string | null;
    remarkSummary: string | null;
    courseRestriction: string | null;
    isBusinessOnly: boolean;
    isOpen: boolean;
    announcedAt: string | null;
    importedAt: string | null;
    sourceUrl: string | null;
    languageRequirements: LanguageRequirement[];
  } | null;
  eligibility: Eligibility;
  isBookmarked: boolean;
  hasStudyPlan: boolean;
  studyPlanId: number | null;
};

const validId = (id: number) => Number.isInteger(id) && id > 0;

export const useUniversity = (universityId: number) =>
  useQuery({
    queryKey: ['universities', universityId],
    queryFn: () => api<UniversityDetail>(`/universities/${universityId}`),
    enabled: validId(universityId),
  });

export type UniversityReturnReport = {
  returnReportId: number;
  semester: string;
  costFlight: string | null;
  costInsurance: string | null;
  costLivingMonthly: string | null;
  costTotal: string | null;
  housingType: string | null;
  visaDuration: string | null;
  visaType: string | null;
  insuranceProvider: string | null;
  reviewSummary: string | null;
};

export const useUniversityReturnReports = (universityId: number) =>
  useQuery({
    queryKey: ['universities', universityId, 'return-reports'],
    queryFn: () =>
      api<{ returnReports: UniversityReturnReport[] }>(
        `/universities/${universityId}/return-reports`,
      ),
    select: (data) => data.returnReports,
    enabled: validId(universityId),
  });

export type UniversityCourse = {
  courseId: number;
  courseCode: string | null;
  courseName: string;
  foreignCredit: number | null;
  hasRecognition: boolean;
};

export const useUniversityCourses = (universityId: number) =>
  useQuery({
    queryKey: ['universities', universityId, 'courses'],
    queryFn: () => api<{ courses: UniversityCourse[] }>(`/universities/${universityId}/courses`),
    select: (data) => data.courses,
    enabled: validId(universityId),
  });

export type UniversityCourseCase = {
  courseCaseId: number;
  foreignCourseName: string;
  homeCourseName: string | null;
  recognitionType: RecognitionType;
  recognizedCredit: number;
  majorType: MajorType;
  semester: string;
};

export const useUniversityCourseCases = (universityId: number) =>
  useQuery({
    queryKey: ['universities', universityId, 'course-cases'],
    queryFn: () =>
      api<{ courseCases: UniversityCourseCase[] }>(`/universities/${universityId}/course-cases`),
    select: (data) => data.courseCases,
    enabled: validId(universityId),
  });

// Swagger 스키마 이름이 겹쳐서 schema.d.ts 타입이 틀림. BE 코드 기준으로 작성함
export type UniversityAdmissionReport = {
  admissionReportId: number;
  semester: string;
  result: AdmissionResult;
  majorType: MajorType;
  gpa: number;
  languageTestType: LanguageTestType | null;
  languageScore: number | null;
};

export const useUniversityAdmissionReports = (universityId: number) =>
  useQuery({
    queryKey: ['universities', universityId, 'admission-reports'],
    queryFn: () =>
      api<{ admissionReports: UniversityAdmissionReport[] }>(
        `/universities/${universityId}/admission-reports`,
      ),
    select: (data) => data.admissionReports,
    enabled: validId(universityId),
  });

// 목록·상세의 찜 별표. 찜 목록 캐시도 같이 갱신함
export const useToggleUniversityBookmark = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ universityId, on }: { universityId: number; on: boolean }) =>
      on ? addBookmark(universityId) : removeBookmark(universityId),
    // 별이 바로 바뀌도록 먼저 반영하고, 끝나면 서버 값으로 맞춤
    onMutate: async ({ universityId, on }) => {
      await queryClient.cancelQueries({ queryKey: ['universities'] });
      queryClient.setQueriesData<UniversityListResponse>(
        { queryKey: ['universities', 'list'] },
        (data) =>
          data && {
            ...data,
            universities: data.universities.map((u) =>
              u.universityId === universityId ? { ...u, isBookmarked: on } : u,
            ),
          },
      );
      queryClient.setQueryData<UniversityDetail>(
        ['universities', universityId],
        (data) => data && { ...data, isBookmarked: on },
      );
    },
    onSettled: () => {
      void queryClient.invalidateQueries({ queryKey: ['universities'] });
      void queryClient.invalidateQueries({ queryKey: ['bookmarks'] });
    },
  });
};
