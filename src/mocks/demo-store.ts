import { createStore } from 'zustand/vanilla';
import { DEMO_PROJECTS, DEMO_USERS, getDemoUser, type DemoProjectRecord } from '@/mocks/fixtures';
import type { SubmitApplicationRequest, SubmitApplicationResponse } from '@/types/application';
import type { MemberProfile } from '@/types/member';
import type {
  AssignedRole,
  MyProjectListItem,
  ProjectAiGenerateRequest,
  ProjectAiGenerateResponse,
  ProjectCreateRequest,
  ProjectCreateResponse,
  ProjectDetailResponse,
  ProjectMemberListItem,
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
  assignRoles: (projectId: number) => AssignedRole[];
  updateProfile: (memberId: number, payload: ProfileUpdateRequest) => void;
  addProfileFile: (asset: ProfileUploadAsset) => ProfileFile;
}

function cloneInitialProjects(): DemoProjectRecord[] {
  return DEMO_PROJECTS.map(({ detail, participantRoles, ownerRole }) => ({
    detail: { ...detail, roles: [...detail.roles] },
    participantRoles: { ...participantRoles },
    ownerRole,
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
      projects: [...state.projects, { detail, participantRoles: {}, ownerRole: null }],
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

    // 목업(mock-only) 전용 시뮬레이션: 실제 백엔드는 게시자가 지원을 수락해야 팀원으로
    // 등록되지만, 데모에서는 지원 제출 = 즉시 참여로 처리한다.
    let isTeamComplete = false;
    set((state) => ({
      applications: [...state.applications, application],
      nextApplicationId: applicationId + 1,
      projects: state.projects.map((project) => {
        if (project.detail.projectId !== projectId) return project;
        const participantRoles = {
          ...project.participantRoles,
          [memberId]: project.participantRoles[memberId] ?? null,
        };
        isTeamComplete = Object.keys(participantRoles).length >= project.detail.recruitCount;
        return { ...project, participantRoles };
      }),
    }));

    return { applicationId, status: application.status, isTeamComplete };
  },
  assignRoles: (projectId) => {
    const project = get().projects.find((candidate) => candidate.detail.projectId === projectId);
    if (!project) {
      throw new Error(`목업 프로젝트를 찾을 수 없습니다: ${projectId}`);
    }

    const roles = project.detail.roles.length > 0 ? project.detail.roles : ['팀원'];
    const memberIds = [project.detail.memberId, ...Object.keys(project.participantRoles).map(Number)];

    const assignments: AssignedRole[] = memberIds.map((memberId, index) => {
      const name =
        memberId === project.detail.memberId
          ? project.detail.memberName
          : getDemoMemberProfile(memberId).name;
      const role = roles[index % roles.length];
      return {
        memberId,
        name,
        role,
        reason: `${name}님은 '${role}' 역할에 배정되었어요. 프로필과 팀 구성을 고려해 핏봇이 추천한 역할이에요.`,
      };
    });

    set((state) => ({
      projects: state.projects.map((candidate) => {
        if (candidate.detail.projectId !== projectId) return candidate;
        const ownerAssignment = assignments.find((a) => a.memberId === candidate.detail.memberId);
        const participantRoles = { ...candidate.participantRoles };
        assignments.forEach((assignment) => {
          if (assignment.memberId !== candidate.detail.memberId) {
            participantRoles[assignment.memberId] = assignment.role;
          }
        });
        return {
          ...candidate,
          ownerRole: ownerAssignment?.role ?? candidate.ownerRole,
          participantRoles,
        };
      }),
    }));

    return assignments;
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

export function getDemoProjectMembers(projectId: number): ProjectMemberListItem[] {
  const project = demoStore.getState().projects.find((candidate) => candidate.detail.projectId === projectId);

  if (!project) {
    throw new Error(`목업 프로젝트를 찾을 수 없습니다: ${projectId}`);
  }

  const owner: ProjectMemberListItem = {
    memberId: project.detail.memberId,
    name: project.detail.memberName,
    role: project.ownerRole,
  };

  const members: ProjectMemberListItem[] = Object.entries(project.participantRoles).map(
    ([memberId, role]) => ({
      memberId: Number(memberId),
      name: getDemoMemberProfile(Number(memberId)).name,
      role,
    }),
  );

  return [owner, ...members];
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
