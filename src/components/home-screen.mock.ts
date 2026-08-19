import type { ProjectCardData } from '@/types/project';

// 회원 프로필 조회(2-1) 실패 시 표시할 폴백 닉네임.
export const FALLBACK_NICKNAME = '민지';

// API 연동 실패 시 표시할 폴백 데이터.
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
    projectName: '캠퍼스 굿즈 공동구매 서비스',
    status: 'recruiting',
    subInfo: '기획·마케팅',
    deadline: '2026-08-28',
  },
];

export const MOCK_IN_PROGRESS_PROJECTS: ProjectCardData[] = [
  {
    id: 'prog-1',
    projectName: '핏플 온보딩 리디자인',
    status: 'in-progress',
    subInfo: '홈 화면 UI 퍼블리싱',
    deadline: '2026-08-27',
  },
  {
    id: 'prog-2',
    projectName: '중고 서적 공유 서비스',
    status: 'in-progress',
    subInfo: '회원가입 API 연동',
    deadline: '2026-08-26',
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
