// ⚠️ 마이페이지 관련 API는 API 명세서에 항목이 없어 전부 Mock으로만 구현되어 있습니다.
// 백엔드 API가 준비되면 이 파일에 실제 axios 호출을 추가해주세요.
import { mockDelay } from './client';
import { mockApplications, mockResumeVersions, mockScraps, mockTodayTasks } from './mockData';

export async function getScraps() {
  return mockDelay({ scraps: mockScraps });
}

export async function getApplications() {
  return mockDelay({ applications: mockApplications });
}

export async function getResumeVersions() {
  return mockDelay({ resumes: mockResumeVersions });
}

export async function getMyTodayTasks() {
  return mockDelay({ tasks: mockTodayTasks });
}
