import type { ImageSourcePropType } from 'react-native';

export type ProjectStatus = 'recruiting' | 'recruit-closed' | 'in-progress' | 'completed';

export interface ProjectCardData {
  id: string;
  projectName: string;
  status: ProjectStatus;
  subInfo: string;
  deadline?: string;
  dDay?: number;
}

export interface RecruitingProjectCardData {
  id: string;
  projectName: string;
  status: ProjectStatus;
  subInfo?: string;
  deadline?: string;
  dDay?: number;
  icon?: ImageSourcePropType;
  imageUrl?: string | null;
}

export interface ProjectDetailInfoRow {
  label: string;
  value: string;
}

/**
 * GET /api/projects?status=RECRUITING, GET /api/projects/recommended
 */
export interface RecruitingProjectListItem {
  projectId: number;
  title: string;
  roles: string[];
  dDay: number;
  status: string;
  imageUrl: string | null;
}

/**
 * GET /api/projects/my?memberId=
 */
export interface MyProjectListItem {
  projectId: number;
  title: string;
  myRole: string | null;
  dDay: number;
  status: string;
}

/**
 * GET /api/projects/{projectId}
 */
export interface ProjectDetailResponse {
  projectId: number;
  title: string;
  introText: string;
  recruitCount: number;
  roles: string[];
  periodEnd: string;
  meetingSchedule: string;
  deadline: string;
  dDay: number;
  status: string;
  imageUrl: string | null;
  memberId: number;
  memberName: string;
}

/**
 * POST /api/projects/ai-generate (multipart/form-data)
 */
export interface ProjectAiGenerateRequest {
  title: string;
  rawIntroText: string;
  file?: { uri: string; name: string; type: string };
}

export interface ProjectAiGenerateResponse {
  introText: string;
  recruitCount: number;
  roles: string[];
  periodEnd: string;
  meetingSchedule: string;
  deadline: string;
}

/**
 * POST /api/projects?memberId=
 */
export interface ProjectCreateRequest {
  title: string;
  introText: string;
  recruitCount: number;
  roles: string[];
  periodEnd: string;
  meetingSchedule: string;
  deadline: string;
  imageUrl: string | null;
}

export interface ProjectCreateResponse {
  projectId: number;
  inviteLink: string;
  qrCodeUrl: string;
}

/**
 * PUT /api/projects/{projectId}?memberId= — 보낸 필드만 수정
 */
export type ProjectUpdateRequest = Partial<ProjectCreateRequest>;

/**
 * GET /api/projects/{projectId}/members
 */
export interface ProjectMemberListItem {
  memberId: number;
  name: string;
  role: string | null;
  detailRole?: string;
}

/**
 * POST /api/projects/{projectId}/assign-roles
 */
export interface AssignedRole {
  memberId: number;
  name: string;
  role: string;
  reason: string;
}
