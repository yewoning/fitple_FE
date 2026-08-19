import { requestRaw } from '@/services/api-client';
import { demoStore, getDemoMyApplications, getDemoProjectApplications } from '@/mocks/demo-store';
import { withDemoFallback } from '@/services/demo-fallback';
import type {
  ApplicationAiGenerateRequest,
  ApplicationAiGenerateResponse,
  IntroductionListItem,
  MyApplicationItem,
  ProjectApplicationItem,
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

/**
 * 내가 지원한 전체 목록. 지원 현황 화면과 프로젝트 상세의 중복지원 판정이 함께 쓴다.
 * 스펙상 파라미터가 없지만(세션 기반) 다른 호출부와 동일하게 memberId를 붙여 보낸다.
 */
export function getMyApplications(memberId: number) {
  return withDemoFallback(
    () => requestRaw<MyApplicationItem[]>(`/api/applications/my?memberId=${memberId}`),
    () => getDemoMyApplications(memberId),
  );
}

/**
 * 게시자용 지원자 관리 API 3종.
 * 생성된 api.json에는 memberId 파라미터가 없지만 백엔드 문서에는 명시돼 있고,
 * 기존 submitApplication도 붙여 보내고 있어 컨벤션을 맞춰 함께 전달한다.
 */
export function getProjectApplications(projectId: string | number, memberId: number) {
  return withDemoFallback(
    () =>
      requestRaw<ProjectApplicationItem[]>(
        `/api/projects/${projectId}/applications?memberId=${memberId}`,
      ),
    () => getDemoProjectApplications(Number(projectId)),
  );
}

export function acceptApplication(
  projectId: string | number,
  applicationId: number,
  memberId: number,
) {
  return withDemoFallback(
    () =>
      requestRaw<undefined>(
        `/api/projects/${projectId}/applications/${applicationId}/accept?memberId=${memberId}`,
        { method: 'POST' },
      ),
    () => demoStore.getState().acceptApplication(Number(projectId), applicationId),
  );
}

export function rejectApplication(
  projectId: string | number,
  applicationId: number,
  memberId: number,
) {
  return withDemoFallback(
    () =>
      requestRaw<undefined>(
        `/api/projects/${projectId}/applications/${applicationId}/reject?memberId=${memberId}`,
        { method: 'POST' },
      ),
    () => demoStore.getState().rejectApplication(Number(projectId), applicationId),
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
