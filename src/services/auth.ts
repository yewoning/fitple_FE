import type {
  ApiResponse,
  CheckLoginIdResponse,
  ProfileResponse,
  SigninRequest,
  SignupRequest,
} from '@/types/auth';

const NETWORK_ERROR_MESSAGE = '서버에 연결하지 못했습니다. 잠시 후 다시 시도해주세요.';
const INVALID_RESPONSE_MESSAGE = '서버 응답을 확인할 수 없습니다. 잠시 후 다시 시도해주세요.';

const PROFILE_PATH = '/api/profile';

export class AuthApiError extends Error {
  constructor(
    message: string,
    readonly status?: number,
  ) {
    super(message);
    this.name = 'AuthApiError';
  }
}

function getApiBaseUrl() {
  const baseUrl = process.env.EXPO_PUBLIC_API_BASE_URL?.trim();

  if (!baseUrl) {
    throw new AuthApiError(
      'API 서버 주소가 설정되지 않았습니다. EXPO_PUBLIC_API_BASE_URL을 확인해주세요.',
    );
  }

  return baseUrl.replace(/\/+$/, '');
}

function isApiResponse(value: unknown): value is ApiResponse<unknown> {
  if (!value || typeof value !== 'object') {
    return false;
  }

  const response = value as Record<string, unknown>;
  return typeof response.success === 'boolean' && typeof response.message === 'string';
}

function isCheckLoginIdResponse(value: unknown): value is CheckLoginIdResponse {
  if (!value || typeof value !== 'object') {
    return false;
  }

  const response = value as Record<string, unknown>;
  return typeof response.available === 'boolean' && typeof response.message === 'string';
}

async function request<TData>(path: string, init?: RequestInit): Promise<ApiResponse<TData>> {
  let response: Response;

  try {
    response = await fetch(`${getApiBaseUrl()}${path}`, {
      ...init,
      headers: {
        Accept: 'application/json',
        ...init?.headers,
      },
    });
  } catch (error) {
    if (error instanceof AuthApiError) {
      throw error;
    }

    throw new AuthApiError(NETWORK_ERROR_MESSAGE);
  }

  let body: unknown;

  try {
    body = await response.json();
  } catch {
    throw new AuthApiError(INVALID_RESPONSE_MESSAGE, response.status);
  }

  if (!isApiResponse(body)) {
    throw new AuthApiError(INVALID_RESPONSE_MESSAGE, response.status);
  }

  if (!response.ok || !body.success) {
    throw new AuthApiError(body.message || INVALID_RESPONSE_MESSAGE, response.status);
  }

  return body as ApiResponse<TData>;
}

export function checkLoginId(loginId: string) {
  return requestCheckLoginId(`/api/auth/check_id?login_id=${encodeURIComponent(loginId)}`);
}

async function requestCheckLoginId(path: string): Promise<CheckLoginIdResponse> {
  let response: Response;

  try {
    response = await fetch(`${getApiBaseUrl()}${path}`, {
      headers: { Accept: 'application/json' },
    });
  } catch (error) {
    if (error instanceof AuthApiError) {
      throw error;
    }

    throw new AuthApiError(NETWORK_ERROR_MESSAGE);
  }

  let body: unknown;

  try {
    body = await response.json();
  } catch {
    throw new AuthApiError(INVALID_RESPONSE_MESSAGE, response.status);
  }

  if (!isCheckLoginIdResponse(body)) {
    throw new AuthApiError(INVALID_RESPONSE_MESSAGE, response.status);
  }

  if (!response.ok) {
    throw new AuthApiError(body.message || INVALID_RESPONSE_MESSAGE, response.status);
  }

  return body;
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

/**
 * 프로필 설정 여부를 조회한다.
 *
 * - `true`: 설정 완료
 * - `false`: 미설정 (프로필 없음(404) 또는 요약이 비어 있음)
 * - `null`: 판단 불가 (인증 실패·서버 오류·네트워크 오류·응답 형식 불일치)
 *
 * 호출부가 라우팅 분기에만 쓰므로 예외를 던지지 않는다.
 */
export async function fetchHasProfile(): Promise<boolean | null> {
  let response: Response;

  try {
    response = await fetch(`${getApiBaseUrl()}${PROFILE_PATH}`, {
      headers: { Accept: 'application/json' },
      // 인증 방식이 확정되지 않아 세션 쿠키를 가정한다. 토큰 방식이 되면 여기와 request()를 함께 수정한다.
      credentials: 'include',
    });
  } catch {
    return null;
  }

  if (response.status === 404) {
    return false;
  }

  if (!response.ok) {
    return null;
  }

  let body: unknown;

  try {
    body = await response.json();
  } catch {
    return null;
  }

  if (!body || typeof body !== 'object') {
    return null;
  }

  const { profileSummary } = body as ProfileResponse;

  return typeof profileSummary === 'string' && profileSummary.trim().length > 0;
}
