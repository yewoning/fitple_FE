/**
 * POST /api/applications/ai-generate
 */
export interface ApplicationAiGenerateRequest {
  rawIntroText: string;
}

export interface ApplicationAiGenerateResponse {
  introText: string;
}

/**
 * POST /api/projects/{projectId}/applications?memberId=
 */
export interface SubmitApplicationRequest {
  introText: string;
}

export interface SubmitApplicationResponse {
  applicationId: number;
  status: string;
  // 목업(mock-only) 전용 확장 필드. 실제 API는 이 필드를 주지 않으며, 그 경우
  // 지원=즉시 참여 시뮬레이션과 팀 결성 화면 이동은 동작하지 않는다.
  isTeamComplete?: boolean;
}

/**
 * GET /api/users/me/introductions?memberId=
 */
export interface IntroductionListItem {
  introductionId: number;
  title: string;
}

/**
 * GET /api/projects/{projectId}/applications — 게시자 본인만 조회 가능
 */
export interface ProjectApplicationItem {
  applicationId: number;
  memberId: number;
  memberName: string;
  introText: string;
  /** PENDING | ACCEPTED | REJECTED */
  status: string;
}
