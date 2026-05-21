import { api } from "./apiClient"

export const leaderboardApi = {
  get: () => api.get("/auth/leaderboard"),
}
