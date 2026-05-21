import { api } from "./apiClient"

export const friendApi = {
  sendRequest: (userId) => api.post(`/friends/request/${userId}`),
  acceptRequest: (userId) => api.post(`/friends/accept/${userId}`),
  rejectRequest: (userId) => api.post(`/friends/reject/${userId}`),
  removeFriend: (userId) => api.delete(`/friends/${userId}`),
  getFriends: () => api.get("/friends"),
  getUserFriends: (userId) => api.get(`/friends/user/${userId}`),
  getStatus: (userId) => api.get(`/friends/status/${userId}`),
  getPending: () => api.get("/friends/pending"),
}
