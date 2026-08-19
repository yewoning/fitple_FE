import { ApiError, requestRaw } from '@/services/api-client';
import { getDemoUser } from '@/mocks/fixtures';
import { demoStore } from '@/mocks/demo-store';
import { withDemoFallback } from '@/services/demo-fallback';
import type {
  CheckLoginIdResponse,
  SigninRequest,
  SigninResponse,
  SignupRequest,
  SignupResponse,
} from '@/types/auth';

export function checkLoginId(loginId: string) {
  return withDemoFallback(
    () =>
      requestRaw<CheckLoginIdResponse>(
        `/api/auth/check_id?login_id=${encodeURIComponent(loginId)}`,
      ),
    () => ({ available: true, message: '사용 가능한 아이디입니다.' }),
  );
}

export async function signup(payload: SignupRequest): Promise<SignupResponse> {
  const response = await withDemoFallback(
    () =>
      requestRaw<SignupResponse>('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      }),
    () => {
      const user = getDemoUser();
      demoStore.getState().updateProfile(user.memberId, {
        name: payload.name,
        profileSummary: '',
      });
      return { success: true, memberId: user.memberId, message: '회원가입이 완료되었습니다.' };
    },
  );

  if (!response.success) {
    throw new ApiError(response.message);
  }

  return response;
}

export async function signin(payload: SigninRequest): Promise<SigninResponse> {
  const response = await withDemoFallback(
    () =>
      requestRaw<SigninResponse>('/api/auth/signin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      }),
    () => ({
      success: true,
      memberId: getDemoUser().memberId,
      message: '로그인이 완료되었습니다.',
    }),
  );

  if (!response.success) {
    throw new ApiError(response.message);
  }

  return response;
}
