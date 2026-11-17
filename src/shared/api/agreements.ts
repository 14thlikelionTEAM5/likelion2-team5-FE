import { useQuery } from '@tanstack/react-query';
import { api } from './client';

// 이전 학기 데이터가 없으면 건수는 null
export type AgreementChangesResponse = {
  semester: string | null;
  previousSemester: string | null;
  standardDate: string | null;
  newCount: number | null;
  quotaChangedCount: number | null;
  closedCount: number | null;
};

export const useAgreementChanges = () =>
  useQuery({
    queryKey: ['agreements', 'changes'],
    queryFn: () => api<AgreementChangesResponse>('/agreements/changes'),
  });
