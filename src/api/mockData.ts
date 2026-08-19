import {
  ChatMessage,
  ChatProjectSummary,
  ChatRoom,
  MeetingMinute,
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
    sentAt: '2026-08-08T10:30:00',
  },
  {
    messageId: 2,
    senderId: 1,
    senderName: '김지수',
    content: '네! 우선 오늘은 콘텐츠 주제랑 전체적인 방향부터 정하면 좋을 것 같아요.',
    sentAt: '2026-08-08T10:31:00',
    isMe: true,
  },
  {
    messageId: 3,
    senderId: 2,
    senderName: '이준호',
    content: '좋아요. 문화 차이 중에서도 학교생활이나 일상 위주로 가면 어떨까요?',
    sentAt: '2026-08-08T10:31:30',
  },
  {
    messageId: 4,
    senderId: 6,
    senderName: 'Emily Carter',
    content: 'I think everyday cultural differences would be fun and relatable!',
    sentAt: '2026-08-08T10:33:00',
  },
  {
    messageId: 5,
    senderId: 3,
    senderName: '박하린',
    content: '그러면 인터뷰 형식으로 찍어도 재밌을 것 같아요. 서로 다르게 느꼈던 부분 물어보는 식으로요!',
    sentAt: '2026-08-08T10:33:30',
  },
  {
    messageId: 6,
    senderId: 1,
    senderName: '김지수',
    content: '좋아요! 그럼 한국과 해외 대학생활의 문화 차이를 메인 주제로 잡아볼까요?',
    sentAt: '2026-08-08T10:33:45',
    isMe: true,
  },
  {
    messageId: 7,
    senderId: 4,
    senderName: '최민재',
    content: '좋아요. 촬영할 때 학교생활 장면도 같이 넣으면 영상이 덜 단조로울 것 같아요.',
    sentAt: '2026-08-08T10:34:00',
  },
  {
    messageId: 8,
    senderId: 5,
    senderName: '김서윤',
    content: '제가 비슷한 콘텐츠 사례랑 인터뷰할 학생들 한번 찾아볼게요!',
    sentAt: '2026-08-08T10:34:30',
  },
  {
    messageId: 9,
    senderId: 1,
    senderName: '김지수',
    content: '감사합니다! 그럼 오늘 나온 내용은 제가 정리해서 회의록 생성해둘게요:)',
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

// 지난 회의록 화면. 서버 계약(MeetingMinuteResponse)과 같은 플랫 구조라
// content는 buildMeetingMinuteDraft가 만드는 평문 형식 그대로 들고 있습니다.
export const mockMeetingMinutes: MeetingMinute[] = [
  {
    meetingMinuteId: 1,
    projectId: 1,
    title: '08.08 회의록',
    content: [
      '2026.08.08 (토) 16:30 나눈 대화 정리',
      '',
      '[대화 내용]',
      '16:30 김지수: 한국·해외 대학생활 문화 차이를 메인 주제로 잡으면 좋을 것 같아요',
      '16:34 이준호: 인터뷰형 숏폼이 제일 잘 맞을 것 같습니다',
      '16:41 최민재: 캠퍼스 일상 소스 영상도 같이 찍어두면 편집이 수월해요',
      '',
      '[다음 할 일]',
      '- 김지수: 전체 콘텐츠 방향 정리 (마감 08.12)',
      '- 김서윤: 유사 콘텐츠 조사 · 인터뷰이 탐색',
      '- 이준호: 인터뷰 질문 구성',
    ].join('\n'),
    createdAt: '2026-08-08T16:30:00',
  },
  {
    meetingMinuteId: 2,
    projectId: 1,
    title: '08.12 회의록',
    content: [
      '2026.08.12 (수) 16:30 나눈 대화 정리',
      '',
      '[대화 내용]',
      '16:30 김서윤: 기획안 초안 공유드렸어요, 인터뷰이 후보도 정리해뒀습니다',
      '16:38 박하린: 촬영 구성은 인터뷰 2컷 + 캠퍼스 인서트로 잡을게요',
      '',
      '[다음 할 일]',
      '- 박하린: 인터뷰 촬영 구성 (마감 08.19)',
      '- Emily: 문화 차이 사례 정리',
    ].join('\n'),
    createdAt: '2026-08-12T16:30:00',
  },
  {
    meetingMinuteId: 3,
    projectId: 1,
    title: '08.19 회의록',
    content: [
      '2026.08.19 (수) 16:30 나눈 대화 정리',
      '',
      '[대화 내용]',
      '16:30 김지수: 다음 주 촬영 일정 맞춰볼게요, 가능한 요일 알려주세요',
      '16:35 최민재: 저는 수요일 오후가 제일 편합니다',
      '',
      '[다음 할 일]',
      '- 최민재: 캠퍼스 소스 영상 촬영 (마감 08.26)',
    ].join('\n'),
    createdAt: '2026-08-19T16:30:00',
  },
];

// 상세 화면 목업. 목록에 없는 id로 들어와도 화면이 비지 않도록 첫 항목을 폴백으로 씁니다.
export const mockMeetingMinuteDetail = (id: number): MeetingMinute =>
  mockMeetingMinutes.find((minute) => minute.meetingMinuteId === id) ?? {
    ...mockMeetingMinutes[0],
    meetingMinuteId: id,
  };

// 목업 모드에서도 방금 저장한 회의록이 목록/상세에 보이도록 메모리에 쌓아둡니다(앱 재시작 시 초기화).
export function addMockMeetingMinute(
  projectId: number,
  draft: { title: string; content: string }
): MeetingMinute {
  const nextId = mockMeetingMinutes.reduce((max, m) => Math.max(max, m.meetingMinuteId), 0) + 1;
  const created: MeetingMinute = {
    meetingMinuteId: nextId,
    projectId,
    title: draft.title,
    content: draft.content,
    createdAt: new Date().toISOString(),
  };
  mockMeetingMinutes.push(created);
  return created;
}
