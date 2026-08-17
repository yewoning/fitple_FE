import type { RecruitingProjectCardData } from '@/types/project';

export const MOCK_RECRUITING_PROJECTS: RecruitingProjectCardData[] = [
  {
    id: 'recruit-1',
    projectName: '교내 플리마켓 운영 기획',
    status: 'recruiting',
    subInfo: '발표 · PPT · 디자인',
    deadline: '2026-09-06',
    icon: require('../../assets/icons/shop.webp'),
  },
  {
    id: 'recruit-2',
    projectName: '제로웨이스트 캠페인 프로젝트',
    status: 'recruiting',
    subInfo: '기획 · 홍보 · 디자인',
    deadline: '2026-09-04',
    icon: require('../../assets/icons/megaphone.webp'),
  },
  {
    id: 'recruit-3',
    projectName: '대학생 숏폼 공모전 프로젝트',
    status: 'recruiting',
    subInfo: '영상 편집 · 기획 · 촬영',
    deadline: '2026-09-03',
    icon: require('../../assets/icons/video.webp'),
  },
  {
    id: 'recruit-4',
    projectName: '외국인 학생 인터뷰 프로젝트',
    status: 'recruiting',
    subInfo: '번역 · 인터뷰 진행 · 편집',
    deadline: '2026-09-01',
    icon: require('../../assets/icons/handshake.webp'),
  },
  {
    id: 'recruit-5',
    projectName: '학교 굿즈 제작 프로젝트',
    status: 'recruiting',
    subInfo: '디자인 · 제작 · 마케팅',
    deadline: '2026-08-31',
    icon: require('../../assets/icons/money.webp'),
  },
];
