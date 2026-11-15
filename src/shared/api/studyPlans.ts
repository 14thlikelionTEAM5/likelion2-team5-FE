
import { useQuery } from '@tanstack/react-query';
import { api } from './client';

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

export type StudyPlanItem = {
  itemId: number;
  itemType: 'DIRECT' | 'REFERENCE';
  courseName: string;
  foreignCredit: number | null;
  sourceCourseId: number | null;
  homeCourseId: number | null;
  recognitionType: 'MAJOR_REQUIRED' | 'MAJOR_ELECTIVE' | 'GENERAL';
  expectedCredit: number | null;
  creditLimitWarning: boolean;
};

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

export const getStudyPlans = () =>
  api<StudyPlanSummary[]>('/study-plans');

export const getStudyPlanDetail = (studyPlanId: number) =>
  api<StudyPlanDetail>(`/study-plans/${studyPlanId}`);

export const useStudyPlans = () =>
  useQuery({
    queryKey: ['study-plans'],
    queryFn: getStudyPlans,
  });

export const useStudyPlanDetail = (studyPlanId: number) =>
  useQuery({
    queryKey: ['study-plans', studyPlanId],
    queryFn: () => getStudyPlanDetail(studyPlanId),
    enabled: Number.isInteger(studyPlanId) && studyPlanId > 0,
  });
