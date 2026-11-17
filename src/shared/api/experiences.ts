import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type {
  AdmissionResult,
  HousingType,
  LanguageTestType,
  MajorType,
  RecognitionType,
} from '@/shared/types/enums';
import { api } from './client';

// 등록 중복 확인
export type ExperienceType = 'RETURN_REPORT' | 'PASS' | 'FAIL' | 'COURSE_CASE';
export type DuplicateCheckResponse = {
  available: boolean;
  reason: 'ALREADY_REGISTERED' | 'REPORT_REQUIRED' | null;
};

export const checkDuplicate = (type: ExperienceType, universityId: number, semester: string) =>
  api<DuplicateCheckResponse>(
    `/experiences/check-duplicate?${new URLSearchParams({
      type,
      universityId: String(universityId),
      semester,
    })}`,
  );

export const useCheckDuplicate = (
  type: ExperienceType | null,
  universityId: number | null,
  semester: string,
) =>
  useQuery({
    queryKey: ['experiences', 'duplicate', type, universityId, semester],
    queryFn: () => checkDuplicate(type!, universityId!, semester),
    enabled: !!type && !!universityId,
  });

// 외부 AI 처리 동의
export const recordAiConsent = () =>
  api<{ consentType: string; consentedAt: string }>('/consents', {
    method: 'POST',
    body: { consentType: 'EXTERNAL_AI' },
  });

// 귀국보고서
export type ReturnReportCost = {
  flight: string | null;
  insurance: string | null;
  livingMonthly: string | null;
  total: string | null;
};
export type ReturnReportVisa = { duration: string | null; type: string | null };

export type ReturnReportCourse = {
  courseId?: number;
  courseCode: string | null;
  courseNameEn: string;
  foreignCredit: number;
  satisfaction: number | null;
};

export type ReturnReportExtractResponse = {
  cost: ReturnReportCost | null;
  housingType: string | null;
  visa: ReturnReportVisa | null;
  insuranceProvider: string | null;
  courses: Partial<ReturnReportCourse>[] | null;
  reviewSummary: string | null;
};

// Gemini 호출이라 10~40초 걸림
export const extractReturnReport = (text: string) =>
  api<ReturnReportExtractResponse>('/return-reports/extract', { method: 'POST', body: { text } });

export type ReturnReportBody = {
  cost: ReturnReportCost;
  housingType: HousingType | null;
  visa: ReturnReportVisa;
  insuranceProvider: string | null;
  courses: ReturnReportCourse[];
  reviewSummary: string | null;
};

export const saveReturnReport = (
  body: ReturnReportBody & { universityId: number; semester: string },
) => api<{ returnReportId: number }>('/return-reports', { method: 'POST', body });

export const updateReturnReport = (reportId: number, body: ReturnReportBody) =>
  api<{ returnReportId: number }>(`/return-reports/${reportId}`, { method: 'PUT', body });

export const deleteReturnReport = (reportId: number) =>
  api<null>(`/return-reports/${reportId}`, { method: 'DELETE' });

// 합격·탈락 스펙 (학점·전공은 서버가 프로필에서 복사함)
export type AdmissionReportBody = {
  universityId: number;
  semester: string;
  result: AdmissionResult;
  languageTestType: LanguageTestType | null;
  languageScore: number | null;
};

export const saveAdmissionReport = (body: AdmissionReportBody) =>
  api<{ admissionReportId: number }>('/admission-reports', { method: 'POST', body });

export const updateAdmissionReport = (reportId: number, body: AdmissionReportBody) =>
  api<{ admissionReportId: number }>(`/admission-reports/${reportId}`, { method: 'PUT', body });

export const deleteAdmissionReport = (reportId: number) =>
  api<null>(`/admission-reports/${reportId}`, { method: 'DELETE' });

// 인정 사례 (교양이면 homeCourseId null)
export type CourseCaseBody = {
  returnReportCourseId: number;
  recognitionType: RecognitionType;
  homeCourseId: number | null;
  recognizedCredit: number;
};

export const saveCourseCase = (body: CourseCaseBody) =>
  api<{ courseCaseId: number }>('/course-cases', { method: 'POST', body });

export const updateCourseCase = (caseId: number, body: CourseCaseBody) =>
  api<{ courseCaseId: number }>(`/course-cases/${caseId}`, { method: 'PUT', body });

export const deleteCourseCase = (caseId: number) =>
  api<null>(`/course-cases/${caseId}`, { method: 'DELETE' });

// 내 등록 내역
export type MyAdmissionReport = {
  admissionReportId: number;
  universityId: number;
  universityName: string;
  semester: string;
  result: AdmissionResult;
  languageTestType: LanguageTestType | null;
  languageScore: number | null;
  gpa: number;
  majorType: MajorType;
};

export type MyReturnReport = {
  returnReportId: number;
  universityId: number;
  universityName: string;
  semester: string;
  cost: ReturnReportCost | null;
  housingType: string | null;
  visa: ReturnReportVisa | null;
  insuranceProvider: string | null;
  courses: (ReturnReportCourse & { courseId: number })[];
  reviewSummary: string | null;
};

export type MyCourseCase = {
  courseCaseId: number;
  universityId: number;
  universityName: string;
  semester: string;
  returnReportCourseId: number;
  courseNameEn: string;
  recognitionType: RecognitionType;
  homeCourse: { homeCourseId: number; code: string; name: string; credit: number } | null;
  recognizedCredit: number;
  majorType: MajorType;
};

export type MyExperiencesResponse = {
  admissionReports: MyAdmissionReport[];
  returnReports: MyReturnReport[];
  courseCases: MyCourseCase[];
};

export const useMyExperiences = () =>
  useQuery({
    queryKey: ['experiences', 'me'],
    queryFn: () => api<MyExperiencesResponse>('/users/me/experiences'),
  });

// 저장·수정·삭제 후 내 내역, 중복 확인, 학교 상세를 다시 불러옴
export const useExperienceMutation = <TVars, TData>(fn: (vars: TVars) => Promise<TData>) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: fn,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['experiences'] });
      void queryClient.invalidateQueries({ queryKey: ['universities'] });
    },
  });
};
