// 실제로 전달받은 UI 디자인 화면 기준 도메인 타입 정의
import type { RecruitingProjectCardData } from '@/types/project';

export interface User {
  userId: number;
  name: string;
  loginId: string;
  profileImageUrl: string | null;
  profileSummary: string | null;
  createdByAI: boolean;
}

export interface ChatProjectSummary {
  projectId: number;
  projectName: string;
  projectIconUrl: string | null;
  memberCount: number;
  lastMessage: string;
  lastMessageAt: string;
  unreadCount: number;
}

// ⚠️ 서버 계약: GET /api/chat/rooms/{projectId} 는 { roomId, projectId } 만 돌려줍니다.
// 방 이름/아이콘/인원수는 이 API가 주지 않아서 채팅 목록(ChatProjectSummary)에서 가져와 씁니다.
// 메시지 조회/전송 경로에 들어가는 값은 projectId가 아니라 여기서 받은 roomId입니다.
export interface ChatRoom {
  roomId: number;
  projectId: number;
}

export interface ChatMessage {
  messageId: number;
  senderId: number;
  senderName: string;
  profileImageUrl?: string | null;
  content: string;
  originalLanguage: string;
  translatedContent: string | null;
  sentAt: string;
  isMe?: boolean;
  isBot?: boolean;
}

export interface TeamMember {
  memberId: number;
  name: string;
  role: string;
  description: string;
}

export interface MeetingMinuteSummary {
  meetingMinuteId: number;
  meetingNumber: number;
  meetingDate: string;
  topic: string;
}

export interface MeetingMinuteDetail extends MeetingMinuteSummary {
  projectName: string;
  content: {
    mainDiscussion: string;
    decisions: string[];
    rolesAndNextTasks: { name: string; task: string }[];
  };
}

export type TaskStatus = 'TODO' | 'DONE';

export interface TodayTask {
  taskId: number;
  projectId?: number;
  projectName: string;
  title: string;
  description?: string;
  assignee: { memberId: number; name: string };
  status: TaskStatus;
  dueDate: string;
}

// 프로젝트 로드맵 화면 스크린샷 기준
export interface RoadmapPhase {
  phaseId: number;
  order: number;
  title: string;
  assignee: string;
  description: string;
  dueDate: string;
  deadline: string;
}

// 스크랩 / 지원 현황 화면은 프로젝트팀이 이미 만든 RecruitingProjectCard를 그대로 재사용합니다.
// (지원 현황은 GET /api/applications/my 연동 후 types/application.ts의 MyApplicationItem을 씁니다.)
export type ScrapItem = RecruitingProjectCardData;
export interface ResumeVersion {
  id: number;
  title: string;
  updatedAt: string;
}
