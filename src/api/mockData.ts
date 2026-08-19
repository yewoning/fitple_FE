import {
  ApplicationItem,
  ChatMessage,
  ChatProjectSummary,
  ChatRoom,
  MeetingMinuteDetail,
  MeetingMinuteSummary,
  ResumeVersion,
  RoadmapPhase,
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
// 아이콘/문구는 실제 전달받은 스크린샷 그대로, RecruitingProjectCard(프로젝트팀 공용 컴포넌트)를 재사용합니다.
export const mockScraps: ScrapItem[] = [
  {
    id: 'scrap-1',
    projectName: '야간 귀갓길 안전지도 제작',
    status: 'recruiting',
    subInfo: '현장조사 · 데이터 정리 · 지도 제작',
    deadline: '2026-09-10',
    icon: require('../../assets/icons/map.webp'),
  },
  {
    id: 'scrap-2',
    projectName: '단편 웹드라마 제작팀',
    status: 'recruiting',
    subInfo: '시나리오 · 배우 · 촬영 · 편집',
    deadline: '2026-09-04',
    icon: require('../../assets/icons/video.webp'),
  },
  {
    id: 'scrap-3',
    projectName: '대학생 창업 아이디어톤 팀',
    status: 'recruiting',
    subInfo: '서비스 기획 · 시장조사 · 발표',
    deadline: '2026-09-03',
    icon: require('../../assets/icons/idea.webp'),
  },
  {
    id: 'scrap-4',
    projectName: '독립출판 매거진 제작팀',
    status: 'recruit-closed',
    subInfo: '에디터 · 사진 · 편집디자인',
    deadline: '2026-08-17',
    icon: require('../../assets/icons/note.webp'),
  },
  {
    id: 'scrap-5',
    projectName: '캠퍼스 미스터리 방탈출 제작',
    status: 'recruit-closed',
    subInfo: '스토리 기획 · 공간 연출 · 운영',
    deadline: '2026-08-17',
    icon: require('../../assets/icons/shop.webp'),
  },
  {
    id: 'scrap-6',
    projectName: '외국인 학생 인터뷰 프로젝트',
    status: 'recruit-closed',
    subInfo: '발표 · PPT · 디자인',
    deadline: '2026-08-17',
    icon: require('../../assets/icons/megaphone.webp'),
  },
];

// 지원 현황 화면 스크린샷 기준
export const mockApplications: ApplicationItem[] = [
  {
    id: 'apply-1',
    projectName: '반려동물 임시보호 매칭 서비스',
    status: 'recruiting',
    subInfo: '서비스 기획',
    deadline: '2026-09-10',
    icon: require('../../assets/icons/handshake.webp'),
    selected: true,
  },
  {
    id: 'apply-2',
    projectName: '대학생 금융습관 개선 챌린지',
    status: 'recruiting',
    subInfo: '운영 · 기획',
    deadline: '2026-09-04',
    icon: require('../../assets/icons/money.webp'),
    selected: true,
  },
  {
    id: 'apply-3',
    projectName: '시각장애인 이동 보조 서비스',
    status: 'recruiting',
    subInfo: 'UX 리서치',
    deadline: '2026-09-03',
    icon: require('../../assets/icons/idea.webp'),
    selected: true,
  },
  {
    id: 'apply-4',
    projectName: '로컬 농산물 직거래 서비스',
    status: 'recruit-closed',
    subInfo: '서비스 기획',
    deadline: '2026-08-17',
    icon: require('../../assets/icons/money.webp'),
    selected: false,
  },
  {
    id: 'apply-5',
    projectName: '학생 자취방 교환 플랫폼',
    status: 'recruit-closed',
    subInfo: 'UX/UI',
    deadline: '2026-08-17',
    icon: require('../../assets/icons/shop.webp'),
    selected: false,
  },
  {
    id: 'apply-6',
    projectName: '공공자전거 이용 개선 프로젝트',
    status: 'recruit-closed',
    subInfo: '사용자 조사',
    deadline: '2026-08-17',
    icon: require('../../assets/icons/megaphone.webp'),
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

// 오늘의 과제 화면 스크린샷 기준 (마이페이지 > 오늘의 과제 전체 목록)
export const mockTodayTasks: TodayTask[] = [
  {
    taskId: 1,
    projectName: '교환학생 문화교류 콘텐츠 제작',
    title: '콘텐츠 주제 후보 3개 정리',
    assignee: { memberId: 1, name: '김지수' },
    status: 'DONE',
    dueDate: '2026-08-17',
  },
  {
    taskId: 2,
    projectName: '교환학생 문화교류 콘텐츠 제작',
    title: '인터뷰 질문 초안 검토',
    assignee: { memberId: 1, name: '김지수' },
    status: 'DONE',
    dueDate: '2026-08-17',
  },
  {
    taskId: 3,
    projectName: '교환학생 문화교류 콘텐츠 제작',
    title: '팀원 진행 상황 확인 및 일정 정리',
    assignee: { memberId: 1, name: '김지수' },
    status: 'TODO',
    dueDate: '2026-08-17',
  },
  {
    taskId: 4,
    projectName: '교내 플리마켓 운영팀',
    title: '판매 부스 배치안 정리',
    assignee: { memberId: 1, name: '김지수' },
    status: 'DONE',
    dueDate: '2026-08-17',
  },
  {
    taskId: 5,
    projectName: '유기동물 보호소 봉사 기획',
    title: '봉사 참여 인원 최종 확인',
    assignee: { memberId: 1, name: '김지수' },
    status: 'TODO',
    dueDate: '2026-08-17',
  },
  {
    taskId: 6,
    projectName: '졸업 전시 준비위원회',
    title: '전시장 대관 일정 확인',
    assignee: { memberId: 1, name: '김지수' },
    status: 'TODO',
    dueDate: '2026-08-17',
  },
];

// 프로젝트 로드맵 화면 스크린샷 기준
export const mockRoadmap: RoadmapPhase[] = [
  {
    phaseId: 1,
    order: 1,
    title: '콘텐츠 주제 및 방향 확정',
    assignee: '전체',
    description: '문화 차이 주제 및 방향 설정',
    dueDate: '08.14 (금)',
    deadline: '2026-08-14',
  },
  {
    phaseId: 2,
    order: 2,
    title: '인터뷰 기획 및 섭외',
    assignee: '이준호 · 김서윤 · Emily',
    description: '질문 구성 · 출연진 섭외 · 일정 조율',
    dueDate: '08.24 (토)',
    deadline: '2026-08-24',
  },
  {
    phaseId: 3,
    order: 3,
    title: '촬영 기획 및 준비',
    assignee: '박하린 · 최민재',
    description: '촬영 구성안 · 장소 및 장비 준비',
    dueDate: '08.31 (월)',
    deadline: '2026-08-31',
  },
  {
    phaseId: 4,
    order: 4,
    title: '인터뷰 및 콘텐츠 촬영',
    assignee: '박하린 · 최민재 · Emily',
    description: '인터뷰 진행 · 소스 영상 촬영',
    dueDate: '09.10 (목)',
    deadline: '2026-09-10',
  },
  {
    phaseId: 5,
    order: 5,
    title: '영상 편집 및 번역',
    assignee: '최민재 · Emily',
    description: '컷 편집 · 자막 제작 · 영문 번역',
    dueDate: '09.22 (화)',
    deadline: '2026-09-22',
  },
  {
    phaseId: 6,
    order: 6,
    title: '피드백 반영 및 수정',
    assignee: '전체',
    description: '피드백 반영 및 수정',
    dueDate: '09.26 (토)',
    deadline: '2026-09-26',
  },
  {
    phaseId: 7,
    order: 7,
    title: '최종 검토 및 업로드',
    assignee: '전체',
    description: '최종 결과물 확인 · 콘텐츠 업로드',
    dueDate: '09.30 (수)',
    deadline: '2026-09-30',
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
  roomId: projectId,
  projectId,
});

// 채팅방 화면 스크린샷 기준 대화 내용
export const mockMessages: ChatMessage[] = [
  {
    messageId: 1,
    senderId: 5,
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
    senderId: 2,
    senderName: '이준호',
    content: '좋아요. 문화 차이 중에서도 학교생활이나 일상 위주로 가면 어떨까요?',
    originalLanguage: 'ko',
    translatedContent: null,
    sentAt: '2026-08-08T10:31:30',
  },
  {
    messageId: 4,
    senderId: 6,
    senderName: 'Emily Carter',
    content: 'I think everyday cultural differences would be fun and relatable!',
    originalLanguage: 'en',
    translatedContent: '일상 속 문화 차이를 다루면 재미있고 공감하기 좋을 것 같아요!',
    sentAt: '2026-08-08T10:33:00',
  },
  {
    messageId: 5,
    senderId: 3,
    senderName: '박하린',
    content: '그러면 인터뷰 형식으로 찍어도 재밌을 것 같아요. 서로 다르게 느꼈던 부분 물어보는 식으로요!',
    originalLanguage: 'ko',
    translatedContent: null,
    sentAt: '2026-08-08T10:33:30',
  },
  {
    messageId: 6,
    senderId: 1,
    senderName: '김지수',
    content: '좋아요! 그럼 한국과 해외 대학생활의 문화 차이를 메인 주제로 잡아볼까요?',
    originalLanguage: 'ko',
    translatedContent: null,
    sentAt: '2026-08-08T10:33:45',
    isMe: true,
  },
  {
    messageId: 7,
    senderId: 4,
    senderName: '최민재',
    content: '좋아요. 촬영할 때 학교생활 장면도 같이 넣으면 영상이 덜 단조로울 것 같아요.',
    originalLanguage: 'ko',
    translatedContent: null,
    sentAt: '2026-08-08T10:34:00',
  },
  {
    messageId: 8,
    senderId: 5,
    senderName: '김서윤',
    content: '제가 비슷한 콘텐츠 사례랑 인터뷰할 학생들 한번 찾아볼게요!',
    originalLanguage: 'ko',
    translatedContent: null,
    sentAt: '2026-08-08T10:34:30',
  },
  {
    messageId: 9,
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

// 채팅방 '회의록 생성' 미리보기 화면 스크린샷 기준
export const mockMeetingMinuteDetail = (id: number): MeetingMinuteDetail => ({
  meetingMinuteId: id,
  meetingNumber: id,
  meetingDate: '2026.08.08',
  projectName: '교환학생 문화교류 콘텐츠 제작',
  topic: '콘텐츠 주제 및 방향 설정',
  content: {
    mainDiscussion: '한국과 해외 대학생활의 문화 차이를 주제로 인터뷰형 숏폼 콘텐츠를 제작하기로 했어요.',
    decisions: ['메인 주제: 한국·해외 대학생활 문화 차이', '콘텐츠 형식: 인터뷰형 숏폼', '캠퍼스 일상 소스 영상 함께 촬영'],
    rolesAndNextTasks: [
      { name: '김지수', task: '전체 콘텐츠 방향 정리' },
      { name: '김서윤', task: '유사 콘텐츠 조사 · 인터뷰이 탐색' },
      { name: '이준호', task: '인터뷰 질문 구성' },
      { name: '박하린', task: '인터뷰 촬영 구성' },
      { name: '최민재', task: '캠퍼스 소스 영상 촬영' },
      { name: 'Emily', task: '문화 차이 사례 정리' },
    ],
  },
});
