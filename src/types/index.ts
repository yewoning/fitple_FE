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

export interface ChatRoom {
  projectId: number;
  projectName: string;
  projectIconUrl: string | null;
  memberCount: number;
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
    decisions: string;
    rolesAndNextTasks: string;
  };
}

export type TaskStatus = 'TODO' | 'DONE';

export interface TodayTask {
  taskId: number;
  projectName: string;
  title: string;
  description?: string;
  assignee: { memberId: number; name: string };
  status: TaskStatus;
  dueDate: string;
}

// 스크랩 / 지원 현황 화면은 프로젝트팀이 이미 만든 RecruitingProjectCard를 그대로 재사용합니다.
export type ScrapItem = RecruitingProjectCardData;
export interface ApplicationItem extends RecruitingProjectCardData {
  selected: boolean;
}
export interface ResumeVersion {
  id: number;
  title: string;
  updatedAt: string;
}
