import type { DDayFields } from '@/types/project';

/**
 * GET /api/tasks/today?memberId= (TodayTaskResponse)
 *
 * 홈 화면 전용 계약이다. 마감이 지나지 않은 과제만 D-day 임박순으로 내려온다.
 * 마이페이지가 쓰는 전체 과제 목록(`TodayTask`, @/types)과는 다른 계약이라 재사용하지 않는다.
 * 이 응답에는 담당자 정보가 없다.
 */
export interface TodayTaskListItem extends DDayFields {
  taskId: number;
  projectId: number;
  projectName: string;
  title: string;
  dueDate: string;
  status: string;
}
