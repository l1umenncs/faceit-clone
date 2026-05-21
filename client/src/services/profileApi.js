import { api } from "./apiClient"

export const profileApi = {
  update: (data) => api.put("/auth/profile", data),
}
