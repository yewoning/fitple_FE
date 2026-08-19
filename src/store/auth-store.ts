import { create } from 'zustand';

interface AuthState {
  isAuthenticated: boolean;
  loginId: string | null;
  memberId: number | null;
  authenticate: (loginId: string, memberId?: number) => void;
  clearAuthentication: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  isAuthenticated: false,
  loginId: null,
  memberId: null,
  authenticate: (loginId, memberId) => set({ isAuthenticated: true, loginId, memberId: memberId ?? null }),
  clearAuthentication: () => set({ isAuthenticated: false, loginId: null, memberId: null }),
}));
