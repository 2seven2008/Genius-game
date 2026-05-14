import axios, { AxiosInstance, InternalAxiosRequestConfig } from "axios";
import Cookies from "js-cookie";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3100";

const api: AxiosInstance = axios.create({
  baseURL: `${API_URL}/api`,
  timeout: 10000,
  headers: { "Content-Type": "application/json" },
});

// Attach access token to every request
api.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const token = Cookies.get("accessToken");
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Auto-refresh on 401
api.interceptors.response.use(
  (res) => res,
  async (error) => {
    const original = error.config;
    if (error.response?.status === 401 && !original._retry) {
      original._retry = true;
      const refreshToken = Cookies.get("refreshToken");
      if (refreshToken) {
        try {
          const { data } = await axios.post(`${API_URL}/api/auth/refresh`, {
            refreshToken,
          });
          Cookies.set("accessToken", data.tokens.accessToken, { expires: 7 });
          original.headers.Authorization = `Bearer ${data.tokens.accessToken}`;
          return api(original);
        } catch {
          Cookies.remove("accessToken");
          Cookies.remove("refreshToken");
          window.location.href = "/";
        }
      }
    }
    return Promise.reject(error);
  },
);

export default api;

// Auth
export const authApi = {
  register: (username: string, email: string, password: string) =>
    api.post("/auth/register", { username, email, password }),
  login: (email: string, password: string) =>
    api.post("/auth/login", { email, password }),
  guest: () => api.post("/auth/guest"),
  refresh: (refreshToken: string) =>
    api.post("/auth/refresh", { refreshToken }),
};

// Rooms
export const roomApi = {
  create: (isPublic: boolean, maxPlayers: number) =>
    api.post("/rooms", { isPublic, maxPlayers }),
  getPublic: (limit = 10) => api.get(`/rooms/public?limit=${limit}`),
  getByCode: (code: string) => api.get(`/rooms/${code}`),
};

// Scores
export const scoreApi = {
  save: (score: number, level: number) =>
    api.post("/scores/save", { score, level }),
  rankingByWins: (limit = 20) => api.get(`/scores/ranking/wins?limit=${limit}`),
  rankingByScore: (limit = 20) =>
    api.get(`/scores/ranking/score?limit=${limit}`),
  me: () => api.get("/scores/me"),
};
