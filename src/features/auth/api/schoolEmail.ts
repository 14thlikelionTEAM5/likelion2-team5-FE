import { api } from '@/shared/api/client';
import type { components } from '@/shared/api/schema';

type Schemas = components['schemas'];

export function sendSchoolEmailCode(schoolEmail: string) {
  const body: Schemas['EmailSendRequest'] = { schoolEmail };
  return api<Schemas['EmailSendResponse']>('/auth/email/send', { method: 'POST', body });
}

export function verifySchoolEmailCode(schoolEmail: string, code: string) {
  const body: Schemas['EmailVerifyRequest'] = { schoolEmail, code };
  return api<Schemas['EmailVerifyResponse']>('/auth/email/verify', { method: 'POST', body });
}
