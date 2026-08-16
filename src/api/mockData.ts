import {
  ApplicationItem,
  ChatMessage,
  ChatProjectSummary,
  ChatRoom,
  MeetingMinuteDetail,
  MeetingMinuteSummary,
  ProjectSummary,
  ResumeVersion,
  ScrapItem,
  TeamMember,
  TodayTask,
  User,
} from '@/types';

export const mockUser: User = {
  userId: 1,
  name: '김지수',
  loginId: 'jisoo_k',
  profileImageUrl: null,
  profileSummary:
    'Spring Boot와 MySQL을 활용한 백엔드 개발 경험을 보유하고 있으며 JWT 기반 인증 시스템을 구현하였습니다.',
  createdByAI: true,
};

// 스크랩 화면 스크린샷 기준 (야간 귀갓길 안전지도 제작 등)
const scrapSource: ProjectSummary[] = [
  {
    projectId: 101,
    title: '야간 귀갓길 안전지도 제작',
    roles: ['현장조사', '데이터 정리', '지도 제작'],
    recruitStatus: '모집중',
    dDay: 'D-24',
  },
  {
    projectId: 102,
    title: '단편 웹드라마 제작팀',
    roles: ['시나리오', '배우', '촬영', '편집'],
    recruitStatus: '모집중',
    dDay: 'D-18',
  },
  {
    projectId: 103,
    title: '대학생 창업 아이디어톤 팀',
    roles: ['서비스 기획', '시장조사', '발표'],
    recruitStatus: '모집중',
    dDay: 'D-17',
  },
  {
    projectId: 104,
    title: '독립출판 매거진 제작팀',
    roles: ['에디터', '사진', '편집디자인'],
    recruitStatus: '마감',
    dDay: 'D-DAY',
  },
  {
    projectId: 105,
    title: '캠퍼스 미스터리 방탈출 제작',
    roles: ['스토리 기획', '공간 연출', '운영'],
    recruitStatus: '마감',
    dDay: 'D-DAY',
  },
];

export const mockScraps: ScrapItem[] = scrapSource;

// 지원 현황 화면 스크린샷 기준
export const mockApplications: ApplicationItem[] = [
  {
    projectId: 201,
    title: '반려동물 임시보호 매칭 서비스',
    roles: ['서비스 기획'],
    recruitStatus: '모집중',
    dDay: 'D-24',
    selected: true,
  },
  {
    projectId: 202,
    title: '대학생 금융습관 개선 챌린지',
    roles: ['운영', '기획'],
    recruitStatus: '모집중',
    dDay: 'D-18',
    selected: true,
  },
  {
    projectId: 203,
    title: '시각장애인 이동 보조 서비스',
    roles: ['UX 리서치'],
    recruitStatus: '모집중',
    dDay: 'D-17',
    selected: true,
  },
  {
    projectId: 204,
    title: '로컬 농산물 직거래 서비스',
    roles: ['서비스 기획'],
    recruitStatus: '마감',
    dDay: 'D-DAY',
    selected: false,
  },
];

// 나의 역량 화면 스크린샷 기준
export const mockResumeVersions: ResumeVersion[] = [
  { id: 1, title: '기본 소개용', updatedAt: '2026.08.01' },
  { id: 2, title: '공모전 지원용', updatedAt: '2026.08.03' },
  { id: 3, title: '팀플지원용_최종본', updatedAt: '2026.08.05' },
  { id: 4, title: '발표 기획 강조용', updatedAt: '2026.08.06' },
  { id: 5, title: '협업 경험 추가 버전', updatedAt: '2026.08.07' },
  { id: 6, title: '해커톤 지원용', updatedAt: '2026.08.08' },
  { id: 7, title: '데이터 분석형_찐최종본', updatedAt: '2026.08.09' },
];

// 오늘의 과제 화면 스크린샷 기준
export const mockTodayTasks: TodayTask[] = [
  {
    taskId: 1,
    title: '콘텐츠 주제 후보 3개 정리',
    assignee: { memberId: 1, name: '김지수' },
    status: 'DONE',
    dueDate: '2026.08.16',
  },
  {
    taskId: 2,
    title: '인터뷰 질문 초안 검토',
    assignee: { memberId: 1, name: '김지수' },
    status: 'TODO',
    dueDate: '2026.08.16',
  },
  {
    taskId: 3,
    title: '팀원 진행 상황 확인 및 일정 정리',
    assignee: { memberId: 1, name: '김지수' },
    status: 'TODO',
    dueDate: '2026.08.16',
  },
];

export const mockChatProjects: ChatProjectSummary[] = [
  {
    projectId: 1,
    projectName: '교환학생 문화교류 콘텐츠 제작',
    projectIconUrl: null,
    memberCount: 6,
    lastMessage: '감사합니다! 그럼 오늘 나온 내용은 제가 정리해서 회의록 생성해둘게요:)',
    lastMessageAt: '2026-08-08T10:35:36',
    unreadCount: 3,
  },
];

export const mockChatRoom = (projectId: number): ChatRoom => ({
  projectId,
  projectName: '교환학생 문화교류 콘텐츠 제작',
  projectIconUrl: null,
  memberCount: 6,
});

// 채팅방 화면 스크린샷 기준 대화 내용
export const mockMessages: ChatMessage[] = [
  {
    messageId: 1,
    senderId: 2,
    senderName: '김서윤',
    content: '다들 들어오신 것 같은데 회의 시작할까요?',
    originalLanguage: 'ko',
    translatedContent: null,
    sentAt: '2026-08-08T10:30:00',
  },
  {
    messageId: 2,
    senderId: 1,
    senderName: '김지수',
    content: '네! 우선 오늘은 콘텐츠 주제랑 전체적인 방향부터 정하면 좋을 것 같아요.',
    originalLanguage: 'ko',
    translatedContent: null,
    sentAt: '2026-08-08T10:31:00',
    isMe: true,
  },
  {
    messageId: 3,
    senderId: 3,
    senderName: '이준호',
    content: '좋아요. 문화 차이 중에서도 학교생활이나 일상 위주로 가면 어떨까요?',
    originalLanguage: 'ko',
    translatedContent: null,
    sentAt: '2026-08-08T10:31:30',
  },
  {
    messageId: 4,
    senderId: 4,
    senderName: 'Emily Carter',
    content: 'I think everyday cultural differences would be fun and relatable!',
    originalLanguage: 'en',
    translatedContent: '일상 속 문화 차이를 다루면 재미있고 공감하기 좋을 것 같아요!',
    sentAt: '2026-08-08T10:33:00',
  },
  {
    messageId: 5,
    senderId: 1,
    senderName: '김지수',
    content: '감사합니다! 그럼 오늘 나온 내용은 제가 정리해서 회의록 생성해둘게요:)',
    originalLanguage: 'ko',
    translatedContent: null,
    sentAt: '2026-08-08T10:35:00',
    isMe: true,
  },
];

// 팀원 목록 화면 스크린샷 기준
export const mockTeamMembers: TeamMember[] = [
  { memberId: 1, name: '김지수', role: '팀장 · 콘텐츠 기획', description: '프로젝트 기획 · 일정 관리' },
  { memberId: 2, name: '이준호', role: '인터뷰 기획', description: '질문 구성 · 인터뷰 진행' },
  { memberId: 3, name: '박하린', role: '기획 · 촬영', description: '인터뷰 · 소스 영상 촬영' },
  { memberId: 4, name: '최민재', role: '촬영 · 편집', description: '문화 차이 주제 및 방향 설정' },
  { memberId: 5, name: '김서윤', role: '자료조사 · 섭외', description: '컷 편집 · 자막 · 사운드' },
  {
    memberId: 6,
    name: 'Emily Carter',
    role: '외국인 섭외 · 번역 · 인터뷰',
    description: '출연진 섭외 영어 번역 · 문화교류 인터뷰',
  },
];

// 지난 회의록 화면 스크린샷 기준
export const mockMeetingMinutes: MeetingMinuteSummary[] = [
  { meetingMinuteId: 1, meetingNumber: 1, meetingDate: '2026.08.08 (토) 16:30', topic: '콘텐츠 방향 정리' },
  { meetingMinuteId: 2, meetingNumber: 2, meetingDate: '2026.08.12 (수) 16:30', topic: '주제 및 기획안 초안 작성' },
  { meetingMinuteId: 3, meetingNumber: 3, meetingDate: '2026.08.19 (수) 16:30', topic: '팀원별 일정 확인' },
  { meetingMinuteId: 4, meetingNumber: 4, meetingDate: '2026.08.26 (수) 16:30', topic: '촬영 계획 확정' },
  { meetingMinuteId: 5, meetingNumber: 5, meetingDate: '2026.09.09 (수) 16:30', topic: '편집본 1차 검토' },
];

export const mockMeetingMinuteDetail = (id: number): MeetingMinuteDetail => ({
  meetingMinuteId: id,
  meetingNumber: id,
  meetingDate: '2026.08.08',
  projectName: '교환학생 문화교류 콘텐츠 제작',
  topic: '콘텐츠 주제 및 방향 설정',
  content: {
    mainDiscussion: '한국과 해외 대학생활의 문화 차이를 주제로 인터뷰 형식 콘텐츠를 제작하기로 함.',
    decisions: '메인 주제: 한국-해외 대학생활 문화 차이 / 형식: 인터뷰',
    rolesAndNextTasks: '김지수 - 전체 콘텐츠 방향 정리, 김서윤 - 유사 사례 및 인터뷰이 조사',
  },
});
