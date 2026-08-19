import { requestRaw } from '@/services/api-client';
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
  ProjectCardData,
  ProjectCreateRequest,
  ProjectCreateResponse,
  ProjectDetailResponse,
  ProjectMemberListItem,
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
      requestRaw<undefined>(`/api/projects/${projectId}?memberId=${memberId}`, {
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
      requestRaw<undefined>(`/api/projects/${projectId}?memberId=${memberId}`, {
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

export function generateProjectIntro(payload: ProjectAiGenerateRequest) {
  const form = new FormData();
  form.append('title', payload.title);
  form.append('rawIntroText', payload.rawIntroText);
  if (payload.file) {
    appendFileToFormData(form, 'file', payload.file);
  }

  return withDemoFallback(
    () =>
      requestRaw<ProjectAiGenerateResponse>('/api/projects/ai-generate', {
        method: 'POST',
        body: form,
      }),
    () => generateDemoProjectIntro(payload),
  );
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
      requestRaw<undefined>(
        `/api/mypage/scraps?memberId=${memberId}&projectId=${projectId}`,
        { method: 'POST' },
      ),
    () => demoStore.getState().addScrap(Number(projectId)),
  );
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
