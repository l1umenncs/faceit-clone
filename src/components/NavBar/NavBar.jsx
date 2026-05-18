import { Link, useNavigate } from "react-router-dom"
import { useAuth } from "../../context/AuthContext"
import "./NavBar.css"

export default function Navbar() {
  const { user, setUser } = useAuth()
  const navigate = useNavigate()

  const handleLogout = async () => {
    await fetch("http://localhost:3001/api/auth/logout", {
      method: "POST",
      credentials: "include"
    })
    setUser(null)
    navigate("/login")
  }

  return (
    <nav className="navbar">
      <div className="navbar__left">
        <Link to="/">FACEIT</Link>
        <Link to="/players">Игроки</Link>
        <Link to="/tournaments">Турниры</Link>
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
          <Link to="/login">Войти</Link>
        )}
      </div>
    </nav>
  )
}