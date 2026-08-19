import { requestRaw, requestVoid } from '@/services/api-client';
import {
  demoStore,
  generateDemoProjectIntro,
  getDemoMyProjects,
  getDemoProject,
  getDemoProjectMembers,
  getDemoRecommendedProjects,
  getDemoRecruitingProjects,
} from '@/mocks/demo-store';
import { withDemoFallback } from '@/services/demo-fallback';
import type {
  AssignedRole,
  DDayFields,
  MyProjectListItem,
  ProjectAiGenerateRequest,
  ProjectAiGenerateResponse,
  ProjectAiGenerateResult,
  ProjectCardData,
  ProjectCreateRequest,
  ProjectCreateResponse,
  ProjectDetailResponse,
  ProjectMemberListItem,
  ScrapListResponse,
  ProjectStatus,
  ProjectUpdateRequest,
  RecruitingProjectCardData,
  RecruitingProjectListItem,
} from '@/types/project';

export const API_STATUS_TO_PROJECT_STATUS: Record<string, ProjectStatus> = {
  RECRUITING: 'recruiting',
  IN_PROGRESS: 'in-progress',
  CLOSED: 'completed',
};

/**
 * 응답의 D-day를 읽는 유일한 경로. 스펙은 소문자 `dday`지만 과도기 동안 `dDay`도 받는다.
 * 값이 없으면 undefined를 돌려주고, 표시는 호출부가 결정한다(NaN을 만들지 않기 위함).
 */
export function resolveDDay(item: DDayFields): number | undefined {
  if (typeof item.dday === 'number') return item.dday;
  if (typeof item.dDay === 'number') return item.dDay;
  return undefined;
}

function appendFileToFormData(form: FormData, key: string, file: { uri: string; name: string; type: string }) {
  form.append(key, { uri: file.uri, name: file.name, type: file.type } as unknown as Blob);
}

/** AI가 일정을 못 정했을 때 쓸 기본값(오늘 기준 일수). 생성 요청에는 날짜가 반드시 필요하다. */
const AI_FALLBACK_DEADLINE_DAYS = 14;
const AI_FALLBACK_PERIOD_END_DAYS = 60;

function toIsoDateFromToday(offsetDays: number): string {
  const now = new Date();
  const target = new Date(now.getFullYear(), now.getMonth(), now.getDate() + offsetDays);
  const month = String(target.getMonth() + 1).padStart(2, '0');
  const day = String(target.getDate()).padStart(2, '0');
  return `${target.getFullYear()}-${month}-${day}`;
}

/**
 * AI 생성 응답을 화면이 바로 쓸 수 있는 형태로 정규화한다.
 *
 * 스펙과 달리 어떤 필드든 null로 내려올 수 있다. 특히 날짜가 비면 화면이 렌더 중 터지고,
 * 그대로 생성 요청에 실으면 필수 값이 빠진 프로젝트가 만들어진다. 날짜만 기본값으로 채우고
 * 나머지는 빈 값을 유지해, 사용자가 결과 카드에서 '미정'을 보고 재생성할지 판단하게 한다.
 */
function normalizeAiGenerateResult(raw: ProjectAiGenerateResponse): ProjectAiGenerateResult {
  return {
    introText: raw.introText ?? '',
    recruitCount: raw.recruitCount ?? 0,
    roles: raw.roles ?? [],
    periodEnd: raw.periodEnd ?? toIsoDateFromToday(AI_FALLBACK_PERIOD_END_DAYS),
    meetingSchedule: raw.meetingSchedule ?? '',
    deadline: raw.deadline ?? toIsoDateFromToday(AI_FALLBACK_DEADLINE_DAYS),
  };
}

export function getRecruitingProjects() {
  return withDemoFallback(
    () => requestRaw<RecruitingProjectListItem[]>('/api/projects?status=RECRUITING'),
    getDemoRecruitingProjects,
  );
}

export function getRecommendedProjects(memberId: number) {
  return withDemoFallback(
    () =>
      requestRaw<RecruitingProjectListItem[]>(`/api/projects/recommended?memberId=${memberId}`),
    () => getDemoRecommendedProjects(memberId),
  );
}

export function getMyProjects(memberId: number) {
  return withDemoFallback(
    () => requestRaw<MyProjectListItem[]>(`/api/projects/my?memberId=${memberId}`),
    () => getDemoMyProjects(memberId),
  );
}

export function getProject(projectId: string | number) {
  return withDemoFallback(
    () => requestRaw<ProjectDetailResponse>(`/api/projects/${projectId}`),
    () => getDemoProject(projectId),
  );
}

export function createProject(payload: ProjectCreateRequest, memberId: number) {
  return withDemoFallback(
    () =>
      requestRaw<ProjectCreateResponse>(`/api/projects?memberId=${memberId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      }),
    () => demoStore.getState().createProject(payload, memberId),
  );
}

export function updateProject(projectId: string | number, payload: ProjectUpdateRequest, memberId: number) {
  return withDemoFallback(
    () =>
      requestVoid(`/api/projects/${projectId}?memberId=${memberId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      }),
    () => demoStore.getState().updateProject(Number(projectId), payload),
  );
}

export function deleteProject(projectId: string | number, memberId: number) {
  return withDemoFallback(
    () =>
      requestVoid(`/api/projects/${projectId}?memberId=${memberId}`, {
        method: 'DELETE',
      }),
    () => demoStore.getState().deleteProject(Number(projectId)),
  );
}

export function uploadProjectImage(file: { uri: string; name: string; type: string }) {
  const form = new FormData();
  appendFileToFormData(form, 'file', file);

  return withDemoFallback(
    () =>
      requestRaw<{ imageUrl: string }>('/api/projects/image', {
        method: 'POST',
        body: form,
      }),
    () => ({ imageUrl: file.uri }),
  );
}

export async function generateProjectIntro(
  payload: ProjectAiGenerateRequest,
): Promise<ProjectAiGenerateResult> {
  const form = new FormData();
  form.append('title', payload.title);
  form.append('rawIntroText', payload.rawIntroText);
  if (payload.file) {
    appendFileToFormData(form, 'file', payload.file);
  }

  const raw = await withDemoFallback(
    () =>
      requestRaw<ProjectAiGenerateResponse>('/api/projects/ai-generate', {
        method: 'POST',
        body: form,
      }),
    () => generateDemoProjectIntro(payload),
  );

  return normalizeAiGenerateResult(raw);
}

export function getProjectMembers(projectId: string | number) {
  return withDemoFallback(
    () => requestRaw<ProjectMemberListItem[]>(`/api/projects/${projectId}/members`),
    () => getDemoProjectMembers(Number(projectId)),
  );
}

export function assignProjectRoles(projectId: string | number) {
  return withDemoFallback(
    () =>
      requestRaw<AssignedRole[]>(`/api/projects/${projectId}/assign-roles`, {
        method: 'POST',
      }),
    () => demoStore.getState().assignRoles(Number(projectId)),
  );
}

export function addScrap(memberId: number, projectId: string | number) {
  return withDemoFallback(
    () =>
      requestVoid(
        `/api/mypage/scraps?memberId=${memberId}&projectId=${projectId}`,
        { method: 'POST' },
      ),
    () => demoStore.getState().addScrap(Number(projectId)),
  );
}

export function removeScrap(memberId: number, projectId: string | number) {
  return withDemoFallback(
    () =>
      requestVoid(
        `/api/mypage/scraps?memberId=${memberId}&projectId=${projectId}`,
        { method: 'DELETE' },
      ),
    () => demoStore.getState().removeScrap(Number(projectId)),
  );
}

export async function getScrappedProjectIds(memberId: number): Promise<number[]> {
  const scraps = await withDemoFallback(
    () => requestRaw<ScrapListResponse>(`/api/mypage/scraps?memberId=${memberId}`),
    () => ({
      projects: demoStore
        .getState()
        .scrappedProjectIds.map((projectId) => ({ projectId })),
    }),
  );

  return scraps.projects.map((project) => project.projectId);
}

export function toRecruitingProjectCardData(item: RecruitingProjectListItem): RecruitingProjectCardData {
  return {
    id: String(item.projectId),
    projectName: item.title,
    status: API_STATUS_TO_PROJECT_STATUS[item.status] ?? 'recruiting',
    subInfo: item.roles.join(' · '),
    dDay: resolveDDay(item),
    imageUrl: item.imageUrl,
  };
}

export function toProjectCardData(item: RecruitingProjectListItem): ProjectCardData {
  return {
    id: String(item.projectId),
    linkId: String(item.projectId),
    projectName: item.title,
    status: API_STATUS_TO_PROJECT_STATUS[item.status] ?? 'recruiting',
    subInfo: item.roles.join(' · '),
    dDay: resolveDDay(item),
  };
}

export function toMyProjectCardData(item: MyProjectListItem): ProjectCardData {
  return {
    id: String(item.projectId),
    linkId: String(item.projectId),
    projectName: item.title,
    status: API_STATUS_TO_PROJECT_STATUS[item.status] ?? 'recruiting',
    subInfo: item.myRole ?? '역할 미배정',
    dDay: resolveDDay(item),
  };
}
