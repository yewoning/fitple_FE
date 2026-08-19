import { requestRaw, requestVoid } from '@/services/api-client';
import {
  demoStore,
  generateDemoProjectIntro,
  getDemoMyProjects,
  getDemoProject,
  getDemoProjectMembers,
  getDemoRecommendedProjects,
  getDemoRecruitingProjects,
  getDemoScraps,
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

// StatusBadge(components/project-card.tsx)가 쓰는 한글 라벨과 맞춰뒀다. "모집중"은 스크랩 API의 실제
// 응답에서 확인됐고, 나머지는 그 라벨 세트를 그대로 따른다는 가정이라 백엔드팀 확인이 필요하다.
const STATUS_LABEL_TO_PROJECT_STATUS: Record<string, ProjectStatus> = {
  모집중: 'recruiting',
  모집완료: 'recruit-closed',
  진행중: 'in-progress',
  완료: 'completed',
};

/**
 * 응답의 프로젝트 상태를 읽는 유일한 경로.
 *
 * 같은 '상태'를 엔드포인트마다 다른 형태로 준다. 목록·상세는 "RECRUITING" 같은 영문 enum이지만
 * 스크랩 목록은 "모집중" 같은 한글 라벨이다(아래 ScrapProjectItem 주석 참고). 한쪽 표기만 아는 채로
 * 비교하면 '진행중'인 프로젝트를 모집중으로 오인해 화면에서 사라진다. 두 표기를 모두 받아들이고,
 * 모르는 값이면 undefined를 돌려 호출부가 기본값을 정하게 한다.
 */
export function normalizeProjectStatus(raw: string | null | undefined): ProjectStatus | undefined {
  if (!raw) return undefined;
  return API_STATUS_TO_PROJECT_STATUS[raw] ?? STATUS_LABEL_TO_PROJECT_STATUS[raw];
}

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

/**
 * GET /api/mypage/scraps?memberId= — 내가 스크랩한 프로젝트 목록.
 *
 * ⚠️ 실제 응답은 api.json 문서의 ScrapListResponse(ProjectResponse[])와 필드가 완전히 다르다.
 * 실제로 관측된 응답: { projects: [{ projectId, title, recruitRoles, recruitStatus(한글
 * 라벨, 예: "모집중"), dDay(이미 "D-14" 형태 문자열), projectIconUrl }] }.
 * RecruitingProjectListItem(roles/status/imageUrl/dday)과 이름이 달라서 그대로 재사용하면
 * roles.join 같은 곳에서 터진다. 여기서만 쓰는 별도 타입 + 변환 함수(toScrapCardData)로 처리한다.
 */
export interface ScrapProjectItem {
  projectId: number;
  title: string;
  recruitRoles: string[];
  recruitStatus: string;
  dDay: string | null;
  projectIconUrl: string | null;
}

/** "D-14" / "D-DAY" / "D+3" → 14 / 0 / -3. 형식이 다르면 undefined. */
function parseDDayLabel(label: string | null | undefined): number | undefined {
  if (!label) return undefined;
  if (label === 'D-DAY') return 0;
  const match = label.match(/^D([+-])(\d+)$/);
  if (!match) return undefined;
  const value = Number(match[2]);
  return match[1] === '-' ? value : -value;
}

export function toScrapCardData(item: ScrapProjectItem): RecruitingProjectCardData {
  return {
    id: String(item.projectId),
    projectName: item.title,
    status: normalizeProjectStatus(item.recruitStatus) ?? 'recruiting',
    subInfo: (item.recruitRoles ?? []).join(' · '),
    dDay: parseDDayLabel(item.dDay),
    imageUrl: item.projectIconUrl,
  };
}

export function getScraps(memberId: number) {
  return withDemoFallback(
    async () => {
      const { projects } = await requestRaw<{ projects: ScrapProjectItem[] }>(
        `/api/mypage/scraps?memberId=${memberId}`,
      );
      return projects ?? [];
    },
    () => getDemoScraps(),
  );
}

export function toRecruitingProjectCardData(item: RecruitingProjectListItem): RecruitingProjectCardData {
  return {
    id: String(item.projectId),
    projectName: item.title,
    status: normalizeProjectStatus(item.status) ?? 'recruiting',
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
    status: normalizeProjectStatus(item.status) ?? 'recruiting',
    subInfo: item.roles.join(' · '),
    dDay: resolveDDay(item),
  };
}

export function toMyProjectCardData(item: MyProjectListItem): ProjectCardData {
  return {
    id: String(item.projectId),
    linkId: String(item.projectId),
    projectName: item.title,
    status: normalizeProjectStatus(item.status) ?? 'recruiting',
    subInfo: item.myRole ?? '역할 미배정',
    dDay: resolveDDay(item),
  };
}

/** D-day 오름차순. 값이 없는 항목은 뒤로 보낸다(앞에서 잘라도 급한 것이 남게). */
function sortByDDayAsc(projects: ProjectCardData[]): ProjectCardData[] {
  return [...projects].sort((a, b) => (a.dDay ?? Number.POSITIVE_INFINITY) - (b.dDay ?? Number.POSITIVE_INFINITY));
}

/**
 * 홈 '현재 진행중인 프로젝트' 섹션에 보여줄 목록.
 *
 * /api/projects/my는 모집중·완료까지 포함한 '내 프로젝트 전체'를 준다. 그런데 서버에는 아직
 * RECRUITING → IN_PROGRESS 전이가 없어서(2026-08 기준 전체 프로젝트가 RECRUITING,
 * /api/projects?status=IN_PROGRESS는 빈 배열) 상태로만 거르면 이 섹션이 항상 비어버린다.
 * 그동안은 '완료'가 아닌 내 프로젝트를 대신 보여주고, 서버가 전이를 구현하는 순간
 * 위 필터가 이겨서 이 폴백은 저절로 꺼진다.
 */
export async function getMyOngoingProjects(memberId: number): Promise<ProjectCardData[]> {
  const projects = (await getMyProjects(memberId)).map(toMyProjectCardData);
  const inProgress = projects.filter((project) => project.status === 'in-progress');
  const notCompleted = projects.filter((project) => project.status !== 'completed');

  return sortByDDayAsc(inProgress.length > 0 ? inProgress : notCompleted);
}
