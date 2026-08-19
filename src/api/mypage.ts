// ⚠️ 마이페이지 화면들은 대부분 "로그인한 나"의 memberId가 있어야 부를 수 있는 API인데,
// 로그인(signin) 응답에 memberId가 안 내려와서(auth-store.ts 참고) 지금은 부를 방법이 없습니다.
// 백엔드팀에 signin 응답에도 memberId를 추가해달라고 요청한 뒤 아래를 실제 호출로 바꿔주세요.
//   - getScraps      → GET /api/mypage/scraps?memberId=
//   - getResumeVersions → GET /api/users/me/introductions?memberId= (AI 자소서/소개글 목록으로 추정)
//   - getApplications → ⚠️ 스펙에 "내가 지원한 목록" 조회 API 자체가 없음(있는 건 프로젝트 주인이
//     지원자를 보는 GET /api/projects/{projectId}/applications 뿐). 백엔드팀 확인 필요.
//
// getMyTodayTasks는 예외적으로 memberId 없이도 연동 가능해서 실제 데이터를 씁니다. (아래 참고)
import { getAllMyTodayTasks } from './chat';
import { mockDelay, USE_REAL_API_FOR_READY_ENDPOINTS } from './client';
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

// ✅ 실제 연동: 채팅방 '오늘의 과제'와 항상 같은 데이터를 보여주기 위해 여기서도 실제 API를 씁니다.
// (GET /api/projects/my + 프로젝트별 GET /api/tasks/chat/rooms/{projectId}/tasks 를 합친 것 —
// chat.ts의 getAllMyTodayTasks 참고) /api/projects/my가 아직 로그인 사용자를 제대로 구분하지
// 못하는 경우를 대비해, 실패하면 mock으로 조용히 대체합니다.
export async function getMyTodayTasks() {
  if (!USE_REAL_API_FOR_READY_ENDPOINTS) {
    return mockDelay({ tasks: mockTodayTasks });
  }
  try {
    const tasks = await getAllMyTodayTasks();
    return { tasks };
  } catch {
    return mockDelay({ tasks: mockTodayTasks });
  }
}
