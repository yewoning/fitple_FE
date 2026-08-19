import { create } from 'zustand';

export interface ProfileEditDraft {
  name: string;
  profileSummary: string;
  profileImage?: string;
}

interface ProfileEditState {
  draft: ProfileEditDraft | null;
  setDraft: (draft: ProfileEditDraft) => void;
  clearDraft: () => void;
}

export const useProfileEditStore = create<ProfileEditState>((set) => ({
  draft: null,
  setDraft: (draft) => set({ draft }),
  clearDraft: () => set({ draft: null }),
}));
