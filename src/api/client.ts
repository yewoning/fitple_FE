import { AxiosError, create } from 'axios';

import { ApiError } from '@/services/api-client';

// ⚠️ Cloudflare Quick Tunnel 주소라서 백엔드 서버를 재시작하면 URL이 바뀝니다.
// 스웨거에서 새 주소를 받으면 여기 기본값을 바꾸거나, .env에 EXPO_PUBLIC_API_BASE_URL로 넣어주세요.
export const API_BASE_URL =
  process.env.EXPO_PUBLIC_API_BASE_URL || 'https://appropriations-server-seattle-order.trycloudflare.com';

export const apiClient = create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

apiClient.interceptors.response.use(
  (response) => response,
  (error: AxiosError<{ message?: string }>) => {
    const message =
      error?.response?.data?.message || error?.message || '알 수 없는 오류가 발생했습니다.';
    return Promise.reject(new ApiError(message, error.response?.status));
  }
);

// 개발 중 네트워크 흉내를 위한 지연 함수 (mock 응답에 사용)
export function mockDelay<T>(data: T, ms = 400): Promise<T> {
  return new Promise((resolve) => setTimeout(() => resolve(data), ms));
}
