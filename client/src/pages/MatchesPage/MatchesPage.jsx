import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { useAuth } from "../../context/AuthContext"
import { matchApi } from "../../services/matchApi"
import { SkeletonCard } from "../../components/Skeleton/Skeleton"
import "./MatchesPage.css"

const GAMES = ["Все", "CS2", "Dota 2", "Valorant"]

const statusLabel = { WAITING: "ОЖИДАНИЕ", IN_PROGRESS: "ИДЁТ", FINISHED: "ЗАВЕРШЁН" }
const statusClass = { WAITING: "status--waiting", IN_PROGRESS: "status--live", FINISHED: "status--finished" }

const MatchesPage = () => {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [matches, setMatches] = useState([])
  const [loading, setLoading] = useState(true)
  const [gameFilter, setGameFilter] = useState("Все")
  const [showCreate, setShowCreate] = useState(false)
  const [newGame, setNewGame] = useState("CS2")
  const [newMax, setNewMax] = useState(10)

  const load = () => {
    setLoading(true)
    matchApi.list({ game: gameFilter })
      .then(data => { setMatches(data); setLoading(false) })
      .catch(() => setLoading(false))
  }

  useEffect(() => { load() }, [gameFilter])

  const handleCreate = async () => {
    try {
      await matchApi.create(newGame, newMax)
      setShowCreate(false)
      load()
    } catch (e) { alert(e.message) }
  }

  const handleJoin = async (id) => {
    try {
      const updated = await matchApi.join(id)
      setMatches(prev => prev.map(m => m.id === id ? updated : m))
    } catch (e) { alert(e.message) }
  }

  const handleLeave = async (id) => {
    try {
      const updated = await matchApi.leave(id)
      if (updated.message === "Матч удалён") {
        setMatches(prev => prev.filter(m => m.id !== id))
      } else {
        setMatches(prev => prev.map(m => m.id === id ? updated : m))
      }
    } catch (e) { alert(e.message) }
  }

  return (
    <div className="matches">
      <div className="matches__header">
        <h1 className="matches__title">Матчи</h1>
        <div className="matches__header-right">
          <div className="filter__group">
            {GAMES.map(g => (
              <button key={g} className={`filter__btn ${gameFilter === g ? "filter__btn--active" : ""}`}
                onClick={() => setGameFilter(g)}>{g}</button>
            ))}
          </div>
          {user && (
            <button className="matches__create-btn" onClick={() => setShowCreate(true)}>
              + СОЗДАТЬ МАТЧ
            </button>
          )}
        </div>
      </div>

      {/* create modal */}
      {showCreate && (
        <div className="matches__modal-overlay" onClick={() => setShowCreate(false)}>
          <div className="matches__modal" onClick={e => e.stopPropagation()}>
            <h2 className="modal__title">Создать матч</h2>
            <label className="modal__label">Игра</label>
            <select className="modal__select" value={newGame} onChange={e => setNewGame(e.target.value)}>
              {GAMES.filter(g => g !== "Все").map(g => <option key={g} value={g}>{g}</option>)}
            </select>
            <label className="modal__label">Макс. игроков</label>
            <input className="modal__input" type="number" min={2} max={20} value={newMax}
              onChange={e => setNewMax(Number(e.target.value))} />
            <div className="modal__actions">
              <button className="modal__btn modal__btn--cancel" onClick={() => setShowCreate(false)}>Отмена</button>
              <button className="modal__btn modal__btn--submit" onClick={handleCreate}>Создать</button>
            </div>
          </div>
        </div>
      )}

      {loading ? (
        <div className="matches__grid">
          {[1,2,3,4,5,6].map(i => <SkeletonCard key={i} />)}
        </div>
      ) : matches.length === 0 ? (
        <p className="matches__empty">Нет активных матчей. Создай первый!</p>
      ) : (
        <div className="matches__grid">
          {matches.map(m => {
            const inMatch = m.players?.some(p => p.userId === user?.id)
            return (
              <div key={m.id} className="match__card" onClick={() => navigate(`/matches/${m.id}`)}>
                <div className="match__card-header">
                  <span className="match__game">{m.game}</span>
                  <span className={`match__status-match ${statusClass[m.status]}`}>{statusLabel[m.status]}</span>
                </div>
                <div className="match__card-body">
                  <div className="match__creator">Создатель: {m.creator?.username}</div>
                  <div className="match__count">{m.players?.length || 0}/{m.maxPlayers} игроков</div>
                  {m.status === "WAITING" && (
                    <div className="match__teams">
                      <span>Team 1: {m.players?.filter(p => p.team === 1).length}</span>
                      <span>Team 2: {m.players?.filter(p => p.team === 2).length}</span>
                    </div>
                  )}
                </div>
                {m.status === "WAITING" && user && (
                  <div className="match__card-actions" onClick={e => e.stopPropagation()}>
                    {inMatch ? (
                      <button className="match__action-btn match__action-btn--leave"
                        onClick={() => handleLeave(m.id)}>Покинуть</button>
                    ) : m.players?.length < m.maxPlayers ? (
                      <button className="match__action-btn match__action-btn--join"
                        onClick={() => handleJoin(m.id)}>Присоединиться</button>
                    ) : null}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

export default MatchesPage
