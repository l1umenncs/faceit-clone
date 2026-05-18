import { useAuth } from "../../context/AuthContext"
import { useNavigate } from "react-router-dom"
import { getLevel } from "../../utils/eloLevel"
import "./ProfilePage.css"

const TABS = ["Игры", "Настройки"]

import { useState } from "react"

const ProfilePage = () => {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState("Игры")

  if (!user) {
    navigate("/login")
    return null
  }

  const elo = ((user.username.length * 317) % 2500) + 100
  const { level, color } = getLevel(elo)
  const matches = ((user.username.length * 211) % 2000) + 100
  const winrate = ((user.username.length * 137) % 40) + 40
  const kd = (((user.username.length * 173) % 100) / 100 + 0.8).toFixed(2)
  const kills = ((user.username.length * 97) % 15) + 15

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
            <p className="sidebar__meta-item">📅 Участник с 2025 г.</p>
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
                <div className="elo__number">{elo}</div>
              </div>
              <div className="elo__summary">
                <span>{matches} матчей</span>
                <span className="elo__winrate">{winrate}% побед</span>
              </div>
            </div>

            <div className="stats__block">
              <h3 className="stats__title">Статистика</h3>
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
              <div className="settings__item">
                <span className="settings__label">Участник с</span>
                <span className="settings__value">2025 г.</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default ProfilePage