import { requestRaw } from '@/services/api-client';
import type {
  MyProjectListItem,
  ProjectAiGenerateRequest,
  ProjectAiGenerateResponse,
  ProjectCardData,
  ProjectCreateRequest,
  ProjectCreateResponse,
  ProjectDetailResponse,
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

function appendFileToFormData(form: FormData, key: string, file: { uri: string; name: string; type: string }) {
  form.append(key, { uri: file.uri, name: file.name, type: file.type } as unknown as Blob);
}

export function getRecruitingProjects() {
  return requestRaw<RecruitingProjectListItem[]>('/api/projects?status=RECRUITING');
}

export function getRecommendedProjects(memberId: number) {
  return requestRaw<RecruitingProjectListItem[]>(`/api/projects/recommended?memberId=${memberId}`);
}

export function getMyProjects(memberId: number) {
  return requestRaw<MyProjectListItem[]>(`/api/projects/my?memberId=${memberId}`);
}

export function getProject(projectId: string | number) {
  return requestRaw<ProjectDetailResponse>(`/api/projects/${projectId}`);
}

export function createProject(payload: ProjectCreateRequest, memberId: number) {
  return requestRaw<ProjectCreateResponse>(`/api/projects?memberId=${memberId}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
}

export function updateProject(projectId: string | number, payload: ProjectUpdateRequest, memberId: number) {
  return requestRaw<undefined>(`/api/projects/${projectId}?memberId=${memberId}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
}

export function deleteProject(projectId: string | number, memberId: number) {
  return requestRaw<undefined>(`/api/projects/${projectId}?memberId=${memberId}`, {
    method: 'DELETE',
  });
}

export function uploadProjectImage(file: { uri: string; name: string; type: string }) {
  const form = new FormData();
  appendFileToFormData(form, 'file', file);

  return requestRaw<{ imageUrl: string }>('/api/projects/image', {
    method: 'POST',
    body: form,
  });
}

export function generateProjectIntro(payload: ProjectAiGenerateRequest) {
  const form = new FormData();
  form.append('title', payload.title);
  form.append('rawIntroText', payload.rawIntroText);
  if (payload.file) {
    appendFileToFormData(form, 'file', payload.file);
  }

  return requestRaw<ProjectAiGenerateResponse>('/api/projects/ai-generate', {
    method: 'POST',
    body: form,
  });
}

export function addScrap(memberId: number, projectId: string | number) {
  return requestRaw<undefined>(`/api/mypage/scraps?memberId=${memberId}&projectId=${projectId}`, {
    method: 'POST',
  });
}

export function toRecruitingProjectCardData(item: RecruitingProjectListItem): RecruitingProjectCardData {
  return {
    id: String(item.projectId),
    projectName: item.title,
    status: API_STATUS_TO_PROJECT_STATUS[item.status] ?? 'recruiting',
    subInfo: item.roles.join(' · '),
    dDay: item.dDay,
    imageUrl: item.imageUrl,
  };
}

export function toProjectCardData(item: RecruitingProjectListItem): ProjectCardData {
  return {
    id: String(item.projectId),
    projectName: item.title,
    status: API_STATUS_TO_PROJECT_STATUS[item.status] ?? 'recruiting',
    subInfo: item.roles.join(' · '),
    dDay: item.dDay,
  };
}

export function toMyProjectCardData(item: MyProjectListItem): ProjectCardData {
  return {
    id: String(item.projectId),
    projectName: item.title,
    status: API_STATUS_TO_PROJECT_STATUS[item.status] ?? 'recruiting',
    subInfo: item.myRole ?? '역할 미배정',
    dDay: item.dDay,
  };
}
