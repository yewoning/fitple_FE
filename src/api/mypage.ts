// ⚠️ 아래 3개 기능은 현재 백엔드 계약이 없거나 응답 형태가 화면과 안 맞아서 의도적으로
// mock-only 상태입니다. 계약이 확정되면 withDemoFallback으로 전환하세요.
//   - getScraps → GET /api/mypage/scraps?memberId= 는 이제 실제로 호출 가능(로그인 응답에
//     memberId가 옴)하지만, 응답이 { projects: ProjectResponse[] }이고 status가 그냥 string이라
//     화면이 기대하는 'recruiting' | 'recruit-closed' 같은 값과 실제로 뭐가 오는지(예: "RECRUITING"?)
//     스펙에 명시가 없습니다. 잘못 매핑하면 필터/뱃지가 다 깨지니, 백엔드팀에 status 값 목록을
//     확인한 뒤 매핑해서 연동하세요.
//   - getResumeVersions → GET /api/users/me/introductions?memberId= (AI 자소서/소개글 목록으로 추정)
//   - getApplications → ⚠️ 스펙에 "내가 지원한 목록" 조회 API 자체가 없음(있는 건 프로젝트 주인이
//     지원자를 보는 GET /api/projects/{projectId}/applications 뿐). 백엔드팀 확인 필요.
//
// getMyTodayTasks는 예외적으로 memberId 없이도 연동 가능해서 실제 데이터를 씁니다. (아래 참고)
import { getAllMyTodayTasks } from './chat';
import { withDemoFallback } from '@/services/demo-fallback';

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

// ✅ 실제 연동: 채팅방 '오늘의 과제'와 항상 같은 데이터를 보여주기 위해 여기서도 실제 API를 씁니다.
// (GET /api/projects/my + 프로젝트별 GET /api/tasks/chat/rooms/{projectId}/tasks 를 합친 것 —
// chat.ts의 getAllMyTodayTasks 참고) /api/projects/my가 아직 로그인 사용자를 제대로 구분하지
// 못하는 경우를 대비해, 실패하면 mock으로 조용히 대체합니다.
export async function getMyTodayTasks() {
  return withDemoFallback(
    async () => ({ tasks: await getAllMyTodayTasks() }),
    () => mockDelay({ tasks: mockTodayTasks })
  );
}
