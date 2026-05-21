import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { getLevel } from "../../utils/eloLevel"
import { leaderboardApi } from "../../services/leaderboardApi"
import './LeaderBoard.css'

const LeaderboardPage = () => {
  const [players, setPlayers] = useState([])
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()

  useEffect(() => {
    leaderboardApi.get()
      .then(data => {
        setPlayers(data)
        setLoading(false)
      })
  }, [])

  if (loading) return <div className="leaderboard__loading">Загрузка...</div>

  return (
    <div className="leaderboard">
      <h1 className="leaderboard__title">Таблица лидеров</h1>

      <div className="leaderboard__table">
        <div className="leaderboard__header-row">
          <span>#</span>
          <span>Игрок</span>
          <span>Уровень</span>
          <span>ELO</span>
        </div>

        {players.map((player, index) => {
          const { level, color } = getLevel(player.elo)
          return (
            <div
              key={player.id}
              className={`leaderboard__row ${index < 3 ? "leaderboard__row--top" : ""}`}
              onClick={() => navigate(`/players/${player.id}`)}
            >
              <span className={`leaderboard__rank rank--${index + 1}`}>
                {index === 0 ? "🥇" : index === 1 ? "🥈" : index === 2 ? "🥉" : index + 1}
              </span>
              <div className="leaderboard__player">
                <div className="leaderboard__avatar">
                  {player.username.slice(0, 2).toUpperCase()}
                </div>
                <span className="leaderboard__username">{player.username}</span>
              </div>
              <span
                className="leaderboard__level"
                style={{ backgroundColor: color }}
              >
                {level}
              </span>
              <span className="leaderboard__elo">{player.elo}</span>
            </div>
          )
        })}
      </div>
    </div>
  )
}

export default LeaderboardPage