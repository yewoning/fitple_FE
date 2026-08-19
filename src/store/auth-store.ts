import { create } from 'zustand';

// 로그인 API가 memberId를 반환하게 되면 authenticate() 인자로 받아 교체할 것.
const TEMP_MEMBER_ID = 1;

interface AuthState {
  isAuthenticated: boolean;
  loginId: string | null;
  memberId: number | null;
  authenticate: (loginId: string) => void;
  clearAuthentication: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  isAuthenticated: false,
  loginId: null,
  memberId: null,
  authenticate: (loginId) => set({ isAuthenticated: true, loginId, memberId: TEMP_MEMBER_ID }),
  clearAuthentication: () => set({ isAuthenticated: false, loginId: null, memberId: null }),
}));
