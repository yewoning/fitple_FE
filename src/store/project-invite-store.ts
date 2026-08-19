import { create } from 'zustand';

interface ProjectInvite {
  inviteLink: string;
  qrCodeUrl: string;
}

interface ProjectInviteState {
  invites: Record<string, ProjectInvite>;
  setInvite: (projectId: string, invite: ProjectInvite) => void;
}

/**
 * 프로젝트 상세 조회(1-6) 응답에는 inviteLink/qrCodeUrl이 없어서,
 * 생성 직후 응답값을 임시로 기억해뒀다가 상세 화면의 공유 아이콘에서 재사용한다.
 */
export const useProjectInviteStore = create<ProjectInviteState>((set) => ({
  invites: {},
  setInvite: (projectId, invite) =>
    set((state) => ({ invites: { ...state.invites, [projectId]: invite } })),
}));
