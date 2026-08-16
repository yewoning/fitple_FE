import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import {
  createMeetingMinute,
  createTodayTasks,
  enterChatRoom,
  getChatProjects,
  getMeetingMinuteDetail,
  getMeetingMinutes,
  getMessages,
  getTeamMembers,
  getTodayTasks,
  sendMessage,
} from '@/api/chat';

export const chatKeys = {
  projects: ['chat', 'projects'] as const,
  room: (projectId: number) => ['chat', 'room', projectId] as const,
  messages: (projectId: number) => ['chat', 'messages', projectId] as const,
  meetingMinutes: (projectId: number) => ['chat', 'meeting-minutes', projectId] as const,
  meetingMinuteDetail: (projectId: number, meetingMinuteId: number) =>
    ['chat', 'meeting-minutes', projectId, meetingMinuteId] as const,
  tasks: (projectId: number) => ['chat', 'tasks', projectId] as const,
  members: (projectId: number) => ['chat', 'members', projectId] as const,
};

export function useChatProjectsQuery() {
  return useQuery({
    queryKey: chatKeys.projects,
    queryFn: getChatProjects,
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

export function useTeamMembersQuery(projectId: number) {
  return useQuery({
    queryKey: chatKeys.members(projectId),
    queryFn: () => getTeamMembers(projectId),
  });
}
