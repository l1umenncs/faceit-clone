import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { useAuth } from "../../context/AuthContext"
import { authApi } from "../../services/authApi"
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

    try {
      const data = isLogin
        ? await authApi.login(username, password)
        : await authApi.register(username, password)

      setUser(data)
      navigate("/")
    } catch (err) {
      setError(err.message)
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