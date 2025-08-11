import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { User, Role, Permission } from '@/types';
import { mockCredentials, mockUsers } from '@/mocks/data/users';

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

interface AuthActions {
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  setUser: (user: User) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  hasPermission: (resource: string, action: string) => boolean;
  hasRole: (roleName: string) => boolean;
  refreshToken: () => Promise<void>;
}

type AuthStore = AuthState & AuthActions;

export const useAuthStore = create<AuthStore>()(
  persist(
    (set, get) => ({
      // State
      user: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,

      // Actions
      login: async (email: string, password: string) => {
        set({ isLoading: true, error: null });

        try {
          console.log('Auth Store: Attempting login with email:', email);

          // Try MSW first, then fallback to direct mock
          let response: Response;
          let data: any;

          try {
            // Mock API call - replace with actual API
            response = await fetch('/api/auth/login', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({ email, password }),
            });

            console.log('Auth Store: Response status:', response.status);
            console.log('Auth Store: Response ok:', response.ok);

            if (response.ok) {
              data = await response.json();
              console.log('Auth Store: MSW Success response data:', data);
            } else {
              throw new Error('MSW request failed');
            }
          } catch (fetchError) {
            console.log('Auth Store: MSW failed, using direct mock fallback');

            // Direct mock fallback when MSW is not working
            const validCredential = mockCredentials.find(
              cred => cred.email === email && cred.password === password
            );

            if (!validCredential) {
              throw new Error('Invalid credentials');
            }

            const user = mockUsers.find(u => u.email === email);
            if (!user) {
              throw new Error('User not found');
            }

            data = {
              user,
              accessToken: `mock-token-${user.id}-${Date.now()}`,
              message: 'Login successful',
            };
            console.log('Auth Store: Direct mock success:', data);
          }

          const user: User = data.user;

          set({
            user,
            isAuthenticated: true,
            isLoading: false,
            error: null,
          });
        } catch (error) {
          console.error('Auth Store: Login error:', error);
          set({
            error: error instanceof Error ? error.message : 'Login failed',
            isLoading: false,
          });
          throw error;
        }
      },

      logout: () => {
        // Clear auth state
        set({
          user: null,
          isAuthenticated: false,
          error: null,
        });

        // Call logout API
        fetch('/api/auth/logout', {
          method: 'POST',
        }).catch(console.error);
      },

      setUser: (user: User) => {
        set({ user, isAuthenticated: true });
      },

      setLoading: (loading: boolean) => {
        set({ isLoading: loading });
      },

      setError: (error: string | null) => {
        set({ error });
      },

      hasPermission: (resource: string, action: string) => {
        const { user } = get();
        if (!user) return false;

        // Check direct permissions
        const hasDirectPermission = user.permissions.some(
          (permission) =>
            permission.resource === resource && permission.action === action
        );

        if (hasDirectPermission) return true;

        // Check role-based permissions
        const hasRolePermission = user.roles.some((role) =>
          role.permissions.some(
            (permission) =>
              permission.resource === resource && permission.action === action
          )
        );

        return hasRolePermission;
      },

      hasRole: (roleName: string) => {
        const { user } = get();
        if (!user) return false;

        return user.roles.some((role) => role.name === roleName);
      },

      refreshToken: async () => {
        try {
          const response = await fetch('/api/auth/refresh', {
            method: 'POST',
          });

          if (!response.ok) {
            throw new Error('Token refresh failed');
          }

          const data = await response.json();
          if (data.user) {
            set({ user: data.user, isAuthenticated: true });
          }
        } catch (error) {
          console.error('Token refresh failed:', error);
          get().logout();
        }
      },
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);
