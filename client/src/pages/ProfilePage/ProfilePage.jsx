import { useAuth } from "../../context/AuthContext"
import { useNavigate } from "react-router-dom"
import { getLevel } from "../../utils/eloLevel"
import { profileApi } from "../../services/profileApi"
import { friendApi } from "../../services/friendApi"
import "./ProfilePage.css"

const TABS = ["Игры", "Друзья", "Настройки"]

import { useState, useEffect } from "react"

const REGIONS = ["EU", "NA", "AS", "SA", "OC"]

const ProfilePage = () => {
  const { user, setUser } = useAuth()
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState("Игры")
  const [friends, setFriends] = useState([])
  const [pending, setPending] = useState([])
  const [description, setDescription] = useState(user?.description || "")
  const [region, setRegion] = useState(user?.region || "EU")
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (activeTab === "Друзья") {
      friendApi.getFriends().then(setFriends).catch(() => {})
      friendApi.getPending().then(setPending).catch(() => {})
    }
  }, [activeTab])

  if (!user) {
    navigate("/login")
    return null
  }

  const { level, color } = getLevel(user.elo || 1000)

  const handleSave = async () => {
    setSaving(true)
    try {
      const updated = await profileApi.update({ description, region })
      setUser({ ...user, ...updated })
    } catch (e) { alert(e.message) }
    setSaving(false)
  }

  return (
    <div className="player-page">
      <aside className="player-page__sidebar">
        <div className="sidebar__cover">
          <div className="sidebar__avatar">
            {user.username.slice(0, 2).toUpperCase()}
          </div>
        </div>
        <div className="sidebar__body">
          <h2 className="sidebar__name">{user.username}</h2>
          <div className="sidebar__meta">
            {user.description && <p className="sidebar__meta-item">{user.description}</p>}
            <p className="sidebar__meta-item">Регион: {user.region || "EU"}</p>
            <p className="sidebar__meta-item">📅 Участник с {user.createdAt ? new Date(user.createdAt).toLocaleDateString("ru-RU") : "2025 г."}</p>
          </div>
        </div>
      </aside>

      <div className="player-page__main">
        <div className="player-page__tabs">
          {TABS.map(tab => (
            <button key={tab}
              className={`tab__btn ${activeTab === tab ? "tab__btn--active" : ""}`}
              onClick={() => setActiveTab(tab)}>
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
                <div className="elo__number">{user.elo || 1000}</div>
              </div>
              <div className="elo__summary">
                <span>ELO рейтинг</span>
              </div>
            </div>
          </div>
        )}

        {activeTab === "Друзья" && (
          <div className="player-page__content">
            {pending.length > 0 && (
              <div className="friends__block">
                <h3 className="stats__title">Входящие заявки ({pending.length})</h3>
                <div className="friends__grid">
                  {pending.map(f => (
                    <div key={f.id} className="friend__card">
                      <div className="friend__avatar">{f.username.slice(0, 2).toUpperCase()}</div>
                      <div className="friend__info">
                        <span className="friend__name">{f.username}</span>
                      </div>
                      <div className="friend__btn-group">
                        <button className="friend__btn friend__btn--accept"
                          onClick={() => friendApi.acceptRequest(f.id).then(() => setPending(prev => prev.filter(p => p.id !== f.id)))}>Принять</button>
                        <button className="friend__btn friend__btn--reject"
                          onClick={() => friendApi.rejectRequest(f.id).then(() => setPending(prev => prev.filter(p => p.id !== f.id)))}>Отклонить</button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
            <div className="friends__block">
              <h3 className="stats__title">Мои друзья ({friends.length})</h3>
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

        {activeTab === "Настройки" && (
          <div className="player-page__content">
            <div className="settings__block">
              <h3 className="stats__title">Аккаунт</h3>
              <div className="settings__item">
                <span className="settings__label">Никнейм</span>
                <span className="settings__value">{user.username}</span>
              </div>
              <div className="settings__field">
                <label className="settings__label">О себе</label>
                <textarea className="settings__textarea" rows={3}
                  placeholder="Расскажи о себе..."
                  value={description}
                  onChange={e => setDescription(e.target.value)} />
              </div>
              <div className="settings__field">
                <label className="settings__label">Регион</label>
                <select className="settings__select" value={region} onChange={e => setRegion(e.target.value)}>
                  {REGIONS.map(r => <option key={r} value={r}>{r}</option>)}
                </select>
              </div>
              <button className="settings__save" onClick={handleSave} disabled={saving}>
                {saving ? "Сохранение..." : "Сохранить"}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default ProfilePage
