import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { useAuth } from "../../context/AuthContext"
import "./LoginPage.css"

const LoginPage = () => {
  const { setUser } = useAuth()
  const [isLogin, setIsLogin] = useState(true)
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const navigate = useNavigate()

  const handleSubmit = async () => {
    if (!username || !password) {
      setError("Заполни все поля")
      return
    }

    const url = isLogin
      ? "http://localhost:3001/api/auth/login"
      : "http://localhost:3001/api/auth/register"

    try {
      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ username, password })
      })

      const data = await res.json()

      if (!res.ok) {
        setError(data.error)
        return
      }

      setUser(data)
      navigate("/")
    } catch (err) {
      setError("Ошибка сервера")
    }
  }

  return (
    <div className="auth">
      <div className="auth__box">
        <h2 className="auth__title">
          {isLogin ? "Войти" : "Регистрация"}
        </h2>

        {error && <p className="auth__error">{error}</p>}

        <input
          className="auth__input"
          type="text"
          placeholder="Никнейм"
          value={username}
          onChange={e => setUsername(e.target.value)}
        />
        <input
          className="auth__input"
          type="password"
          placeholder="Пароль"
          value={password}
          onChange={e => setPassword(e.target.value)}
        />

        <button className="auth__btn" onClick={handleSubmit}>
          {isLogin ? "Войти" : "Зарегистрироваться"}
        </button>

        <p className="auth__switch">
          {isLogin ? "Нет аккаунта?" : "Уже есть аккаунт?"}
          <span onClick={() => { setIsLogin(!isLogin); setError("") }}>
            {isLogin ? " Зарегистрироваться" : " Войти"}
          </span>
        </p>
      </div>
    </div>
  )
}

export default LoginPage