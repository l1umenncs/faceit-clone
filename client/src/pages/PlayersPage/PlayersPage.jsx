import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { getLevel } from "../../utils/eloLevel"
import { playerApi } from "../../services/playerApi"
import { SkeletonCard } from "../../components/Skeleton/Skeleton"
import "./PlayersPage.css"

const PlayersPage = () => {
  const [players, setPlayers] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [search, setSearch] = useState("")
  const [eloMin, setEloMin] = useState("")
  const [eloMax, setEloMax] = useState("")
  const navigate = useNavigate()

  useEffect(() => {
    playerApi.getAll()
      .then(data => {
        setPlayers(data)
        setLoading(false)
      })
      .catch(() => {
        setError("Ошибка загрузки игроков")
        setLoading(false)
      })
  }, [])

  const filtered = players.filter(p => {
    const matchName = p.username.toLowerCase().includes(search.toLowerCase())
    const matchEloMin = !eloMin || p.elo >= Number(eloMin)
    const matchEloMax = !eloMax || p.elo <= Number(eloMax)
    return matchName && matchEloMin && matchEloMax
  })

  if (loading) return (
    <div className="players">
      <div className="players__header">
        <h1 className="players__title">Игроки</h1>
      </div>
      <div className="players__grid">
        {[1,2,3,4,5,6].map(i => <SkeletonCard key={i} />)}
      </div>
    </div>
  )
  if (error) return <div className="players__error">{error}</div>

  return (
    <div className="players">
      <div className="players__header">
        <h1 className="players__title">Игроки</h1>
        <div className="players__filters">
          <input
            className="players__search"
            type="text"
            placeholder="Поиск игрока..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
          <input
            className="players__elo-input"
            type="number"
            placeholder="ELO от"
            value={eloMin}
            onChange={e => setEloMin(e.target.value)}
          />
          <input
            className="players__elo-input"
            type="number"
            placeholder="ELO до"
            value={eloMax}
            onChange={e => setEloMax(e.target.value)}
          />
        </div>
      </div>

      <div className="players__grid">
        {filtered.map(player => {
          const { level, color } = getLevel(player.elo)
          return (
            <div
              key={player.id}
              className="player__card"
              onClick={() => navigate(`/players/${player.id}`)}
            >
              <div className="player__avatar">
                {player.username.slice(0, 2).toUpperCase()}
              </div>
              <div className="player__info">
                <h3 className="player__name">{player.username}</h3>
                <p className="player__username">
                  Участник с {new Date(player.createdAt).toLocaleDateString("ru-RU")}
                </p>
                <p className="player__elo">ELO: {player.elo}</p>
              </div>
              <span
                className="player__level"
                style={{ backgroundColor: color }}
              >
                {level}
              </span>
            </div>
          )
        })}
        {filtered.length === 0 && (
          <p style={{ color: "#888", gridColumn: "1/-1" }}>Игроки не найдены</p>
        )}
      </div>
    </div>
  )
}

export default PlayersPage