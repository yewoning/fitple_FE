// ⚠️ 아래 2개 기능은 현재 백엔드 계약이 없거나 응답 형태가 화면과 안 맞아서 의도적으로
// mock-only 상태입니다. 계약이 확정되면 withDemoFallback으로 전환하세요.
//   - getResumeVersions → GET /api/users/me/introductions?memberId= (AI 자소서/소개글 목록으로 추정)
//   - getApplications → ⚠️ 스펙에 "내가 지원한 목록" 조회 API 자체가 없음(있는 건 프로젝트 주인이
//     지원자를 보는 GET /api/projects/{projectId}/applications 뿐). 백엔드팀 확인 필요.
//
// getMyTodayTasks는 예외적으로 memberId 없이도 연동 가능해서 실제 데이터를 씁니다. (아래 참고)
// getScraps는 실제 스크랩 API를 씁니다. 응답 필드가 api.json 문서/다른 목록 API들과
// 이름이 달라서(services/project.ts의 ScrapProjectItem, toScrapCardData 주석 참고)
// 전용 변환 함수를 씁니다.
import { getAllMyTodayTasks } from './chat';
import { withDemoFallback } from '@/services/demo-fallback';
import { getScraps as getScrapsFromApi, toScrapCardData } from '@/services/project';

import { mockDelay } from './client';
import { mockApplications, mockResumeVersions, mockTodayTasks } from './mockData';

// ✅ 실제 연동: GET /api/mypage/scraps?memberId=
export async function getScraps(memberId: number | null) {
  if (memberId == null) {
    // 로그인 전에는 부를 수 없으니 빈 목록으로 둡니다.
    return { scraps: [] };
  }
  const items = await getScrapsFromApi(memberId);
  return { scraps: items.map(toScrapCardData) };
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
