import type { ImageSourcePropType } from 'react-native';

export type ProjectStatus = 'recruiting' | 'recruit-closed' | 'in-progress' | 'completed';

export interface ProjectCardData {
  /** 목록 key. 과제 카드에서는 taskId라서 이동 대상 id와 다르다. */
  id: string;
  /**
   * 카드를 눌렀을 때 이동에 쓸 프로젝트 id. 없으면 카드를 누를 수 없는 것으로 본다
   * (버튼처럼 보이는데 아무 일도 일어나지 않는 상태를 만들지 않기 위함).
   */
  linkId?: string;
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
 * D-day 필드 과도기 호환.
 *
 * 백엔드 스펙(api.json)은 모든 응답에서 소문자 `dday`를 쓰지만, 프론트는 그동안 `dDay`를
 * 읽고 있었다. 실제 응답 JSON을 관측하지 못해 어느 쪽이 오는지 확정하지 못했으므로 둘 다
 * 수용한다. 값을 읽을 때는 직접 접근하지 말고 항상 `resolveDDay()`(services/project.ts)를
 * 쓸 것. 백엔드 계약이 확정되면 한쪽을 제거한다.
 */
export interface DDayFields {
  dday?: number;
  dDay?: number;
}

/**
 * GET /api/projects?status=RECRUITING, GET /api/projects/recommended
 */
export interface RecruitingProjectListItem extends DDayFields {
  projectId: number;
  title: string;
  roles: string[];
  status: string;
  imageUrl: string | null;
}

/**
 * GET /api/projects/my?memberId=
 */
export interface MyProjectListItem extends DDayFields {
  projectId: number;
  title: string;
  myRole: string | null;
  status: string;
}

/**
 * GET /api/projects/{projectId}
 */
export interface ProjectDetailResponse extends DDayFields {
  projectId: number;
  title: string;
  introText: string;
  recruitCount: number;
  roles: string[];
  // AI 생성 결과가 그대로 저장되므로 생성 당시 값이 비었으면 조회에서도 null로 내려온다.
  periodEnd: string | null;
  meetingSchedule: string;
  deadline: string | null;
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

/**
 * 서버 원본 응답.
 *
 * 스펙에는 모두 필수로 적혀 있지만, AI가 값을 뽑아내지 못하면 실제로는 null이 내려온다
 * (특히 periodEnd·deadline). 화면이 이 타입을 직접 쓰면 날짜 포맷 단계에서 터지므로
 * 서비스에서 `ProjectAiGenerateResult`로 정규화한 뒤 넘긴다.
 */
export interface ProjectAiGenerateResponse {
  introText: string | null;
  recruitCount: number | null;
  roles: string[] | null;
  periodEnd: string | null;
  meetingSchedule: string | null;
  deadline: string | null;
}

/** 화면이 쓰는 형태. 빈 값은 서비스에서 채워지므로 null이 없다. */
export interface ProjectAiGenerateResult {
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
