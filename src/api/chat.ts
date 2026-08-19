import type { MeetingMinuteDetail, RoadmapPhase, TeamMember, TodayTask } from '@/types';
import { apiClient, mockDelay, USE_MOCK, USE_REAL_API_FOR_READY_ENDPOINTS } from './client';
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

// 실제 스펙(RoadmapStageResponse)의 배열을 프론트 RoadmapPhase 모양으로 변환합니다.
function mapRoadmapStages(steps: any[]): RoadmapPhase[] {
  return (steps ?? []).map((s) => ({
    phaseId: s.stageId,
    order: s.stageNumber,
    title: s.title,
    assignee: (s.assignees ?? []).map((a: any) => a.name).join(', ') || '미배정',
    description: s.description ?? '',
    dueDate: s.endDate,
    deadline: s.endDate,
  }));
}

// 실제 스펙(TaskResponse)의 배열을 프론트 TodayTask 모양으로 변환합니다.
// ⚠️ 실제 API는 담당자를 assigneeId(숫자)로만 주고 이름은 안 줘서 name은 빈 값으로 둡니다.
// (현재 화면들에서 담당자 이름을 표시하는 곳은 없어서 당장은 문제 없음)
function mapTasks(data: any[]): TodayTask[] {
  return (data ?? []).map((t) => ({
    taskId: t.taskId,
    projectName: t.projectName,
    title: t.title,
    assignee: { memberId: t.assigneeId, name: '' },
    status: t.status,
    dueDate: t.dueDate,
  }));
}

// ⚠️ mock 유지: 실제 API(GET /api/chat/projects)는 memberId가 필수인데 로그인 후
// memberId를 저장할 방법이 없어서 아직 실제 호출로 못 바꿈. (auth-store.ts 참고)
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

// ⚠️ mock 유지: 실제 응답(ChatMessageResponse)엔 senderName/translatedContent/isMe가 없어서
// 팀원목록으로 이름 매칭 + /api/chat/translate 별도 호출로 번역을 붙이는 작업이 더 필요함.
export async function getMessages(roomId: number, cursor?: number, size = 30) {
  if (USE_MOCK) {
    return mockDelay({ messages: mockMessages, nextCursor: null, hasNext: false });
  }
  const { data } = await apiClient.get(`/api/chat/rooms/${roomId}/messages`, { params: { size, cursor } });
  return data;
}

// ⚠️ mock 유지: 실제 API는 전송자 식별용 memberId가 쿼리 파라미터로 필수인데
// 로그인 후 memberId를 못 받아와서(위와 동일한 이유) 아직 실제 호출로 못 바꿈.
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

// ⚠️ mock 유지: 실제 백엔드엔 "회의록 AI 생성" API가 없음. 대화를 보고 자동 요약해주는 게 아니라
// title/content를 프론트가 직접 채워서 POST해야 하는 구조라, 지금 화면 흐름 자체를 백엔드팀과
// 다시 맞춰야 함. content도 문자열 하나뿐이라(주요논의/결정사항/역할 구조 아님) 화면 재설계 필요.
export async function createMeetingMinute(projectId: number): Promise<MeetingMinuteDetail> {
  if (USE_MOCK) {
    return mockDelay(mockMeetingMinuteDetail(mockMeetingMinutes.length + 1));
  }
  const { data } = await apiClient.post(`/api/chat/rooms/${projectId}/meeting-minutes`);
  return data;
}

// ⚠️ mock 유지: 위 createMeetingMinute와 같은 이유로 응답 형태(content가 문자열)가 안 맞음.
export async function getMeetingMinutes(projectId: number) {
  if (USE_MOCK) {
    return mockDelay({ meetingMinutes: mockMeetingMinutes });
  }
  const { data } = await apiClient.get(`/api/chat/rooms/${projectId}/meeting-minutes`);
  return data;
}

// ⚠️ mock 유지: 위와 같은 이유(content 구조 불일치) + Notion 문서에 정확한 경로가
// 명시되지 않아 REST 관례로 추정 구현한 상태
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

// ✅ 실제 연동: POST /api/chat/rooms/{roomId}/tasks/ai-generate (AI가 대화 보고 오늘의 과제 생성)
export async function createTodayTasks(projectId: number) {
  if (!USE_REAL_API_FOR_READY_ENDPOINTS) {
    return mockDelay({ tasks: mockTodayTasks });
  }
  const { data } = await apiClient.post(`/api/chat/rooms/${projectId}/tasks/ai-generate`);
  return { tasks: mapTasks(data) };
}

// ✅ 실제 연동: GET /api/tasks/chat/rooms/{projectId}/tasks (memberId 없이 프로젝트 전체 과제 조회)
export async function getTodayTasks(projectId: number, status: 'ALL' | 'TODO' | 'DONE' = 'ALL') {
  if (!USE_REAL_API_FOR_READY_ENDPOINTS) {
    const tasks =
      status === 'ALL' ? mockTodayTasks : mockTodayTasks.filter((t) => t.status === status);
    return mockDelay({ tasks });
  }
  const { data } = await apiClient.get(`/api/tasks/chat/rooms/${projectId}/tasks`, { params: { status } });
  return { tasks: mapTasks(data) };
}

// ✅ 실제 연동: GET /api/chat/rooms/{projectId}/members
export async function getTeamMembers(projectId: number) {
  if (!USE_REAL_API_FOR_READY_ENDPOINTS) {
    return mockDelay({ members: mockTeamMembers });
  }
  const { data } = await apiClient.get(`/api/chat/rooms/${projectId}/members`);
  const members: TeamMember[] = (data ?? []).map((m: any) => ({
    memberId: m.memberId,
    name: m.name,
    role: m.role,
    description: m.detailRole ?? '',
  }));
  return { members };
}

// ✅ 실제 연동: GET /api/chat/rooms/{projectId}/roadmap
export async function getRoadmap(projectId: number) {
  if (!USE_REAL_API_FOR_READY_ENDPOINTS) {
    return mockDelay({ phases: mockRoadmap });
  }
  const { data } = await apiClient.get(`/api/chat/rooms/${projectId}/roadmap`);
  return { phases: mapRoadmapStages(data?.steps) };
}

// ✅ 실제 연동: POST /api/chat/rooms/{roomId}/roadmap/ai-generate (AI가 대화 보고 로드맵 재생성)
export async function generateRoadmap(projectId: number) {
  if (!USE_REAL_API_FOR_READY_ENDPOINTS) {
    return mockDelay({ phases: mockRoadmap });
  }
  const { data } = await apiClient.post(`/api/chat/rooms/${projectId}/roadmap/ai-generate`);
  return { phases: mapRoadmapStages(data) };
}
