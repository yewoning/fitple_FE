// 실제로 전달받은 UI 디자인 화면 기준 도메인 타입 정의

export interface User {
  userId: number;
  name: string;
  loginId: string;
  profileImageUrl: string | null;
  profileSummary: string | null;
  createdByAI: boolean;
}

export type RecruitStatus = '모집중' | '마감';

export interface ProjectSummary {
  projectId: number;
  title: string;
  iconUrl?: string | null;
  roles: string[];
  recruitStatus: RecruitStatus;
  dDay?: string; // "D-24" | "D-DAY"
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
  title: string;
  description?: string;
  assignee: { memberId: number; name: string };
  status: TaskStatus;
  dueDate: string;
}

export type ScrapItem = ProjectSummary;
export interface ApplicationItem extends ProjectSummary {
  selected: boolean;
}
export interface ResumeVersion {
  id: number;
  title: string;
  updatedAt: string;
}
