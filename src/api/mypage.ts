// ⚠️ 마이페이지 화면들은 전부 "로그인한 나"의 memberId가 있어야 부를 수 있는 API인데,
// 로그인(signin) 응답에 memberId가 안 내려와서(auth-store.ts 참고) 지금은 부를 방법이 없습니다.
// 백엔드팀에 signin 응답에도 memberId를 추가해달라고 요청한 뒤 아래를 실제 호출로 바꿔주세요.
//   - getScraps      → GET /api/mypage/scraps?memberId=
//   - getMyTodayTasks → GET /api/tasks?memberId=&status=
//   - getResumeVersions → GET /api/users/me/introductions?memberId= (AI 자소서/소개글 목록으로 추정)
//   - getApplications → ⚠️ 스펙에 "내가 지원한 목록" 조회 API 자체가 없음(있는 건 프로젝트 주인이
//     지원자를 보는 GET /api/projects/{projectId}/applications 뿐). 백엔드팀 확인 필요.
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
