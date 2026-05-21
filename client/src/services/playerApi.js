import { api } from "./apiClient"

export const playerApi = {
  getAll: () => api.get("/auth/players"),
  getById: (id) => api.get(`/auth/players/${id}`),
}
