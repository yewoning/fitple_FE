import { MOCK_RECRUITING_PROJECTS } from '@/components/projects-screen.mock';
import type { ProjectDetailResponse } from '@/types/project';

// 프로젝트 상세 조회(1-6) API 연동 실패 시 표시할 폴백 데이터.
export function createMockProjectDetail(projectId?: string): ProjectDetailResponse {
  const listItem = MOCK_RECRUITING_PROJECTS.find((item) => item.id === projectId);

  const title = listItem?.projectName ?? '교내 플리마켓 운영 기획';
  const roles = listItem?.subInfo ? listItem.subInfo.split(' · ') : ['발표', 'PPT', '디자인'];

  return {
    projectId: Number(projectId) || 1,
    title,
    introText: `${title}에 관심 있는 팀원을 모집하고 있어요. 함께 기획부터 실행까지 즐겁게 진행해요.`,
    recruitCount: 4,
    roles,
    periodEnd: '2026-09-30',
    meetingSchedule: '주 1회 오프라인',
    deadline: '2026-09-06',
    dDay: listItem?.dDay ?? 18,
    status: 'RECRUITING',
    imageUrl: null,
    memberId: 1,
    memberName: '민지',
  };
}
