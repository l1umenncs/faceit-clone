import { useState, useEffect, useRef } from "react"
import { Link, useNavigate } from "react-router-dom"
import { useAuth } from "../../context/AuthContext"
import { authApi } from "../../services/authApi"
import { notificationApi } from "../../services/notificationApi"
import "./NavBar.css"

export default function Navbar() {
  const { user, setUser } = useAuth()
  const navigate = useNavigate()
  const [notifications, setNotifications] = useState([])
  const [showNotifs, setShowNotifs] = useState(false)
  const notifRef = useRef(null)

  useEffect(() => {
    if (!user) return
    notificationApi.getAll().then(setNotifications).catch(() => {})
    const interval = setInterval(() => {
      notificationApi.getAll().then(setNotifications).catch(() => {})
    }, 15000)
    return () => clearInterval(interval)
  }, [user])

  useEffect(() => {
    const handleClick = (e) => {
      if (notifRef.current && !notifRef.current.contains(e.target)) setShowNotifs(false)
    }
    document.addEventListener("mousedown", handleClick)
    return () => document.removeEventListener("mousedown", handleClick)
  }, [])

  const unread = notifications.filter(n => !n.read).length

  const handleMarkRead = async (id) => {
    await notificationApi.markRead(id)
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n))
  }

  const handleMarkAllRead = async () => {
    await notificationApi.markAllRead()
    setNotifications(prev => prev.map(n => ({ ...n, read: true })))
  }

  const handleLogout = async () => {
    await authApi.logout()
    setUser(null)
    navigate("/login")
  }

  return (
    <nav className="navbar">
      <div className="navbar__left">
        <Link to="/">FACEIT</Link>
        <Link to="/players">Игроки</Link>
        <Link to="/matches">Матчи</Link>
        <Link to="/tournaments">Турниры</Link>
        <Link to="/leaderboard">Ранг</Link>
      </div>
      <div className="navbar__right">
        {user ? (
          <>
            <div className="navbar__notif-wrapper" ref={notifRef}>
              <button className="navbar__notif-btn" onClick={() => setShowNotifs(!showNotifs)}>
                🔔
                {unread > 0 && <span className="navbar__notif-badge">{unread}</span>}
              </button>
              {showNotifs && (
                <div className="navbar__notif-dropdown">
                  <div className="notif__header">
                    <span className="notif__title">Уведомления</span>
                    {unread > 0 && <button className="notif__mark-all" onClick={handleMarkAllRead}>Прочитать все</button>}
                  </div>
                  <div className="notif__list">
                    {notifications.length === 0 && <p className="notif__empty">Нет уведомлений</p>}
                    {notifications.map(n => (
                      <div key={n.id} className={`notif__item ${!n.read ? "notif__item--unread" : ""}`}
                        onClick={() => { handleMarkRead(n.id); if (n.link) navigate(n.link); setShowNotifs(false) }}>
                        <p className="notif__message">{n.message}</p>
                        <span className="notif__time">{new Date(n.createdAt).toLocaleDateString("ru-RU")}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
            <span className="navbar__username" onClick={() => navigate("/profile")} style={{ cursor: "pointer" }}>
              {user.username}
            </span>
            <button className="navbar__logout" onClick={handleLogout}>Выйти</button>
          </>
        ) : (
          <Link to="/login" className="navbar__login">Войти</Link>
        )}
      </div>
    </nav>
  )
}