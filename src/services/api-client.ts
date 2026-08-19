import type { ApiResponse } from '@/types/api';

const NETWORK_ERROR_MESSAGE = '서버에 연결하지 못했습니다. 잠시 후 다시 시도해주세요.';
const INVALID_RESPONSE_MESSAGE = '서버 응답을 확인할 수 없습니다. 잠시 후 다시 시도해주세요.';

export class ApiError extends Error {
  constructor(
    message: string,
    readonly status?: number,
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

function getApiBaseUrl() {
  const baseUrl = process.env.EXPO_PUBLIC_API_BASE_URL?.trim();

  if (!baseUrl) {
    throw new ApiError(
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

async function fetchJson(path: string, init?: RequestInit): Promise<{ response: Response; body: unknown }> {
  let response: Response;

  try {
    response = await fetch(`${getApiBaseUrl()}${path}`, {
      ...init,
      credentials: 'include',
      headers: {
        Accept: 'application/json',
        ...init?.headers,
      },
    });
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }

    throw new ApiError(NETWORK_ERROR_MESSAGE);
  }

  let body: unknown;

  try {
    body = await response.json();
  } catch {
    throw new ApiError(INVALID_RESPONSE_MESSAGE, response.status);
  }

  return { response, body };
}

/**
 * For endpoints that wrap responses as { success, message, data }.
 */
export async function request<TData>(path: string, init?: RequestInit): Promise<ApiResponse<TData>> {
  const { response, body } = await fetchJson(path, init);

  if (!isApiResponse(body)) {
    throw new ApiError(INVALID_RESPONSE_MESSAGE, response.status);
  }

  if (!response.ok || !body.success) {
    throw new ApiError(body.message || INVALID_RESPONSE_MESSAGE, response.status);
  }

  return body as ApiResponse<TData>;
}

/**
 * For endpoints that return the raw JSON body directly (no success/message/data wrapper).
 */
export async function requestRaw<TData>(path: string, init?: RequestInit): Promise<TData> {
  const { response, body } = await fetchJson(path, init);

  if (!response.ok) {
    const message = isApiResponse(body) ? body.message : undefined;
    throw new ApiError(message || INVALID_RESPONSE_MESSAGE, response.status);
  }

  return body as TData;
}
