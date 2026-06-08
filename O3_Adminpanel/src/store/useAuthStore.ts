import { create } from 'zustand';
import type { AdminUser, Role } from '@/types/auth';

interface AuthState {
  user: AdminUser | null;
  isAuthenticated: boolean;
  login: (user: AdminUser) => void;
  logout: () => void;
  hasRole: (allowedRoles: Role[]) => boolean;
  switchRole: (role: Role) => void;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  isAuthenticated: false,
  login: (user) => set({ user, isAuthenticated: true }),
  logout: () => set({ user: null, isAuthenticated: false }),
  hasRole: (allowedRoles) => {
    const { user } = get();
    if (!user) return false;
    if (user.role === 'Super Admin') return true;
    return allowedRoles.includes(user.role);
  },
  switchRole: (role: Role) => set((state) => {
    if (state.user) {
      return { user: { ...state.user, role } };
    }
    return state;
  })
}));
