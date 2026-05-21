import { api } from "./apiClient"

export const notificationApi = {
  getAll: () => api.get("/notifications"),
  markRead: (id) => api.post(`/notifications/${id}/read`),
  markAllRead: () => api.post("/notifications/read-all"),
}
