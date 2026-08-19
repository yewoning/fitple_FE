import { DATA_MODE } from '@/config/demo';
import { ApiError } from '@/services/api-client';

type AsyncValue<T> = T | Promise<T>;

function canUseDemoFallback(error: unknown) {
  return error instanceof ApiError && (error.status === undefined || error.status >= 500);
}

/**
 * API 호출과 데모 목업을 동일한 서비스 경계에서 선택한다.
 * 사용자 입력/권한 문제인 4xx 응답은 성공 목업으로 숨기지 않는다.
 */
export async function withDemoFallback<T>(
  apiRequest: () => Promise<T>,
  demoRequest: () => AsyncValue<T>,
): Promise<T> {
  if (DATA_MODE === 'mock-only') {
    return demoRequest();
  }

  try {
    return await apiRequest();
  } catch (error) {
    if (DATA_MODE === 'api-first' && canUseDemoFallback(error)) {
      return demoRequest();
    }

    throw error;
  }
}
