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
}

/**
 * GET /api/users/me/introductions?memberId=
 */
export interface IntroductionListItem {
  introductionId: number;
  title: string;
}
