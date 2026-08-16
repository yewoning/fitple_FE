import axios from 'axios';

// 실제 백엔드가 준비되면 이 값을 채워주세요. (예: https://api.fitple.com)
export const API_BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL || 'http://localhost:8080';

// 화면 대부분이 아직 백엔드 API 없이 목업으로 동작합니다.
// API_SPEC 참고해서 준비되는 API부터 하나씩 false로 전환하세요.
export const USE_MOCK = true;

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    const message =
      error?.response?.data?.message || error?.message || '알 수 없는 오류가 발생했습니다.';
    return Promise.reject(new Error(message));
  }
);

// 개발 중 네트워크 흉내를 위한 지연 함수 (mock 응답에 사용)
export function mockDelay<T>(data: T, ms = 400): Promise<T> {
  return new Promise((resolve) => setTimeout(() => resolve(data), ms));
}
