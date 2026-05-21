import { api } from "./apiClient"

export const authApi = {
  login: (username, password) => api.post("/auth/login", { username, password }),
  register: (username, password) => api.post("/auth/register", { username, password }),
  logout: () => api.post("/auth/logout"),
  getMe: () => api.get("/auth/me"),
}
