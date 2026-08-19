import type {
  ChatMessage,
  ChatRoom,
  MeetingMinuteDetail,
  RoadmapPhase,
  TeamMember,
  TodayTask,
} from '@/types';
import { withDemoFallback } from '@/services/demo-fallback';

import { apiClient, mockDelay } from './client';
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
    projectId: t.projectId,
    projectName: t.projectName,
    title: t.title,
    assignee: { memberId: t.assigneeId, name: '' },
    status: t.status,
    dueDate: t.dueDate,
  }));
}

// ✅ 실제 연동: GET /api/chat/projects?memberId= (memberId 필수 파라미터라서 안 보내면 500 남)
// ⚠️ 실제 응답은 { projects: [{ projectId, projectIconUrl, title }] } 뿐이라 ChatProjectSummary가
// 화면에 쓰는 projectName/memberCount/lastMessage/lastMessageAt/unreadCount가 없습니다.
// (예전엔 projectName 자리에 title 값이 아예 안 들어가서, 채팅 목록에 이름 없는 빈 아바타만
// 보였습니다.) memberCount/lastMessage/lastMessageAt/unreadCount는 백엔드가 아직 안 주는
// 정보라 임시로 빈 값을 넣어둡니다 — API가 보강되면 여기서 실제 값을 채우면 됩니다.
export async function getChatProjects(memberId: number | null) {
  return withDemoFallback(
    async () => {
      const { data } = await apiClient.get('/api/chat/projects', { params: { memberId } });
      const projects = (data?.projects ?? []).map((p: any) => ({
        projectId: p.projectId,
        projectName: p.title,
        projectIconUrl: p.projectIconUrl,
        memberCount: p.memberCount ?? 0,
        lastMessage: p.lastMessage ?? '',
        lastMessageAt: p.lastMessageAt ?? '',
        unreadCount: p.unreadCount ?? 0,
      }));
      return { projects };
    },
    () => mockDelay({ projects: mockChatProjects })
  );
}

// ✅ 실제 연동: GET /api/chat/rooms/{projectId}
// 응답은 { roomId, projectId } 뿐입니다. 이 roomId가 메시지 조회/전송 경로에 들어가는 값이라,
// 예전처럼 projectId를 그대로 메시지 API에 넣으면 다른 방을 보거나 404가 납니다.
export async function enterChatRoom(projectId: number): Promise<ChatRoom> {
  return withDemoFallback(
    async () => {
      const { data } = await apiClient.get(`/api/chat/rooms/${projectId}`);
      return {
        roomId: data?.roomId ?? projectId,
        projectId: data?.projectId ?? projectId,
      };
    },
    () => mockDelay(mockChatRoom(projectId))
  );
}

// 서버가 주는 메시지 1건의 형태(ChatMessageResponse).
// 화면 모델(ChatMessage)과 이름이 달라서(memberId/createdAt) 여기서 한 번에 번역해줍니다.
interface ChatMessageResponse {
  messageId?: number;
  memberId?: number;
  memberName?: string | null;
  profileImageUrl?: string | null;
  content?: string | null;
  originalLanguage?: string | null;
  translatedContent?: string | null;
  createdAt?: string;
}

// ⚠️ 실제 응답엔 senderName/translatedContent/isMe가 없습니다.
// - senderName: 빈 값으로 두고 화면에서 팀원 목록(getTeamMembers)으로 채웁니다.
// - translatedContent: 번역 API가 아직 없어서 null 고정입니다.
// - isMe: 로그인 memberId와 비교해서 훅(useChat)에서 계산합니다.
function mapChatMessage(raw: ChatMessageResponse & Record<string, any>): ChatMessage {
  return {
    messageId: raw?.messageId ?? raw?.id ?? 0,
    senderId: raw?.memberId ?? raw?.senderId ?? 0,
    senderName: raw?.memberName ?? raw?.senderName ?? '',
    profileImageUrl: raw?.profileImageUrl ?? null,
    content: raw?.content ?? '',
    originalLanguage: raw?.originalLanguage ?? 'ko',
    translatedContent: raw?.translatedContent ?? null,
    sentAt: raw?.createdAt ?? raw?.sentAt ?? new Date().toISOString(),
  };
}

// ✅ 실제 연동: GET /api/chat/rooms/{roomId}/messages?size=
// 응답이 배열이라 예전의 { messages, nextCursor, hasNext } 커서 페이징 형태가 아닙니다.
// (서버에 커서 파라미터가 없어서 "최근 size개"만 받아옵니다 — 전체 이력 페이징은 아직 불가)
export async function getMessages(roomId: number, size = 30): Promise<ChatMessage[]> {
  return withDemoFallback(
    async () => {
      const { data } = await apiClient.get(`/api/chat/rooms/${roomId}/messages`, {
        params: { size },
      });
      const list: any[] = Array.isArray(data) ? data : (data?.messages ?? []);
      return list.map(mapChatMessage);
    },
    () => mockDelay(mockMessages)
  );
}

// ✅ 실제 연동: POST /api/chat/rooms/{roomId}/messages?memberId=  (본문은 { content } 뿐)
// memberId는 쿼리 파라미터로 "필수"라서 본문에 넣으면 서버가 누가 보냈는지 몰라 실패합니다.
export async function sendMessage(
  roomId: number,
  memberId: number,
  content: string
): Promise<ChatMessage> {
  return withDemoFallback(
    async () => {
      const { data } = await apiClient.post(
        `/api/chat/rooms/${roomId}/messages`,
        { content },
        { params: { memberId } }
      );
      return mapChatMessage(data ?? {});
    },
    () =>
      mockDelay({
        messageId: Date.now(),
        senderId: memberId,
        senderName: '',
        profileImageUrl: null,
        content,
        originalLanguage: 'ko',
        translatedContent: null,
        sentAt: new Date().toISOString(),
      })
  );
}

export async function uploadChatFile(projectId: number, file: { uri: string; name: string; type: string }) {
  return withDemoFallback(
    async () => {
      const form = new FormData();
      // @ts-ignore React Native의 파일 객체는 브라우저 FormData 타입과 다릅니다.
      form.append('file', file);
      const { data } = await apiClient.post(`/api/chat/rooms/${projectId}/files`, form, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      return data;
    },
    () =>
      mockDelay({
        fileId: Date.now(),
        fileName: file.name,
        fileUrl: file.uri,
        fileType: file.type,
        uploadedBy: 1,
        uploadedAt: new Date().toISOString(),
      })
  );
}

// ⚠️ 실제 백엔드엔 "회의록 AI 생성" API가 없음. 대화를 보고 자동 요약해주는 게 아니라
// title/content를 프론트가 직접 채워서 POST해야 하는 구조라, 지금 화면 흐름 자체를 백엔드팀과
// 다시 맞춰야 함. content도 문자열 하나뿐이라(주요논의/결정사항/역할 구조 아님) 화면 재설계 필요.
export async function createMeetingMinute(projectId: number): Promise<MeetingMinuteDetail> {
  return withDemoFallback(
    async () => {
      const { data } = await apiClient.post(`/api/chat/rooms/${projectId}/meeting-minutes`);
      return data;
    },
    () => mockDelay(mockMeetingMinuteDetail(mockMeetingMinutes.length + 1))
  );
}

// ⚠️ 위 createMeetingMinute와 같은 이유로 응답 형태(content가 문자열)가 맞지 않습니다.
export async function getMeetingMinutes(projectId: number) {
  return withDemoFallback(
    async () => {
      const { data } = await apiClient.get(`/api/chat/rooms/${projectId}/meeting-minutes`);
      return data;
    },
    () => mockDelay({ meetingMinutes: mockMeetingMinutes })
  );
}

// ⚠️ 위와 같은 이유(content 구조 불일치) + 문서에 정확한 경로가
// 명시되지 않아 REST 관례로 추정 구현한 상태
export async function getMeetingMinuteDetail(
  projectId: number,
  meetingMinuteId: number
): Promise<MeetingMinuteDetail> {
  return withDemoFallback(
    async () => {
      const { data } = await apiClient.get(
        `/api/chat/rooms/${projectId}/meeting-minutes/${meetingMinuteId}`
      );
      return data;
    },
    () => mockDelay(mockMeetingMinuteDetail(meetingMinuteId))
  );
}

// ✅ 실제 연동: POST /api/chat/rooms/{roomId}/tasks/ai-generate (AI가 대화 보고 오늘의 과제 생성)
export async function createTodayTasks(projectId: number) {
  return withDemoFallback(
    async () => {
      const { data } = await apiClient.post(`/api/chat/rooms/${projectId}/tasks/ai-generate`);
      return { tasks: mapTasks(data) };
    },
    () => mockDelay({ tasks: mockTodayTasks })
  );
}

// ✅ 실제 연동: PATCH /api/tasks/chat/rooms/{projectId}/tasks/{taskId}?status=
// 과제 체크박스 토글 시 서버에 상태를 저장해서, 화면을 나갔다 들어와도 유지되도록 합니다.
export async function updateTaskStatus(
  projectId: number,
  taskId: number,
  status: 'TODO' | 'IN_PROGRESS' | 'DONE'
) {
  return withDemoFallback(
    async () => {
      const { data } = await apiClient.patch(
        `/api/tasks/chat/rooms/${projectId}/tasks/${taskId}`,
        null,
        { params: { status } }
      );
      return data;
    },
    () => mockDelay({ success: true })
  );
}

// ✅ 실제 연동: GET /api/tasks/chat/rooms/{projectId}/tasks (memberId 없이 프로젝트 전체 과제 조회)
export async function getTodayTasks(projectId: number, status: 'ALL' | 'TODO' | 'DONE' = 'ALL') {
  return withDemoFallback(
    async () => {
      const { data } = await apiClient.get(`/api/tasks/chat/rooms/${projectId}/tasks`, {
        params: { status },
      });
      return { tasks: mapTasks(data) };
    },
    () => {
      const tasks =
        status === 'ALL' ? mockTodayTasks : mockTodayTasks.filter((task) => task.status === status);
      return mockDelay({ tasks });
    }
  );
}

// ✅ 실제 연동: GET /api/projects/my (내가 참여 중인 프로젝트 목록, memberId 파라미터 없음)
// ⚠️ 이 API가 아직 로그인 세션을 구분 못 할 가능성이 있습니다(스펙에 memberId 파라미터가
// 아예 없음). 응답이 이상하면(예: 모든 사용자의 프로젝트가 다 나옴) 백엔드팀 확인 필요.
export async function getMyProjects(): Promise<{ projectId: number; title: string }[]> {
  return withDemoFallback(
    async () => {
      const { data } = await apiClient.get('/api/projects/my');
      return data ?? [];
    },
    () =>
      mockDelay(
        mockChatProjects.map((project) => ({
          projectId: project.projectId,
          title: project.projectName,
        }))
      )
  );
}

// ✅ 실제 연동: 마이페이지 '오늘의 과제'를 채팅방 '오늘의 과제'와 항상 같은 데이터로 보여주기 위해,
// 내가 참여 중인 모든 프로젝트(getMyProjects)를 돌면서 각 프로젝트의 실제 과제(getTodayTasks)를
// 그대로 모아서 합칩니다. 즉 별도의 mock이 아니라 채팅방 화면과 완전히 같은 소스를 씁니다.
export async function getAllMyTodayTasks(): Promise<TodayTask[]> {
  const projects = await getMyProjects();
  const perProject = await Promise.all(projects.map((p) => getTodayTasks(p.projectId)));
  return perProject.flatMap((r) => r.tasks);
}

// ✅ 실제 연동: GET /api/chat/rooms/{projectId}/members
export async function getTeamMembers(projectId: number) {
  return withDemoFallback(
    async () => {
      const { data } = await apiClient.get(`/api/chat/rooms/${projectId}/members`);
      const members: TeamMember[] = (data ?? []).map((member: any) => ({
        memberId: member.memberId,
        name: member.name,
        role: member.role,
        description: member.detailRole ?? '',
      }));
      return { members };
    },
    () => mockDelay({ members: mockTeamMembers })
  );
}

// ✅ 실제 연동: GET /api/chat/rooms/{projectId}/roadmap
export async function getRoadmap(projectId: number) {
  return withDemoFallback(
    async () => {
      const { data } = await apiClient.get(`/api/chat/rooms/${projectId}/roadmap`);
      return { phases: mapRoadmapStages(data?.steps) };
    },
    () => mockDelay({ phases: mockRoadmap })
  );
}

// ✅ 실제 연동: POST /api/chat/rooms/{roomId}/roadmap/ai-generate (AI가 대화 보고 로드맵 재생성)
export async function generateRoadmap(projectId: number) {
  return withDemoFallback(
    async () => {
      const { data } = await apiClient.post(`/api/chat/rooms/${projectId}/roadmap/ai-generate`);
      return { phases: mapRoadmapStages(data) };
    },
    () => mockDelay({ phases: mockRoadmap })
  );
}
