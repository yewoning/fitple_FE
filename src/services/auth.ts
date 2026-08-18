import { request } from '@/services/api-client';
import type { CheckLoginIdData, SigninRequest, SignupRequest } from '@/types/auth';

export function checkLoginId(loginId: string) {
  return request<CheckLoginIdData>(`/api/auth/check_id?login_id=${encodeURIComponent(loginId)}`);
}

export function signup(payload: SignupRequest) {
  return request('/api/auth/signup', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
}

export function signin(payload: SigninRequest) {
  return request('/api/auth/signin', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
}
