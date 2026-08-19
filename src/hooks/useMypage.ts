import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { updateTaskStatus } from '@/api/chat';
import { getApplications, getMyTodayTasks, getResumeVersions, getScraps } from '@/api/mypage';
import { getProfile } from '@/api/profile';
import type { TaskStatus } from '@/types';
import { chatKeys } from './useChat';

export const mypageKeys = {
  profile: ['mypage', 'profile'] as const,
  scraps: ['mypage', 'scraps'] as const,
  applications: ['mypage', 'applications'] as const,
  resumes: ['mypage', 'resumes'] as const,
  tasks: ['mypage', 'tasks'] as const,
};

export function useProfileQuery() {
  return useQuery({
    queryKey: mypageKeys.profile,
    queryFn: getProfile,
  });
}

export function useScrapsQuery() {
  return useQuery({
    queryKey: mypageKeys.scraps,
    queryFn: getScraps,
  });
}

export function useApplicationsQuery() {
  return useQuery({
    queryKey: mypageKeys.applications,
    queryFn: getApplications,
  });
}

export function useResumeVersionsQuery() {
  return useQuery({
    queryKey: mypageKeys.resumes,
    queryFn: getResumeVersions,
  });
}

export function useMyTodayTasksQuery() {
  return useQuery({
    queryKey: mypageKeys.tasks,
    queryFn: getMyTodayTasks,
  });
}

// 마이페이지 '오늘의 과제'에서 체크박스를 누를 때 쓰는 훅.
// getMyTodayTasks가 여러 프로젝트를 모아온 결과라 taskId마다 속한 projectId가 다를 수 있어서,
// 채팅방 쪽 useUpdateTaskStatusMutation과 달리 projectId를 매번 인자로 받습니다.
// 저장 성공 시 마이페이지 목록뿐 아니라 해당 프로젝트의 채팅방 '오늘의 과제' 캐시도 같이
// 갱신해서, 두 화면이 항상 같은 데이터를 보여주도록 합니다.
export function useUpdateMyTaskStatusMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      projectId,
      taskId,
      status,
    }: {
      projectId: number;
      taskId: number;
      status: TaskStatus;
    }) => updateTaskStatus(projectId, taskId, status),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: mypageKeys.tasks });
      queryClient.invalidateQueries({ queryKey: chatKeys.tasks(variables.projectId) });
    },
  });
}
