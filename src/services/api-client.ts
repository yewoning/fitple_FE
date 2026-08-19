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

/**
 * 백엔드 에러 응답은 두 가지 형식이 섞여 있다: 기존 {success,message,data}와
 * 전역 예외 처리기가 내려주는 {status,error,message}. 둘 다 message 필드를
 * 공유하므로 이것만 보고 사람이 읽을 에러 메시지를 뽑아낸다.
 */
function extractErrorMessage(value: unknown): string | undefined {
  if (!value || typeof value !== 'object') {
    return undefined;
  }

  const message = (value as Record<string, unknown>).message;
  return typeof message === 'string' ? message : undefined;
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

  // 응답 본문을 먼저 텍스트로 읽습니다. 스크랩 추가/삭제처럼 성공 시 본문이 아예 없는
  // 엔드포인트도 있는데, 그런 경우 곧바로 response.json()을 부르면 "Unexpected end of
  // JSON input"으로 실패해서 성공한 요청도 에러로 보였습니다(예: 스크랩은 실제로 잘 됐는데
  // 화면엔 "서버 응답을 확인할 수 없습니다"만 뜸). 본문이 비어있으면 body를 undefined로 두고,
  // 진짜 내용이 있는데 JSON이 아닐 때만 파싱 에러로 처리합니다.
  let text: string;

  try {
    text = await response.text();
  } catch {
    throw new ApiError(NETWORK_ERROR_MESSAGE);
  }

  let body: unknown;

  if (text.length > 0) {
    try {
      body = JSON.parse(text);
    } catch {
      throw new ApiError(INVALID_RESPONSE_MESSAGE, response.status);
    }
  }

  return { response, body };
}

/**
 * For endpoints that wrap responses as { success, message, data }.
 */
export async function request<TData>(path: string, init?: RequestInit): Promise<ApiResponse<TData>> {
  const { response, body } = await fetchJson(path, init);

  if (!response.ok || !isApiResponse(body) || !body.success) {
    throw new ApiError(extractErrorMessage(body) || INVALID_RESPONSE_MESSAGE, response.status);
  }

  return body as ApiResponse<TData>;
}

/**
 * For endpoints that return the raw JSON body directly (no success/message/data wrapper).
 */
export async function requestRaw<TData>(path: string, init?: RequestInit): Promise<TData> {
  const { response, body } = await fetchJson(path, init);

  if (!response.ok) {
    throw new ApiError(extractErrorMessage(body) || INVALID_RESPONSE_MESSAGE, response.status);
  }

  return body as TData;
}
