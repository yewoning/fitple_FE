import { getDemoTodayTasks } from '@/mocks/demo-store';
import { requestRaw } from '@/services/api-client';
import { withDemoFallback } from '@/services/demo-fallback';
import { resolveDDay } from '@/services/project';
import type { ProjectCardData } from '@/types/project';
import type { TodayTaskListItem } from '@/types/task';

/**
 * GET /api/tasks/today?memberId= — 홈 화면 '오늘의 과제'.
 * 서버가 마감 미경과 과제만 D-day 임박순으로 내려주므로 화면에서 다시 정렬하지 않는다.
 *
 * ⚠️ src/api/chat.ts에도 동명의 `getTodayTasks(projectId)`가 있다. 그쪽은 채팅방(프로젝트)별
 * 과제 목록이라 역할이 다르다. import 경로를 확인할 것.
 */
export function getTodayTasks(memberId: number) {
  return withDemoFallback(
    () => requestRaw<TodayTaskListItem[]>(`/api/tasks/today?memberId=${memberId}`),
    getDemoTodayTasks,
  );
}

/** 과제 응답을 홈 카드 모양으로 변환한다. 서버 dday가 없으면 카드가 dueDate로 직접 계산한다. */
export function toTodayTaskCardData(item: TodayTaskListItem): ProjectCardData {
  return {
    // key는 과제 단위, 이동 대상은 과제가 속한 프로젝트다. 소속을 모르면 누를 수 없게 둔다.
    id: String(item.taskId),
    linkId: item.projectId > 0 ? String(item.projectId) : undefined,
    projectName: item.projectName,
    status: item.status === 'DONE' ? 'completed' : 'in-progress',
    subInfo: item.title,
    deadline: item.dueDate,
    dDay: resolveDDay(item),
  };
}
