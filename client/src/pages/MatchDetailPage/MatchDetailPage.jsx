import { useState, useEffect } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { useAuth } from "../../context/AuthContext"
import { matchApi } from "../../services/matchApi"
import { Skeleton } from "../../components/Skeleton/Skeleton"
import "./MatchDetailPage.css"

const statusLabel = { WAITING: "ОЖИДАНИЕ", IN_PROGRESS: "ИДЁТ", FINISHED: "ЗАВЕРШЁН" }

const MatchDetailPage = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()
  const [match, setMatch] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    matchApi.getById(id)
      .then(data => { setMatch(data); setLoading(false) })
      .catch(() => setLoading(false))
  }, [id])

  const handleJoin = async () => {
    try { const updated = await matchApi.join(id); setMatch(updated) }
    catch (e) { alert(e.message) }
  }

  const handleLeave = async () => {
    try {
      const updated = await matchApi.leave(id)
      if (updated.message === "Матч удалён") navigate("/matches")
      else setMatch(updated)
    } catch (e) { alert(e.message) }
  }

  if (loading) return (
    <div className="match-detail">
      <div className="match-detail__main">
        <Skeleton width="200px" height="32px" />
        <Skeleton width="100%" height="200px" borderRadius="8px" />
      </div>
    </div>
  )

  if (!match) return <div className="match-detail__loading">Матч не найден</div>

  const inMatch = match.players?.some(p => p.userId === user?.id)
  const team1 = match.players?.filter(p => p.team === 1) || []
  const team2 = match.players?.filter(p => p.team === 2) || []

  return (
    <div className="match-detail">
      <div className="match-detail__main">
        <div className="match-detail__header">
          <div>
            <h1 className="match-detail__game">{match.game}</h1>
            <span className={`match__status-match ${match.status === "WAITING" ? "status--waiting" : match.status === "IN_PROGRESS" ? "status--live" : "status--finished"}`}>
              {statusLabel[match.status]}
            </span>
          </div>
          <div className="match-detail__meta">
            <span>Создатель: {match.creator?.username}</span>
            <span>{match.players?.length}/{match.maxPlayers} игроков</span>
          </div>
        </div>

        <div className="match-detail__teams">
          <div className="match-detail__team">
            <h3 className="team__title">Team 1 ({team1.length})</h3>
            {team1.map(p => (
              <div key={p.id} className="team__player" onClick={() => navigate(`/players/${p.user.id}`)}>
                <div className="team__player-avatar">{p.user.username.slice(0,2).toUpperCase()}</div>
                <span className="team__player-name">{p.user.username}</span>
              </div>
            ))}
            {team1.length === 0 && <p className="team__empty">Нет игроков</p>}
          </div>
          <div className="match-detail__team">
            <h3 className="team__title">Team 2 ({team2.length})</h3>
            {team2.map(p => (
              <div key={p.id} className="team__player" onClick={() => navigate(`/players/${p.user.id}`)}>
                <div className="team__player-avatar">{p.user.username.slice(0,2).toUpperCase()}</div>
                <span className="team__player-name">{p.user.username}</span>
              </div>
            ))}
            {team2.length === 0 && <p className="team__empty">Нет игроков</p>}
          </div>
        </div>

        {match.status === "WAITING" && user && (
          <div className="match-detail__actions">
            {inMatch ? (
              <button className="match-detail__btn match-detail__btn--leave" onClick={handleLeave}>Покинуть матч</button>
            ) : match.players?.length < match.maxPlayers ? (
              <button className="match-detail__btn match-detail__btn--join" onClick={handleJoin}>Присоединиться</button>
            ) : null}
          </div>
        )}
      </div>
    </div>
  )
}

export default MatchDetailPage
