import { DEMO_USER_ROLE, type DemoUserRole } from '@/config/demo';
import type { ProjectDetailResponse } from '@/types/project';

export interface DemoUser {
  memberId: number;
  loginId: string;
  name: string;
}

export interface DemoProjectRecord {
  detail: ProjectDetailResponse;
  participantRoles: Record<number, string | null>;
  ownerRole: string | null;
}

export const DEMO_USERS: Record<DemoUserRole, DemoUser> = {
  owner: { memberId: 1, loginId: 'owner', name: '민지' },
  applicant: { memberId: 2, loginId: 'applicant', name: '서준' },
};

export const DEMO_PROJECTS: DemoProjectRecord[] = [
  {
    detail: {
      projectId: 101,
      title: '교내 플리마켓 운영 기획',
      introText: '학생들이 직접 브랜드를 소개하고 교류하는 교내 플리마켓을 함께 기획해요.',
      recruitCount: 4,
      roles: ['발표', 'PPT', '디자인'],
      periodEnd: '2026-10-16',
      meetingSchedule: '매주 수요일 오후 7시',
      deadline: '2026-09-06',
      dDay: 18,
      status: 'RECRUITING',
      imageUrl: null,
      memberId: 1,
      memberName: '민지',
    },
    participantRoles: {},
    ownerRole: null,
  },
  {
    detail: {
      projectId: 102,
      title: '제로웨이스트 캠페인 프로젝트',
      introText: '캠퍼스 안에서 실천할 수 있는 친환경 캠페인과 콘텐츠를 만들어요.',
      recruitCount: 5,
      roles: ['기획', '홍보', '디자인'],
      periodEnd: '2026-10-30',
      meetingSchedule: '격주 목요일 온라인',
      deadline: '2026-09-04',
      dDay: 16,
      status: 'RECRUITING',
      imageUrl: null,
      memberId: 3,
      memberName: '지우',
    },
    participantRoles: { 2: 'UI/UX 디자이너' },
    ownerRole: null,
  },
  {
    detail: {
      projectId: 103,
      title: '캠퍼스 중고거래 플랫폼',
      introText: '학생 인증을 기반으로 안전하게 물건을 나누는 캠퍼스 서비스를 만들어요.',
      recruitCount: 4,
      roles: ['프론트엔드', '백엔드', '디자인'],
      periodEnd: '2026-11-20',
      meetingSchedule: '매주 월요일 오후 8시',
      deadline: '2026-09-12',
      dDay: 24,
      status: 'IN_PROGRESS',
      imageUrl: null,
      memberId: 1,
      memberName: '민지',
    },
    participantRoles: { 2: '프론트엔드 개발자' },
    ownerRole: null,
  },
  {
    detail: {
      projectId: 104,
      title: '대학생 숏폼 공모전 프로젝트',
      introText: '대학생의 일상을 담은 짧은 영상을 기획하고 공모전에 출품해요.',
      recruitCount: 3,
      roles: ['영상 편집', '기획', '촬영'],
      periodEnd: '2026-10-10',
      meetingSchedule: '주 1회 오프라인',
      deadline: '2026-09-03',
      dDay: 15,
      status: 'RECRUITING',
      imageUrl: null,
      memberId: 4,
      memberName: '하윤',
    },
    participantRoles: {},
    ownerRole: null,
  },
];

export function getDemoUser() {
  return DEMO_USERS[DEMO_USER_ROLE];
}
