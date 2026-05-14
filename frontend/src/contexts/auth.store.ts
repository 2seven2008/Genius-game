import { create } from "zustand";
import { persist } from "zustand/middleware";
import Cookies from "js-cookie";
import { User, AuthTokens } from "@/types";
import { authApi } from "@/services/api";

interface AuthState {
  user: User | null;
  isLoading: boolean;
  error: string | null;
  isAuthenticated: boolean;

  login: (email: string, password: string) => Promise<void>;
  register: (
    username: string,
    email: string,
    password: string,
  ) => Promise<void>;
  loginAsGuest: () => Promise<void>;
  logout: () => void;
  setUser: (user: User) => void;
  updateStats: (stats: Partial<User>) => void;
  clearError: () => void;
}

function saveTokens(tokens: AuthTokens) {
  Cookies.set("accessToken", tokens.accessToken, {
    expires: 7,
    sameSite: "strict",
  });
  Cookies.set("refreshToken", tokens.refreshToken, {
    expires: 30,
    sameSite: "strict",
  });
}

function clearTokens() {
  Cookies.remove("accessToken");
  Cookies.remove("refreshToken");
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      isLoading: false,
      error: null,
      isAuthenticated: false,

      login: async (email, password) => {
        set({ isLoading: true, error: null });
        try {
          const { data } = await authApi.login(email, password);
          saveTokens(data.tokens);
          set({ user: data.user, isAuthenticated: true, isLoading: false });
        } catch (err: any) {
          set({
            error: err.response?.data?.error || "Erro ao fazer login",
            isLoading: false,
          });
          throw err;
        }
      },

      register: async (username, email, password) => {
        set({ isLoading: true, error: null });
        try {
          const { data } = await authApi.register(username, email, password);
          saveTokens(data.tokens);
          set({ user: data.user, isAuthenticated: true, isLoading: false });
        } catch (err: any) {
          set({
            error: err.response?.data?.error || "Erro ao criar conta",
            isLoading: false,
          });
          throw err;
        }
      },

      loginAsGuest: async () => {
        set({ isLoading: true, error: null });
        try {
          const { data } = await authApi.guest();
          saveTokens(data.tokens);
          set({ user: data.user, isAuthenticated: true, isLoading: false });
        } catch (err: any) {
          set({
            error: err.response?.data?.error || "Erro ao entrar como convidado",
            isLoading: false,
          });
          throw err;
        }
      },

      logout: () => {
        clearTokens();
        set({ user: null, isAuthenticated: false, error: null });
      },

      setUser: (user) => set({ user, isAuthenticated: true }),

      updateStats: (stats) =>
        set((state) => ({
          user: state.user ? { ...state.user, ...stats } : null,
        })),

      clearError: () => set({ error: null }),
    }),
    {
      name: "genius-auth",
      partialState: (state: AuthState) => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated,
      }),
    } as any,
  ),
);
