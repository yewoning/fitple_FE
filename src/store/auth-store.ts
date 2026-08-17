import { create } from 'zustand';

interface AuthState {
  isAuthenticated: boolean;
  loginId: string | null;
  authenticate: (loginId: string) => void;
  clearAuthentication: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  isAuthenticated: false,
  loginId: null,
  authenticate: (loginId) => set({ isAuthenticated: true, loginId }),
  clearAuthentication: () => set({ isAuthenticated: false, loginId: null }),
}));
