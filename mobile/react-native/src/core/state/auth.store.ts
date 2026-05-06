import { create } from 'zustand';
import { tokenManager } from '../auth/tokenManager';

type AuthState = {
  hasCompletedOnboarding: boolean;
  accessToken: string | null;
  setAccessToken: (token: string | null) => void;
  completeOnboarding: () => void;
  logout: () => void;
};

export const useAuthStore = create<AuthState>((set) => ({
  hasCompletedOnboarding: false,
  accessToken: tokenManager.getAccessToken(),
  setAccessToken: (token) => {
    tokenManager.setAccessToken(token);
    set({ accessToken: token });
  },
  completeOnboarding: () => set({ hasCompletedOnboarding: true }),
  logout: () => {
    tokenManager.clearTokens();
    set({ accessToken: null });
  },
}));
