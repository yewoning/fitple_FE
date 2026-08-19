import { requestRaw } from '@/services/api-client';
import type {
  ApplicationAiGenerateRequest,
  ApplicationAiGenerateResponse,
  IntroductionListItem,
  SubmitApplicationRequest,
  SubmitApplicationResponse,
} from '@/types/application';

export function generateApplicationIntro(payload: ApplicationAiGenerateRequest) {
  return requestRaw<ApplicationAiGenerateResponse>('/api/applications/ai-generate', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
}

export function submitApplication(
  projectId: string | number,
  memberId: number,
  payload: SubmitApplicationRequest
) {
  return requestRaw<SubmitApplicationResponse>(`/api/projects/${projectId}/applications?memberId=${memberId}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
}

export function getMyIntroductions(memberId: number) {
  return requestRaw<{ introductions: IntroductionListItem[] }>(
    `/api/users/me/introductions?memberId=${memberId}`
  );
}
