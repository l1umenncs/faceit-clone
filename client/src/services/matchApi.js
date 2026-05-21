import { api } from "./apiClient"

export const matchApi = {
  list: (params) => {
    const query = new URLSearchParams()
    if (params?.game && params.game !== "Все") query.set("game", params.game)
    if (params?.status) query.set("status", params.status)
    const qs = query.toString()
    return api.get(`/matches${qs ? "?" + qs : ""}`)
  },
  getById: (id) => api.get(`/matches/${id}`),
  create: (game, maxPlayers) => api.post("/matches", { game, maxPlayers }),
  join: (id) => api.post(`/matches/${id}/join`),
  leave: (id) => api.post(`/matches/${id}/leave`),
  history: (userId) => api.get(`/matches/history/${userId}`),
}
