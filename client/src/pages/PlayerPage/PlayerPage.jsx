import { useState, useEffect } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { getLevel } from "../../utils/eloLevel"
import { playerApi } from "../../services/playerApi"
import { friendApi } from "../../services/friendApi"
import { useAuth } from "../../context/AuthContext"
import "./PlayerPage.css"

const TABS = ["Игры", "Друзья", "Статистика", "Турниры"]

const PlayerPage = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()
  const [player, setPlayer] = useState(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState("Игры")
  const [friendStatus, setFriendStatus] = useState(null)
  const [friendLoading, setFriendLoading] = useState(false)
  const [friends, setFriends] = useState([])

  useEffect(() => {
    playerApi.getById(id)
      .then(data => {
        setPlayer(data)
        setLoading(false)
      })
  }, [id])

  useEffect(() => {
    if (!user || !player || user.id === player.id) return
    friendApi.getStatus(player.id)
      .then(data => setFriendStatus(data))
      .catch(() => {})
  }, [user, player])

  const isOwn = user && player && user.id === player.id

  const handleFriendAction = async (action) => {
    if (!player) return
    setFriendLoading(true)
    try {
      if (action === "send") {
        await friendApi.sendRequest(player.id)
        setFriendStatus({ status: "PENDING", direction: "sent" })
      } else if (action === "accept") {
        await friendApi.acceptRequest(player.id)
        setFriendStatus({ status: "ACCEPTED", direction: "received" })
      } else if (action === "reject") {
        await friendApi.rejectRequest(player.id)
        setFriendStatus(null)
      } else if (action === "remove") {
        await friendApi.removeFriend(player.id)
        setFriendStatus(null)
      }
    } catch (e) {
      alert(e.message)
    }
    setFriendLoading(false)
  }

  useEffect(() => {
    if (activeTab === "Друзья") loadFriends()
  }, [activeTab, player])

  const loadFriends = () => {
    if (!player) return
    friendApi.getUserFriends(player.id)
      .then(setFriends)
      .catch(() => {})
  }

  if (loading) return <div className="player-page__loading">Загрузка...</div>
  if (!player) return <div className="player-page__loading">Игрок не найден</div>

  const { level, color } = getLevel(player.elo)
  const matches = ((player.id * 211) % 2000) + 100
  const winrate = ((player.id * 137) % 40) + 40
  const kd = (((player.id * 173) % 100) / 100 + 0.8).toFixed(2)
  const kills = ((player.id * 97) % 15) + 15

  return (
    <div className="player-page">

      <aside className="player-page__sidebar">
        <div className="sidebar__cover">
          <div className="sidebar__avatar">
            {player.username.slice(0, 2).toUpperCase()}
          </div>
        </div>
        <div className="sidebar__body">
          <h2 className="sidebar__name">{player.username}</h2>
          {!isOwn && user && (
            <div className="sidebar__friend-actions">
              {friendStatus?.status === "ACCEPTED" ? (
                <button
                  className="friend__btn friend__btn--remove"
                  onClick={() => handleFriendAction("remove")}
                  disabled={friendLoading}
                >
                  ✕ В друзьях
                </button>
              ) : friendStatus?.status === "PENDING" && friendStatus.direction === "sent" ? (
                <button className="friend__btn friend__btn--pending" disabled>
                  ⌛ Заявка отправлена
                </button>
              ) : friendStatus?.status === "PENDING" && friendStatus.direction === "received" ? (
                <div className="friend__btn-group">
                  <button
                    className="friend__btn friend__btn--accept"
                    onClick={() => handleFriendAction("accept")}
                    disabled={friendLoading}
                  >
                    ✓ Принять
                  </button>
                  <button
                    className="friend__btn friend__btn--reject"
                    onClick={() => handleFriendAction("reject")}
                    disabled={friendLoading}
                  >
                    ✕ Отклонить
                  </button>
                </div>
              ) : (
                <button
                  className="friend__btn friend__btn--add"
                  onClick={() => handleFriendAction("send")}
                  disabled={friendLoading}
                >
                  + Добавить в друзья
                </button>
              )}
            </div>
          )}
          <div className="sidebar__meta">
            <p className="sidebar__meta-item">
              📅 Участник с {new Date(player.createdAt).toLocaleDateString("ru-RU")}
            </p>
          </div>
        </div>
      </aside>

      <div className="player-page__main">

        <div className="player-page__tabs">
          {TABS.map(tab => (
            <button
              key={tab}
              className={`tab__btn ${activeTab === tab ? "tab__btn--active" : ""}`}
              onClick={() => setActiveTab(tab)}
            >
              {tab}
            </button>
          ))}
        </div>

        {activeTab === "Игры" && (
          <div className="player-page__content">

            <div className="elo__block">
              <div className="elo__season">SEASON 8</div>
              <div className="elo__center">
                <div className="elo__badge" style={{ borderColor: color }}>
                  {level}
                </div>
                <div className="elo__number">{player.elo}</div>
              </div>
              <div className="elo__summary">
                <span>{matches} матчей</span>
                <span className="elo__winrate">{winrate}% побед</span>
              </div>
            </div>

            <div className="stats__block">
              <h3 className="stats__title">Недавние результаты</h3>
              <div className="stats__grid">
                <div className="stat__card">
                  <span className="stat__value">{kd}</span>
                  <span className="stat__label">K/D Ratio</span>
                </div>
                <div className="stat__card">
                  <span className="stat__value">{winrate}%</span>
                  <span className="stat__label">Винрейт</span>
                </div>
                <div className="stat__card">
                  <span className="stat__value">{kills}</span>
                  <span className="stat__label">Убийств/игра</span>
                </div>
                <div className="stat__card">
                  <span className="stat__value">{matches}</span>
                  <span className="stat__label">Матчей</span>
                </div>
              </div>
            </div>

            <div className="matches__block">
              <h3 className="stats__title">Последние матчи</h3>
              {[1,2,3,4,5].map(i => (
                <div key={i} className={`match__row ${i % 2 === 0 ? "match__row--loss" : "match__row--win"}`}>
                  <span className={`match__result ${i % 2 === 0 ? "loss" : "win"}`}>
                    {i % 2 === 0 ? "П" : "В"}
                  </span>
                  <span className="match__map">Mirage</span>
                  <span className="match__kd">18 / 14</span>
                  <span className="match__elo">{i % 2 === 0 ? "-12" : "+24"}</span>
                </div>
              ))}
            </div>

          </div>
        )}

        {activeTab === "Статистика" && (
          <div className="player-page__content">
            <p style={{ color: "#888" }}>Подробная статистика — в разработке</p>
          </div>
        )}

        {activeTab === "Друзья" && (
          <div className="player-page__content">
            <div className="friends__block">
              {friends.length === 0 ? (
                <p className="friends__empty">Список друзей пуст</p>
              ) : (
                <div className="friends__grid">
                  {friends.map(f => {
                    const { level, color } = getLevel(f.elo)
                    return (
                      <div key={f.id} className="friend__card" onClick={() => navigate(`/players/${f.id}`)}>
                        <div className="friend__avatar">{f.username.slice(0, 2).toUpperCase()}</div>
                        <div className="friend__info">
                          <span className="friend__name">{f.username}</span>
                          <span className="friend__elo" style={{ color }}>ELO {f.elo}</span>
                        </div>
                        <span className="friend__level" style={{ backgroundColor: color }}>{level}</span>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === "Турниры" && (
          <div className="player-page__content">
            <p style={{ color: "#888" }}>Турниры — в разработке</p>
          </div>
        )}

      </div>
    </div>
  )
}

export default PlayerPage