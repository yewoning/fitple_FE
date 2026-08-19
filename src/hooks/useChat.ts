import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import {
  createMeetingMinute,
  createTodayTasks,
  enterChatRoom,
  generateRoadmap,
  getChatProjects,
  getMeetingMinuteDetail,
  getMeetingMinutes,
  getMessages,
  getRoadmap,
  getTeamMembers,
  getTodayTasks,
  sendMessage,
  updateTaskStatus,
} from '@/api/chat';
import type { TaskStatus } from '@/types';
import { useAuthStore } from '@/store/auth-store';

export const chatKeys = {
  projects: ['chat', 'projects'] as const,
  room: (projectId: number) => ['chat', 'room', projectId] as const,
  messages: (projectId: number) => ['chat', 'messages', projectId] as const,
  meetingMinutes: (projectId: number) => ['chat', 'meeting-minutes', projectId] as const,
  meetingMinuteDetail: (projectId: number, meetingMinuteId: number) =>
    ['chat', 'meeting-minutes', projectId, meetingMinuteId] as const,
  tasks: (projectId: number) => ['chat', 'tasks', projectId] as const,
  members: (projectId: number) => ['chat', 'members', projectId] as const,
  roadmap: (projectId: number) => ['chat', 'roadmap', projectId] as const,
};

// memberId는 로그인할 때 store에 저장됩니다(로그인 응답에 이제 memberId가 옵니다).
// 아직 로그인 전(memberId가 없음)이면 API를 부르지 않고 로딩 상태로만 둡니다.
export function useChatProjectsQuery() {
  const memberId = useAuthStore((state) => state.memberId);
  return useQuery({
    queryKey: [...chatKeys.projects, memberId],
    queryFn: () => getChatProjects(memberId),
    enabled: memberId != null,
  });
}

export function useChatRoomQuery(projectId: number) {
  return useQuery({
    queryKey: chatKeys.room(projectId),
    queryFn: () => enterChatRoom(projectId),
  });
}

export function useChatMessagesQuery(projectId: number) {
  return useQuery({
    queryKey: chatKeys.messages(projectId),
    queryFn: () => getMessages(projectId),
  });
}

export function useSendMessageMutation(projectId: number) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (content: string) => sendMessage(projectId, projectId, content),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: chatKeys.messages(projectId) });
    },
  });
}

export function useCreateMeetingMinuteMutation(projectId: number) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => createMeetingMinute(projectId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: chatKeys.meetingMinutes(projectId) });
    },
  });
}

export function useCreateTodayTasksMutation(projectId: number) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => createTodayTasks(projectId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: chatKeys.tasks(projectId) });
    },
  });
}

export function useMeetingMinutesQuery(projectId: number) {
  return useQuery({
    queryKey: chatKeys.meetingMinutes(projectId),
    queryFn: () => getMeetingMinutes(projectId),
  });
}

export function useMeetingMinuteDetailQuery(projectId: number, meetingMinuteId: number) {
  return useQuery({
    queryKey: chatKeys.meetingMinuteDetail(projectId, meetingMinuteId),
    queryFn: () => getMeetingMinuteDetail(projectId, meetingMinuteId),
  });
}

export function useTodayTasksQuery(projectId: number, status: 'ALL' | 'TODO' | 'DONE' = 'ALL') {
  return useQuery({
    queryKey: [...chatKeys.tasks(projectId), status],
    queryFn: () => getTodayTasks(projectId, status),
  });
}

export function useUpdateTaskStatusMutation(projectId: number) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ taskId, status }: { taskId: number; status: TaskStatus }) =>
      updateTaskStatus(projectId, taskId, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: chatKeys.tasks(projectId) });
    },
  });
}

export function useTeamMembersQuery(projectId: number) {
  return useQuery({
    queryKey: chatKeys.members(projectId),
    queryFn: () => getTeamMembers(projectId),
  });
}

export function useRoadmapQuery(projectId: number) {
  return useQuery({
    queryKey: chatKeys.roadmap(projectId),
    queryFn: () => getRoadmap(projectId),
  });
}

export function useGenerateRoadmapMutation(projectId: number) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => generateRoadmap(projectId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: chatKeys.roadmap(projectId) });
    },
  });
}
