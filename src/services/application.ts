import { requestRaw } from '@/services/api-client';
import { demoStore } from '@/mocks/demo-store';
import { withDemoFallback } from '@/services/demo-fallback';
import type {
  ApplicationAiGenerateRequest,
  ApplicationAiGenerateResponse,
  IntroductionListItem,
  SubmitApplicationRequest,
  SubmitApplicationResponse,
} from '@/types/application';

export function generateApplicationIntro(payload: ApplicationAiGenerateRequest) {
  return withDemoFallback(
    () =>
      requestRaw<ApplicationAiGenerateResponse>('/api/applications/ai-generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      }),
    () => ({
      introText: `${payload.rawIntroText.trim()}\n\n맡은 역할을 책임감 있게 수행하며 팀과 적극적으로 소통하겠습니다.`,
    }),
  );
}

export function submitApplication(
  projectId: string | number,
  memberId: number,
  payload: SubmitApplicationRequest
) {
  return withDemoFallback(
    () =>
      requestRaw<SubmitApplicationResponse>(
        `/api/projects/${projectId}/applications?memberId=${memberId}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        },
      ),
    () => demoStore.getState().submitApplication(Number(projectId), memberId, payload),
  );
}

export function getMyIntroductions(memberId: number) {
  return withDemoFallback(
    () =>
      requestRaw<{ introductions: IntroductionListItem[] }>(
        `/api/users/me/introductions?memberId=${memberId}`,
      ),
    () => ({
      introductions: demoStore
        .getState()
        .applications.filter((application) => application.memberId === memberId)
        .map((application) => ({
          introductionId: application.applicationId,
          title: application.introText,
        })),
    }),
  );
}
