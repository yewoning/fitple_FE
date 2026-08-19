import type { MeetingMinuteDetail } from '@/types';
import { apiClient, mockDelay, USE_MOCK } from './client';
import {
  mockChatProjects,
  mockChatRoom,
  mockMeetingMinuteDetail,
  mockMeetingMinutes,
  mockMessages,
  mockRoadmap,
  mockTeamMembers,
  mockTodayTasks,
} from './mockData';

export async function getChatProjects() {
  if (USE_MOCK) {
    return mockDelay({ projects: mockChatProjects });
  }
  const { data } = await apiClient.get('/api/chat/projects');
  return data;
}

export async function enterChatRoom(projectId: number) {
  if (USE_MOCK) {
    return mockDelay(mockChatRoom(projectId));
  }
  const { data } = await apiClient.get(`/api/chat/rooms/${projectId}`);
  return data;
}

export async function getMessages(roomId: number, cursor?: number, size = 30) {
  if (USE_MOCK) {
    return mockDelay({ messages: mockMessages, nextCursor: null, hasNext: false });
  }
  const { data } = await apiClient.get(`/api/chat/rooms/${roomId}/messages`, { params: { size, cursor } });
  return data;
}

export async function sendMessage(roomId: number, projectId: number, content: string) {
  if (USE_MOCK) {
    return mockDelay({
      messageId: Date.now(),
      senderId: 1,
      senderName: '김지수',
      content,
      originalLanguage: 'ko',
      translatedContent: null,
      sentAt: new Date().toISOString(),
      isMe: true,
    });
  }
  const { data } = await apiClient.post(`/api/chat/rooms/${roomId}/messages`, { content, projectId });
  return data;
}

export async function uploadChatFile(projectId: number, file: { uri: string; name: string; type: string }) {
  if (USE_MOCK) {
    return mockDelay({
      fileId: Date.now(),
      fileName: file.name,
      fileUrl: file.uri,
      fileType: file.type,
      uploadedBy: 1,
      uploadedAt: new Date().toISOString(),
    });
  }
  const form = new FormData();
  // @ts-ignore
  form.append('file', file);
  const { data } = await apiClient.post(`/api/chat/rooms/${projectId}/files`, form, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return data;
}

export async function createMeetingMinute(projectId: number): Promise<MeetingMinuteDetail> {
  if (USE_MOCK) {
    return mockDelay(mockMeetingMinuteDetail(mockMeetingMinutes.length + 1));
  }
  const { data } = await apiClient.post(`/api/chat/rooms/${projectId}/meeting-minutes`);
  return data;
}

export async function getMeetingMinutes(projectId: number) {
  if (USE_MOCK) {
    return mockDelay({ meetingMinutes: mockMeetingMinutes });
  }
  const { data } = await apiClient.get(`/api/chat/rooms/${projectId}/meeting-minutes`);
  return data;
}

// ⚠️ Notion 문서에 정확한 경로가 명시되지 않아 REST 관례로 추정 구현
export async function getMeetingMinuteDetail(
  projectId: number,
  meetingMinuteId: number
): Promise<MeetingMinuteDetail> {
  if (USE_MOCK) {
    return mockDelay(mockMeetingMinuteDetail(meetingMinuteId));
  }
  const { data } = await apiClient.get(`/api/chat/rooms/${projectId}/meeting-minutes/${meetingMinuteId}`);
  return data;
}

// ⚠️ Notion 문서에 정확한 경로가 명시되지 않아 REST 관례로 추정 구현
export async function createTodayTasks(projectId: number) {
  if (USE_MOCK) {
    return mockDelay({ tasks: mockTodayTasks });
  }
  const { data } = await apiClient.post(`/api/chat/rooms/${projectId}/tasks`);
  return data;
}

export async function getTodayTasks(projectId: number, status: 'ALL' | 'TODO' | 'DONE' = 'ALL') {
  if (USE_MOCK) {
    const tasks =
      status === 'ALL' ? mockTodayTasks : mockTodayTasks.filter((t) => t.status === status);
    return mockDelay({ tasks });
  }
  const { data } = await apiClient.get(`/api/chat/rooms/${projectId}/tasks`, { params: { status } });
  return data;
}

export async function getTeamMembers(projectId: number) {
  if (USE_MOCK) {
    return mockDelay({ members: mockTeamMembers });
  }
  const { data } = await apiClient.get(`/api/chat/rooms/${projectId}/members`);
  return data;
}

// ⚠️ Notion 문서에 정확한 경로가 명시되지 않아 REST 관례로 추정 구현
export async function getRoadmap(projectId: number) {
  if (USE_MOCK) {
    return mockDelay({ phases: mockRoadmap });
  }
  const { data } = await apiClient.get(`/api/chat/rooms/${projectId}/roadmap`);
  return data;
}
