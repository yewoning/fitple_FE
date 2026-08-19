import { ApiError, requestRaw } from '@/services/api-client';
import type {
  CheckLoginIdResponse,
  SigninRequest,
  SigninResponse,
  SignupRequest,
  SignupResponse,
} from '@/types/auth';

export function checkLoginId(loginId: string) {
  return requestRaw<CheckLoginIdResponse>(`/api/auth/check_id?login_id=${encodeURIComponent(loginId)}`);
}

export async function signup(payload: SignupRequest): Promise<SignupResponse> {
  const response = await requestRaw<SignupResponse>('/api/auth/signup', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  if (!response.success) {
    throw new ApiError(response.message);
  }

  return response;
}

export async function signin(payload: SigninRequest): Promise<SigninResponse> {
  const response = await requestRaw<SigninResponse>('/api/auth/signin', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  if (!response.success) {
    throw new ApiError(response.message);
  }

  return response;
}
