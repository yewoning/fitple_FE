import type { ProjectCardData } from '@/types/project';

export const MOCK_USER = { nickname: '민지' } as const;

export const MOCK_RECOMMENDED_PROJECTS: ProjectCardData[] = [
  {
    id: 'rec-1',
    projectName: '반려동물 산책 매칭 앱',
    status: 'recruiting',
    subInfo: '프론트엔드 개발자',
    deadline: '2026-08-25',
  },
  {
    id: 'rec-2',
    projectName: '캠퍼스 중고거래 플랫폼',
    status: 'recruiting',
    subInfo: 'UI/UX 디자이너',
    deadline: '2026-08-22',
  },
  {
    id: 'rec-3',
    projectName: 'AI 스터디 매칭 서비스',
    status: 'recruiting',
    subInfo: '백엔드 개발자',
    deadline: '2026-08-30',
  },
  {
    id: 'rec-4',
    projectName: '동네 운동 크루 앱',
    status: 'recruit-closed',
    subInfo: '프론트엔드 개발자',
    deadline: '2026-08-17',
  },
  {
    id: 'rec-5',
    projectName: '캠퍼스 굿즈 공동구매 서비스',
    status: 'recruiting',
    subInfo: '기획·마케팅',
    deadline: '2026-08-28',
  },
  {
    id: 'rec-6',
    projectName: '동아리 홍보 영상 제작',
    status: 'recruiting',
    subInfo: '영상 편집자',
    deadline: '2026-09-02',
  },
];

export const MOCK_IN_PROGRESS_PROJECTS: ProjectCardData[] = [
  {
    id: 'prog-1',
    projectName: '핏플 온보딩 리디자인',
    status: 'in-progress',
    subInfo: '홈 화면 UI 퍼블리싱',
    deadline: '2026-08-20',
  },
  {
    id: 'prog-2',
    projectName: '중고 서적 공유 서비스',
    status: 'in-progress',
    subInfo: '회원가입 API 연동',
    deadline: '2026-08-19',
  },
  {
    id: 'prog-3',
    projectName: '동아리 출석 관리 시스템',
    status: 'completed',
    subInfo: '출석 통계 대시보드',
    deadline: '2026-08-10',
  },
];

export const MOCK_TODAY_TASKS: ProjectCardData[] = [
  {
    id: 'task-1',
    projectName: '핏플 온보딩 리디자인',
    status: 'in-progress',
    subInfo: '홈 화면 캐러셀 컴포넌트 구현',
    deadline: '2026-08-17',
  },
  {
    id: 'task-2',
    projectName: '중고 서적 공유 서비스',
    status: 'in-progress',
    subInfo: '로그인 화면 QA 진행',
    deadline: '2026-08-17',
  },
  {
    id: 'task-3',
    projectName: '동네 운동 크루 앱',
    status: 'in-progress',
    subInfo: '팀 회의록 정리 및 공유',
    deadline: '2026-08-18',
  },
];
