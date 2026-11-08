// TODO
// POST /auth/signup            회원가입
// POST /users/nickname/check   닉네임 중복 확인
// POST /auth/email/send        학교 메일 인증 발송
// POST /auth/email/verify      학교 메일 인증 확인

import { useMutation } from '@tanstack/react-query';
import { api } from './client';
import { saveToken } from './token';
import type { MajorType } from '@/shared/types/enums';

export type LoginRequest = { schoolEmail: string; password: string };
export type LoginResponse = {
  accessToken: string;
  tokenType: 'Bearer';
  expiresIn: number;
  user: { userId: number; schoolEmail: string; nickname: string; majorType: MajorType };
};

const DEV_EMAIL = import.meta.env.VITE_DEV_LOGIN_EMAIL;
const DEV_PASSWORD = import.meta.env.VITE_DEV_LOGIN_PASSWORD;

export const login = (body: LoginRequest) => {
  // 개발용 임시 계정. BE 로그인이 열리면 환경 변수 삭제
  if (
    DEV_EMAIL &&
    DEV_PASSWORD &&
    body.schoolEmail === DEV_EMAIL &&
    body.password === DEV_PASSWORD
  ) {
    return Promise.resolve<LoginResponse>({
      accessToken: 'dev-token',
      tokenType: 'Bearer',
      expiresIn: 0,
      user: { userId: 0, schoolEmail: DEV_EMAIL, nickname: '개발용', majorType: 'PRIMARY' },
    });
  }
  return api<LoginResponse>('/auth/login', { method: 'POST', body });
};

// 성공 시 토큰 저장까지 함
export const useLogin = () =>
  useMutation({
    mutationFn: login,
    onSuccess: (data) => saveToken(data.accessToken),
  });
