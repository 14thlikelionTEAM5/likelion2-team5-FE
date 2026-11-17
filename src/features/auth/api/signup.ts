import { api } from '@/shared/api/client';
import type { components } from '@/shared/api/schema';

export type SignupRequest = components['schemas']['SignupRequest'];
export type SignupConditionsInput = Pick<SignupRequest, 'gpa' | 'languageScores'>;

export function registerAccount(body: SignupRequest) {
  return api<components['schemas']['SignupResponse']>('/auth/signup', { method: 'POST', body });
}
