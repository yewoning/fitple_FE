import type {
  ApiResponse,
  CheckLoginIdResponse,
  SigninRequest,
  SignupRequest,
} from '@/types/auth';

const NETWORK_ERROR_MESSAGE = '서버에 연결하지 못했습니다. 잠시 후 다시 시도해주세요.';
const INVALID_RESPONSE_MESSAGE = '서버 응답을 확인할 수 없습니다. 잠시 후 다시 시도해주세요.';

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
