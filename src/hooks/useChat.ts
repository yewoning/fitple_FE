import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useCallback } from 'react';

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
import type { ChatMessage, ChatProjectSummary, TaskStatus } from '@/types';
import { useAuthStore } from '@/store/auth-store';

export const chatKeys = {
  projects: ['chat', 'projects'] as const,
  room: (projectId: number) => ['chat', 'room', projectId] as const,
  // ⚠️ 메시지는 projectId가 아니라 서버가 준 roomId 기준으로 캐싱합니다.
  messages: (roomId: number) => ['chat', 'messages', roomId] as const,
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

// 실시간 갱신은 WebSocket이 아니라 REST 폴링입니다. 채팅방 화면이 떠 있는 동안만
// 2초마다 최근 메시지를 다시 받아서 다른 사람이 보낸 메시지를 반영합니다.
export const CHAT_POLL_INTERVAL_MS = 2000;
// 화면에 표시할 최근 메시지 상한입니다.
// 서버의 size 파라미터가 고장나 있어서(api/chat.ts getMessages 주석 참고) 전체를 받아온 뒤
// 클라이언트에서 자릅니다. 서버 요청 크기가 아니라 "표시 개수"라는 점에 주의하세요.
export const CHAT_MESSAGE_DISPLAY_LIMIT = 30;

// 전송 중인 임시 메시지 / 핏봇 안내처럼 서버에 없는 메시지에 쓰는 로컬 ID입니다.
// 서버 messageId(양수)와 절대 겹치지 않도록 음수만 발급합니다.
let localMessageIdSeq = 0;
export function createLocalMessageId() {
  localMessageIdSeq -= 1;
  return localMessageIdSeq;
}

export function useChatRoomQuery(projectId: number) {
  return useQuery({
    queryKey: chatKeys.room(projectId),
    queryFn: () => enterChatRoom(projectId),
    enabled: Number.isFinite(projectId),
  });
}

// 채팅 목록 API가 방 이름/아이콘/인원수를 가진 유일한 소스라서,
// 방 조회 응답({ roomId, projectId })에 없는 표시용 정보는 여기서 찾아 씁니다.
export function useChatProjectSummary(projectId: number): ChatProjectSummary | null {
  const { data } = useChatProjectsQuery();
  const projects: ChatProjectSummary[] = data?.projects ?? [];
  return projects.find((project) => project.projectId === projectId) ?? null;
}

// 서버 응답 + 낙관적 임시 메시지를 화면에 뿌릴 수 있는 형태로 정리합니다.
// 폴링 때문에 같은 메시지가 여러 번 들어올 수 있어서 ID 기준으로 중복을 제거하고,
// isMe는 서버가 주지 않으므로 로그인 memberId와 비교해서 여기서 계산합니다.
function normalizeMessages(messages: ChatMessage[], memberId: number | null): ChatMessage[] {
  const byId = new Map<number, ChatMessage>();
  for (const message of messages ?? []) {
    if (message?.messageId == null) continue;
    byId.set(message.messageId, message);
  }

  return Array.from(byId.values())
    .map((message) => ({
      ...message,
      isMe: message.isBot ? false : memberId != null && message.senderId === memberId,
    }))
    .sort((a, b) => {
      const at = new Date(a.sentAt).getTime() || 0;
      const bt = new Date(b.sentAt).getTime() || 0;
      if (at !== bt) return at - bt;
      return a.messageId - b.messageId;
    })
    // 정렬한 "다음에" 잘라야 최근 메시지가 남습니다.
    // (서버 정렬 순서를 믿고 자르면 오래된 쪽만 남을 수 있음)
    .slice(-CHAT_MESSAGE_DISPLAY_LIMIT);
}

/**
 * 채팅방 메시지 조회 + 폴링.
 * roomId(방 조회 완료)와 memberId(로그인)가 준비되기 전에는 요청하지 않습니다.
 * isActive가 false면(화면을 벗어남/전송 중) 폴링을 멈춥니다. 앱이 백그라운드로 내려간 경우는
 * app/_layout.tsx에서 AppState를 focusManager에 연결해둬서 React Query가 알아서 멈춥니다.
 */
export function useChatMessagesQuery(
  roomId: number | null | undefined,
  memberId: number | null,
  isActive = true
) {
  const select = useCallback(
    (data: ChatMessage[]) => normalizeMessages(data, memberId),
    [memberId]
  );

  return useQuery({
    queryKey: chatKeys.messages(roomId ?? 0),
    queryFn: () => getMessages(roomId as number),
    enabled: roomId != null && memberId != null,
    select,
    refetchInterval: isActive ? CHAT_POLL_INTERVAL_MS : false,
    refetchIntervalInBackground: false,
    // 방을 나갔다 다시 들어오면(=화면 재마운트) 캐시부터 보여주되 곧바로 서버 최신 내역을 받습니다.
    refetchOnMount: 'always',
    refetchOnWindowFocus: 'always',
  });
}

/**
 * 메시지 전송.
 * 보내는 즉시 임시 메시지를 캐시에 넣어 화면에 띄우고(낙관적 업데이트),
 * 성공하면 서버가 준 실제 메시지로 교체, 실패하면 이전 캐시로 되돌립니다.
 */
export function useSendMessageMutation(roomId: number | null | undefined, memberId: number | null) {
  const queryClient = useQueryClient();
  const messagesKey = chatKeys.messages(roomId ?? 0);

  return useMutation({
    mutationFn: ({ content }: { content: string; tempId: number }) => {
      if (roomId == null || memberId == null) {
        throw new Error('채팅방 정보를 불러오는 중이에요. 잠시 후 다시 시도해 주세요.');
      }
      return sendMessage(roomId, memberId, content);
    },
    onMutate: async ({ content, tempId }) => {
      // 진행 중인 폴링이 임시 메시지를 덮어쓰지 않도록 먼저 취소합니다.
      await queryClient.cancelQueries({ queryKey: messagesKey });
      const previous = queryClient.getQueryData<ChatMessage[]>(messagesKey);

      const optimistic: ChatMessage = {
        messageId: tempId,
        senderId: memberId ?? 0,
        senderName: '',
        profileImageUrl: null,
        content,
        originalLanguage: 'ko',
        translatedContent: null,
        sentAt: new Date().toISOString(),
      };
      queryClient.setQueryData<ChatMessage[]>(messagesKey, (old) => [...(old ?? []), optimistic]);

      return { previous };
    },
    onSuccess: (saved, { tempId }) => {
      queryClient.setQueryData<ChatMessage[]>(messagesKey, (old) => {
        const list = old ?? [];
        // 서버가 messageId를 안 주면 교체할 방법이 없으니 임시 메시지만 지우고
        // 아래 invalidate로 받아오는 서버 목록에 맡깁니다.
        if (!saved?.messageId) return list.filter((message) => message.messageId !== tempId);
        return list.map((message) => (message.messageId === tempId ? saved : message));
      });
    },
    onError: (_error, { tempId }, context) => {
      if (context?.previous) {
        queryClient.setQueryData(messagesKey, context.previous);
        return;
      }
      queryClient.setQueryData<ChatMessage[]>(messagesKey, (old) =>
        (old ?? []).filter((message) => message.messageId !== tempId)
      );
    },
    onSettled: () => {
      if (roomId == null) return;
      queryClient.invalidateQueries({ queryKey: messagesKey });
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
