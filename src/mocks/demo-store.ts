import { createStore } from 'zustand/vanilla';
import { mockChatProjects, mockTodayTasks } from '@/api/mockData';
import { DEMO_PROJECTS, DEMO_USERS, getDemoUser, type DemoProjectRecord } from '@/mocks/fixtures';
import type {
  MyApplicationItem,
  ProjectApplicationItem,
  SubmitApplicationRequest,
  SubmitApplicationResponse,
} from '@/types/application';
import type { MemberProfile } from '@/types/member';
import type { TodayTaskListItem } from '@/types/task';
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
  appliedAt: string;
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
  acceptApplication: (projectId: number, applicationId: number) => void;
  rejectApplication: (projectId: number, applicationId: number) => void;
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

function toIsoDate(date: Date) {
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${date.getFullYear()}-${month}-${day}`;
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
      dday: toDDay(payload.deadline),
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
                dday: payload.deadline ? toDDay(payload.deadline) : project.detail.dday,
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
      appliedAt: toIsoDate(new Date()),
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
  // 게시자가 지원을 수락하면 상태를 바꾸고 아직 팀원이 아니면 등록한다.
  // (mock에서는 submitApplication이 이미 즉시 등록하므로 대개 상태만 바뀐다 — mock-data-guide 참고)
  acceptApplication: (projectId, applicationId) => {
    const target = get().applications.find(
      (application) =>
        application.applicationId === applicationId && application.projectId === projectId,
    );
    if (!target) return;

    set((state) => ({
      applications: state.applications.map((application) =>
        application.applicationId === applicationId
          ? { ...application, status: 'ACCEPTED' }
          : application,
      ),
      projects: state.projects.map((project) =>
        project.detail.projectId === projectId
          ? {
              ...project,
              participantRoles: {
                ...project.participantRoles,
                [target.memberId]: project.participantRoles[target.memberId] ?? null,
              },
            }
          : project,
      ),
    }));
  },
  rejectApplication: (projectId, applicationId) => {
    set((state) => ({
      applications: state.applications.map((application) =>
        application.applicationId === applicationId && application.projectId === projectId
          ? { ...application, status: 'REJECTED' }
          : application,
      ),
    }));
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
      dday: detail.dday,
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
      dday: project.detail.dday,
      status: project.detail.status,
    }));
}

/** 오늘 기준 offsetDays일 뒤 날짜를 'YYYY-MM-DD'로 만든다. */
function toRelativeDueDate(offsetDays: number): string {
  const now = new Date();
  const target = new Date(now.getFullYear(), now.getMonth(), now.getDate() + offsetDays);
  const month = String(target.getMonth() + 1).padStart(2, '0');
  const day = String(target.getDate()).padStart(2, '0');
  return `${target.getFullYear()}-${month}-${day}`;
}

/**
 * 홈 '오늘의 과제'(GET /api/tasks/today) 목업.
 *
 * 마이페이지와 같은 원본(mockTodayTasks)에서 파생시켜 mock-only에서 두 화면이 어긋나지 않게 한다.
 * 원본 dueDate는 고정 날짜라 시간이 지나면 전부 마감 경과가 되는데, 이 엔드포인트는 '마감이
 * 지나지 않은 것만'이 계약이라 그대로 쓰면 홈 과제 섹션이 빈 채로 나온다. 그래서 dueDate를
 * 오늘 기준 상대 날짜로 다시 만들고 D-day 임박순으로 정렬해 실제 응답을 재현한다.
 *
 * 실제 API와 달리 memberId로 거르지 않는다 — 원본의 담당자가 memberId 1 한 명뿐이라
 * applicant(2)로 거르면 목록이 비어버린다.
 */
export function getDemoTodayTasks(): TodayTaskListItem[] {
  return mockTodayTasks
    .map((task, index) => {
      const dueDate = toRelativeDueDate(index % 4);
      // 원본 과제에는 projectId가 없어서 채팅 목업의 프로젝트명으로 역추적한다.
      // 못 찾으면 0으로 두고, 그 카드는 이동 링크 없이 표시된다.
      const chatProject = mockChatProjects.find(
        (candidate) => candidate.projectName === task.projectName,
      );
      return {
        taskId: task.taskId,
        projectId: task.projectId ?? chatProject?.projectId ?? 0,
        projectName: task.projectName,
        title: task.title,
        dueDate,
        status: task.status,
        dday: toDDay(dueDate),
      };
    })
    .sort((a, b) => a.dday - b.dday);
}

export function getDemoProject(projectId: string | number): ProjectDetailResponse {
  const numericId = Number(projectId);
  const project = demoStore.getState().projects.find((candidate) => candidate.detail.projectId === numericId);

  if (!project) {
    throw new Error(`목업 프로젝트를 찾을 수 없습니다: ${projectId}`);
  }

  return { ...project.detail, roles: [...project.detail.roles] };
}

/** 내 지원 목록. 실제 API의 ApplicationMyResponse와 같은 모양으로 맞춘다. */
export function getDemoMyApplications(memberId: number): MyApplicationItem[] {
  const state = demoStore.getState();

  return state.applications
    .filter((application) => application.memberId === memberId)
    .map((application) => {
      const detail = state.projects.find(
        (project) => project.detail.projectId === application.projectId,
      )?.detail;

      return {
        applicationId: application.applicationId,
        projectId: application.projectId,
        projectTitle: detail?.title ?? '',
        roles: detail ? [...detail.roles] : [],
        projectStatus: detail?.status ?? 'RECRUITING',
        imageUrl: detail?.imageUrl ?? null,
        dday: detail?.dday ?? detail?.dDay ?? 0,
        status: application.status,
        appliedAt: application.appliedAt,
      };
    });
}

/** 게시자용 지원자 목록. 실제 API의 ApplicationResponse와 같은 모양으로 맞춘다. */
export function getDemoProjectApplications(projectId: number): ProjectApplicationItem[] {
  return demoStore
    .getState()
    .applications.filter((application) => application.projectId === projectId)
    .map((application) => ({
      applicationId: application.applicationId,
      memberId: application.memberId,
      memberName: getDemoMemberProfile(application.memberId).name,
      introText: application.introText,
      status: application.status,
    }));
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
