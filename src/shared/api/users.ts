import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { MajorType } from '@/shared/types/enums';
import { api } from './client';

export type { MajorType } from '@/shared/types/enums';

export type MyLanguageScore = {
  testType: string;
  score: number;
};

export type MyProfile = {
  userId: number;
  schoolEmail: string;
  nickname: string;
  majorType: string | null;
  gpa: number | null;
  languageScores: MyLanguageScore[];
  externalAiConsented: boolean;
};

const USE_MOCK = import.meta.env.DEV && import.meta.env.VITE_USE_MOCK === 'true';

// 개발 전용 예시 데이터입니다. 실제 회원 정보가 아닙니다.
let mockProfile: MyProfile = {
  userId: 1,
  schoolEmail: 'demo@hufs.ac.kr',
  nickname: '테스트사용자',
  majorType: 'PRIMARY',
  gpa: 4.12,
  languageScores: [
    { testType: 'TOEFL_IBT', score: 100 },
    { testType: 'IELTS', score: 7 },
  ],
  externalAiConsented: false,
};

// api 클라이언트가 /api/v1 접두사와 data 언래핑을 담당합니다.
export const getMyProfile = (): Promise<MyProfile> =>
  USE_MOCK ? Promise.resolve(mockProfile) : api<MyProfile>('/users/me');

export const useMyProfile = () =>
  useQuery({ queryKey: ['users', 'me'], queryFn: getMyProfile });

// GET /users/nickname/check — 토큰이 있으면 api 클라이언트에서 자동 첨부합니다.
export type NicknameCheckResponse = {
  nickname: string;
  available: boolean;
  isCurrent: boolean;
};

export const isValidNickname = (nickname: string): boolean =>
  /^[가-힣A-Za-z0-9]{2,12}$/.test(nickname.normalize('NFC'));

export const checkNickname = (nickname: string): Promise<NicknameCheckResponse> => {
  const normalized = nickname.normalize('NFC');
  if (!isValidNickname(normalized)) {
    return Promise.reject(new Error('닉네임은 2~12자의 한글 완성형, 영문, 숫자만 사용할 수 있습니다.'));
  }
  if (USE_MOCK) {
    const isCurrent = normalized.toLowerCase() === mockProfile.nickname.toLowerCase();
    const isTaken = ['채원', 'admin', 'testuser'].some((value) => value.toLowerCase() === normalized.toLowerCase());
    return Promise.resolve({ nickname: normalized, available: isCurrent || !isTaken, isCurrent });
  }
  return api<NicknameCheckResponse>(`/users/nickname/check?nickname=${encodeURIComponent(normalized)}`);
};

export const useCheckNickname = () =>
  useMutation({ mutationFn: checkNickname });

// PATCH /users/me: 전달한 필드만 수정. languageScores는 전달 시 전체 교체.
export type LanguageTestType = 'TOEFL_IBT' | 'TOEFL_NEW' | 'TOEFL_ITP' | 'IELTS';
export type UpdateMyProfileRequest = Partial<{
  nickname: string;
  majorType: MajorType;
  gpa: number;
  languageScores: { testType: LanguageTestType; score: number }[];
}>;

export const updateMyProfile = (body: UpdateMyProfileRequest): Promise<MyProfile> => {
  if (USE_MOCK) {
    mockProfile = {
      ...mockProfile,
      ...body,
      languageScores: body.languageScores === undefined ? mockProfile.languageScores : [...body.languageScores],
    };
    return Promise.resolve({ ...mockProfile, languageScores: [...mockProfile.languageScores] });
  }
  return api<MyProfile>('/users/me', { method: 'PATCH', body });
};

export const useUpdateMyProfile = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: updateMyProfile,
    onSuccess: (updated) => {
      // PATCH 응답에는 externalAiConsented 필드가 생략될 수 있어 기존 값을 보존.
      queryClient.setQueryData<MyProfile>(['users', 'me'], (previous) => ({
        ...(previous ?? updated), ...updated,
        externalAiConsented: updated.externalAiConsented ?? previous?.externalAiConsented ?? false,
      }));
      void queryClient.invalidateQueries({ queryKey: ['users', 'me'] });
    },
  });
};

// PATCH /users/me/password — 성공 응답의 data는 null입니다.
export type ChangePasswordRequest = {
  currentPassword: string;
  newPassword: string;
};

export const changeMyPassword = (body: ChangePasswordRequest): Promise<null> => {
  if (USE_MOCK) return Promise.resolve(null);
  return api<null>('/users/me/password', { method: 'PATCH', body });
};

export const useChangeMyPassword = () =>
  useMutation({ mutationFn: changeMyPassword });

// DELETE /users/me — 성공 시 응답 data는 null입니다.
// 계정 및 관련 데이터 삭제는 서버의 트랜잭션에서 처리합니다.
export const deleteMyAccount = (): Promise<null> => {
  if (USE_MOCK) return Promise.resolve(null);
  return api<null>('/users/me', { method: 'DELETE' });
};

export const useDeleteMyAccount = () =>
  useMutation({ mutationFn: deleteMyAccount });
