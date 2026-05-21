import { Link, useNavigate } from "react-router-dom"
import { useAuth } from "../../context/AuthContext"
import { authApi } from "../../services/authApi"
import "./NavBar.css"

export default function Navbar() {
  const { user, setUser } = useAuth()
  const navigate = useNavigate()

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
        <Link to="/tournaments">Турниры</Link>
        <Link to="/leaderboard">Ранг</Link>
      </div>
      <div className="navbar__right">
        {user ? (
          <>
            <span
              className="navbar__username"
              onClick={() => navigate("/profile")}
              style={{ cursor: "pointer" }}
            >
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