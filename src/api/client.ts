import axios from 'axios';

// ⚠️ Cloudflare Quick Tunnel 주소라서 백엔드 서버를 재시작하면 URL이 바뀝니다.
// 스웨거에서 새 주소를 받으면 여기 기본값을 바꾸거나, .env에 EXPO_PUBLIC_API_BASE_URL로 넣어주세요.
export const API_BASE_URL =
  process.env.EXPO_PUBLIC_API_BASE_URL || 'https://appropriations-server-seattle-order.trycloudflare.com';

// 화면 대부분이 아직 백엔드 API 없이 목업으로 동작합니다.
// API_SPEC 참고해서 준비되는 API부터 하나씩 false로 전환하세요.
export const USE_MOCK = true;

// ✅ 실제 스펙과 응답 형태까지 맞아서 연동을 끝낸 API들만 켜는 스위치입니다.
// (팀원 목록 / 로드맵 조회·AI생성 / 프로젝트 오늘의 과제 조회·AI생성)
// 로그인 후 memberId를 못 받아오는 문제 때문에 마이페이지·지원현황·채팅 전송·회의록은
// 아직 이 스위치와 무관하게 mock으로 고정되어 있습니다. src/api/chat.ts, mypage.ts 주석 참고.
export const USE_REAL_API_FOR_READY_ENDPOINTS = true;

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
