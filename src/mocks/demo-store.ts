import { createStore } from 'zustand/vanilla';
import { DEMO_PROJECTS, DEMO_USERS, getDemoUser, type DemoProjectRecord } from '@/mocks/fixtures';
import type { SubmitApplicationRequest, SubmitApplicationResponse } from '@/types/application';
import type { MemberProfile } from '@/types/member';
import type {
  MyProjectListItem,
  ProjectAiGenerateRequest,
  ProjectAiGenerateResponse,
  ProjectCreateRequest,
  ProjectCreateResponse,
  ProjectDetailResponse,
  ProjectUpdateRequest,
  RecruitingProjectListItem,
} from '@/types/project';
import type { ProfileDetail, ProfileFile, ProfileUpdateRequest, ProfileUploadAsset } from '@/types/profile';

interface DemoApplication {
  applicationId: number;
  projectId: number;
  memberId: number;
  introText: string;
  status: string;
}

interface DemoState {
  projects: DemoProjectRecord[];
  applications: DemoApplication[];
  scrappedProjectIds: number[];
  profiles: Record<number, ProfileDetail>;
  nextProjectId: number;
  nextApplicationId: number;
  nextFileId: number;
  createProject: (payload: ProjectCreateRequest, memberId: number) => ProjectCreateResponse;
  updateProject: (projectId: number, payload: ProjectUpdateRequest) => void;
  deleteProject: (projectId: number) => void;
  addScrap: (projectId: number) => void;
  submitApplication: (
    projectId: number,
    memberId: number,
    payload: SubmitApplicationRequest,
  ) => SubmitApplicationResponse;
  updateProfile: (memberId: number, payload: ProfileUpdateRequest) => void;
  addProfileFile: (asset: ProfileUploadAsset) => ProfileFile;
}

function cloneInitialProjects(): DemoProjectRecord[] {
  return DEMO_PROJECTS.map(({ detail, participantRoles }) => ({
    detail: { ...detail, roles: [...detail.roles] },
    participantRoles: { ...participantRoles },
  }));
}

function toDDay(deadline: string) {
  const end = new Date(`${deadline}T00:00:00`).getTime();
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
  return Math.max(0, Math.ceil((end - today) / 86_400_000));
}

export const demoStore = createStore<DemoState>((set, get) => ({
  projects: cloneInitialProjects(),
  applications: [],
  scrappedProjectIds: [],
  profiles: {
    1: { name: DEMO_USERS.owner.name, profileSummary: '아이디어를 실제 서비스로 만드는 기획자입니다.' },
    2: { name: DEMO_USERS.applicant.name, profileSummary: '사용자 경험을 세심하게 설계하는 디자이너입니다.' },
  },
  nextProjectId: 201,
  nextApplicationId: 1,
  nextFileId: 1,
  createProject: (payload, memberId) => {
    const projectId = get().nextProjectId;
    const memberName = getDemoMemberProfile(memberId).name;
    const detail: ProjectDetailResponse = {
      projectId,
      ...payload,
      dDay: toDDay(payload.deadline),
      status: 'RECRUITING',
      memberId,
      memberName,
    };

    set((state) => ({
      projects: [...state.projects, { detail, participantRoles: {} }],
      nextProjectId: projectId + 1,
    }));

    return {
      projectId,
      inviteLink: `https://fitple.demo/invite/${projectId}`,
      qrCodeUrl: `https://fitple.demo/invite/${projectId}`,
    };
  },
  updateProject: (projectId, payload) => {
    set((state) => ({
      projects: state.projects.map((project) =>
        project.detail.projectId === projectId
          ? {
              ...project,
              detail: {
                ...project.detail,
                ...payload,
                roles: payload.roles ?? project.detail.roles,
                dDay: payload.deadline ? toDDay(payload.deadline) : project.detail.dDay,
              },
            }
          : project,
      ),
    }));
  },
  deleteProject: (projectId) => {
    set((state) => ({ projects: state.projects.filter((project) => project.detail.projectId !== projectId) }));
  },
  addScrap: (projectId) => {
    set((state) => ({
      scrappedProjectIds: state.scrappedProjectIds.includes(projectId)
        ? state.scrappedProjectIds
        : [...state.scrappedProjectIds, projectId],
    }));
  },
  submitApplication: (projectId, memberId, payload) => {
    const applicationId = get().nextApplicationId;
    const application: DemoApplication = {
      applicationId,
      projectId,
      memberId,
      introText: payload.introText,
      status: 'PENDING',
    };

    set((state) => ({
      applications: [...state.applications, application],
      nextApplicationId: applicationId + 1,
    }));

    return { applicationId, status: application.status };
  },
  updateProfile: (memberId, payload) => {
    set((state) => ({
      profiles: { ...state.profiles, [memberId]: { ...state.profiles[memberId], ...payload } },
    }));
  },
  addProfileFile: (asset) => {
    const fileId = get().nextFileId;
    set({ nextFileId: fileId + 1 });
    return { fileId, fileUrl: asset.uri, originalName: asset.name };
  },
}));

export function getDemoMemberProfile(memberId: number): MemberProfile {
  const user = Object.values(DEMO_USERS).find((candidate) => candidate.memberId === memberId) ?? getDemoUser();
  return { memberId: user.memberId, name: user.name };
}

export function getDemoProfile(memberId = getDemoUser().memberId): ProfileDetail {
  return demoStore.getState().profiles[memberId] ?? { name: getDemoMemberProfile(memberId).name };
}

export function getDemoRecruitingProjects(): RecruitingProjectListItem[] {
  return demoStore
    .getState()
    .projects.filter((project) => project.detail.status === 'RECRUITING')
    .map(({ detail }) => ({
      projectId: detail.projectId,
      title: detail.title,
      roles: detail.roles,
      dDay: detail.dDay,
      status: detail.status,
      imageUrl: detail.imageUrl,
    }));
}

export function getDemoRecommendedProjects(memberId: number): RecruitingProjectListItem[] {
  return getDemoRecruitingProjects().filter((project) => {
    const detail = demoStore.getState().projects.find((candidate) => candidate.detail.projectId === project.projectId)?.detail;
    return detail?.memberId !== memberId;
  });
}

export function getDemoMyProjects(memberId: number): MyProjectListItem[] {
  return demoStore
    .getState()
    .projects.filter(
      (project) => project.detail.memberId === memberId || project.participantRoles[memberId] !== undefined,
    )
    .map((project) => ({
      projectId: project.detail.projectId,
      title: project.detail.title,
      myRole:
        project.detail.memberId === memberId
          ? '프로젝트 리더'
          : project.participantRoles[memberId] ?? '팀원',
      dDay: project.detail.dDay,
      status: project.detail.status,
    }));
}

export function getDemoProject(projectId: string | number): ProjectDetailResponse {
  const numericId = Number(projectId);
  const project = demoStore.getState().projects.find((candidate) => candidate.detail.projectId === numericId);

  if (!project) {
    throw new Error(`목업 프로젝트를 찾을 수 없습니다: ${projectId}`);
  }

  return { ...project.detail, roles: [...project.detail.roles] };
}

export function generateDemoProjectIntro(payload: ProjectAiGenerateRequest): ProjectAiGenerateResponse {
  return {
    introText: `${payload.rawIntroText.trim()}\n\n${payload.title}의 목표를 구체화하고 각자의 강점을 살려 결과물을 완성해요.`,
    recruitCount: 4,
    roles: ['기획', '디자인', '개발'],
    periodEnd: '2026-10-31',
    meetingSchedule: '주 1회 온라인',
    deadline: '2026-09-15',
  };
}
