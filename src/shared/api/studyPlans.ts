
import {
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query';
import { api } from './client';

// 수강계획 목록
export type StudyPlanSummary = {
  studyPlanId: number;
  universityId: number;
  universityName: string;
  name: string;
  courseCount: number;
  totalExpectedCredits: number | null;
  createdAt: string;
  updatedAt: string;
};

// 수강계획에 담긴 과목
export type StudyPlanItem = {
  itemId: number;
  itemType: 'DIRECT' | 'REFERENCE';
  courseName: string;
  foreignCredit: number | null;
  sourceCourseId: number | null;
  homeCourseId: number | null;
  recognitionType:
    | 'MAJOR_REQUIRED'
    | 'MAJOR_ELECTIVE'
    | 'GENERAL';
  expectedCredit: number | null;
  creditLimitWarning: boolean;
};

// 수강계획 상세
export type StudyPlanDetail = {
  studyPlanId: number;
  name: string;
  universityId: number;
  universityName: string;
  calculation: {
    status: 'CALCULABLE' | 'NOT_CALCULABLE';
    rule: 'ECTS_X0_6' | 'AS_IS' | null;
    reasonCode: string | null;
  };
  items: StudyPlanItem[];
  totalExpectedCredit: number | null;
  semesterCreditLimit: number | null;
  semesterCreditLimitWarning: boolean;
};

// 수강계획 생성 요청
export type CreateStudyPlanRequest = {
  universityId: number;
  name: string;
};

// 수강계획 생성 응답
export type CreateStudyPlanResponse = {
  studyPlanId: number;
};

// GET - 목록 조회
export const getStudyPlans = () =>
  api<StudyPlanSummary[]>('/study-plans');

// GET - 상세 조회
export const getStudyPlanDetail = (studyPlanId: number) =>
  api<StudyPlanDetail>(`/study-plans/${studyPlanId}`);

// POST - 수강계획 생성
export const createStudyPlan = (
  body: CreateStudyPlanRequest,
) =>
  api<CreateStudyPlanResponse>('/study-plans', {
    method: 'POST',
    body,
  });

// 목록 조회 훅
export const useStudyPlans = () =>
  useQuery({
    queryKey: ['study-plans'],
    queryFn: getStudyPlans,
  });

// 상세 조회 훅
export const useStudyPlanDetail = (studyPlanId: number) =>
  useQuery({
    queryKey: ['study-plans', studyPlanId],
    queryFn: () => getStudyPlanDetail(studyPlanId),
    enabled: Number.isInteger(studyPlanId) && studyPlanId > 0,
  });

// 수강계획 생성 훅
export const useCreateStudyPlan = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createStudyPlan,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['study-plans'],
      });
    },
  });
};
