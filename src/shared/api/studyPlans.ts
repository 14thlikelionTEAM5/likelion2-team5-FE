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
  homeCourseName: string | null;
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

// PATCH - 수강계획 이름 수정
export type RenameStudyPlanRequest = {
  studyPlanId: number;
  name: string;
};

export type RenameStudyPlanResponse = {
  studyPlanId: number;
  name: string;
  updatedAt: string;
};

export const renameStudyPlan = ({ studyPlanId, name }: RenameStudyPlanRequest) =>
  api<RenameStudyPlanResponse>(`/study-plans/${studyPlanId}`, {
    method: 'PATCH',
    body: { name },
  });

export const useRenameStudyPlan = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: renameStudyPlan,
    onSuccess: ({ studyPlanId }) => {
      void queryClient.invalidateQueries({ queryKey: ['study-plans'] });
      void queryClient.invalidateQueries({ queryKey: ['study-plans', studyPlanId] });
    },
  });
};

// POST - 수강계획 과목 추가
export type AddStudyPlanItemRequest = {
  itemType: 'REGISTERED' | 'CUSTOM';
  courseName: string;
  foreignCredit: number;
  sourceCourseId: number | null;
  homeCourseId: number | null;
  recognitionType: 'MAJOR_REQUIRED' | 'MAJOR_ELECTIVE' | 'GENERAL' | null;
};
export type AddStudyPlanItemResponse = { itemId: number };
export const addStudyPlanItem = (studyPlanId: number, body: AddStudyPlanItemRequest) =>
  api<AddStudyPlanItemResponse>(`/study-plans/${studyPlanId}/items`, { method: 'POST', body });
export const useAddStudyPlanItem = (studyPlanId: number) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (body: AddStudyPlanItemRequest) => addStudyPlanItem(studyPlanId, body),
    onSuccess: () => { void queryClient.invalidateQueries({ queryKey: ['study-plans'] }); },
  });
};

// DELETE - 수강계획에 담긴 과목 삭제
export type DeleteStudyPlanItemResponse = {
  itemId: number;
};

export const deleteStudyPlanItem = (studyPlanId: number, itemId: number) =>
  api<DeleteStudyPlanItemResponse>(`/study-plans/${studyPlanId}/items/${itemId}`, {
    method: 'DELETE',
  });

export const useDeleteStudyPlanItem = (studyPlanId: number) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (itemId: number) => deleteStudyPlanItem(studyPlanId, itemId),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['study-plans'] });
    },
  });
};

// PATCH - 수강계획 과목 수정 (외국 학점 / 본교 과목 연결만 허용)
export type UpdateStudyPlanItemChanges = {
  foreignCredit?: number;
  homeCourseId?: number | null;
};

export type UpdateStudyPlanItemRequest = {
  studyPlanId: number;
  itemId: number;
  changes: UpdateStudyPlanItemChanges;
};

export type UpdateStudyPlanItemResponse = {
  itemId: number;
  itemType: 'REGISTERED' | 'CUSTOM';
  courseName: string;
  foreignCredit: number;
  sourceCourseId: number | null;
  homeCourseId: number | null;
  recognitionType: 'MAJOR_REQUIRED' | 'MAJOR_ELECTIVE' | 'GENERAL' | null;
  updatedAt: string;
};

export const updateStudyPlanItem = ({ studyPlanId, itemId, changes }: UpdateStudyPlanItemRequest) =>
  api<UpdateStudyPlanItemResponse>(`/study-plans/${studyPlanId}/items/${itemId}`, {
    method: 'PATCH',
    body: changes,
  });

export const useUpdateStudyPlanItem = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: updateStudyPlanItem,
    onSuccess: (_data, { studyPlanId }) => {
      void queryClient.invalidateQueries({ queryKey: ['study-plans'] });
      void queryClient.invalidateQueries({ queryKey: ['study-plans', studyPlanId] });
    },
  });
};

// DELETE - 수강계획 자체 삭제 (연결된 계획 과목은 서버에서 함께 삭제)
export type DeleteStudyPlanResponse = {
  studyPlanId: number;
};

export const deleteStudyPlan = (studyPlanId: number) =>
  api<DeleteStudyPlanResponse>(`/study-plans/${studyPlanId}`, {
    method: 'DELETE',
  });

export const useDeleteStudyPlan = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteStudyPlan,
    onSuccess: (_response, studyPlanId) => {
      void queryClient.invalidateQueries({ queryKey: ['study-plans'] });
      void queryClient.removeQueries({ queryKey: ['study-plans', studyPlanId], exact: true });
    },
  });
};
