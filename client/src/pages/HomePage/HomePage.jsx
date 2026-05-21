import { useNavigate } from "react-router-dom"
import { useAuth } from "../../context/AuthContext"
import "./HomePage.css"

const HomePage = () => {
  const navigate = useNavigate()
  const { user } = useAuth()

  return (
    <div className="home">

      {/* //БАННЕР */}
      <div className="home__banner">
        <div className="banner__content">
          <h2 className="banner__title">Найди свою игру</h2>
          <p className="banner__subtitle">Соревнуйся в CS2, Dota 2 и Valorant. Участвуй в турнирах, поднимай ELO и попади в топ лидерборда.</p>
          <button className="banner__btn" onClick={() => navigate("/matches")}>
            НАЧАТЬ ИГРАТЬ
          </button>
        </div>
        <div className="banner__levels">
          <div className="banner__level-badge" style={{ background: "linear-gradient(135deg, #d3d3d3, #999)" }}>1</div>
          <div className="banner__level-badge" style={{ background: "linear-gradient(135deg, #00cc44, #009933)" }}>3</div>
          <div className="banner__level-badge" style={{ background: "linear-gradient(135deg, #f5a623, #cc8800)" }}>5</div>
          <div className="banner__level-badge" style={{ background: "linear-gradient(135deg, #ff5500, #cc3300)" }}>8</div>
          <div className="banner__level-badge" style={{ background: "linear-gradient(135deg, #cc0000, #990000)" }}>10</div>
        </div>
      </div>
          {/* //ПРАВАЯ ЧАСТЬ */}
      <div className="home__body">

        {/* //ЛЕВАЯ ЧАСТЬ */}
        <div className="home__main">

          {/* //ЕСЛИ ЛОГ ЕСТЬ */}
          {user && (
            <div className="home__elo-card">
              <div className="elo-card__left">
                <div className="elo-card__avatar">{user.username.slice(0,2).toUpperCase()}</div>
                <div>
                  <p className="elo-card__username">{user.username}</p>
                  <p className="elo-card__region">EU</p>
                </div>
              </div>
              <div className="elo-card__right">
                <span className="elo-card__label">Уровень мастерства</span>
                <div className="elo-card__elo">
                  <span className="elo-card__badge">10</span>
                  <span className="elo-card__number">2 872</span>
                  <span className="elo-card__change">+30</span>
                </div>
              </div>
            </div>
          )}

          {/* //ТРИПЛА */}
          <div className="home__cards">
            <div className="home__card" onClick={() => navigate("/matches")}>
              <div className="home__card-icon">⚔️</div>
              <p className="home__card-label">Матчмейкинг</p>
            </div>
            <div className="home__card" onClick={() => navigate("/tournaments")}>
              <div className="home__card-icon">🏆</div>
              <p className="home__card-label">Турниры</p>
            </div>
            <div className="home__card home__card--highlight">
              <div className="home__card-icon">⭐</div>
              <p className="home__card-label">ESEA League</p>
              <p className="home__card-sub">Регистрация открыта</p>
              <p className="home__card-timer">56Д 03Ч 33М</p>
            </div>
          </div>

          {/* //ПРЕМИУМ */}
          <div className="home__premium">
            <div className="premium__text">
              <h3 className="premium__title">Перейти на премиум</h3>
              <p className="premium__desc">Наслаждайтесь без рекламы, открывайте супер матчи, хайлайты и многое другое.</p>
            </div>
            <button className="premium__btn">УЗНАТЬ БОЛЬШЕ</button>
          </div>

        </div>

        {/* // ПРАВАЯ ЧАСТЬ */}
        <div className="home__sidebar">

          <div className="sidebar__section">
            <div className="sidebar__section-header">
              <h3 className="sidebar__section-title">Группы</h3>
              <span className="sidebar__section-count">31</span>
            </div>
            <button className="sidebar__btn">PARTY FINDER</button>
          </div>

          <div className="sidebar__section">
            <div className="sidebar__section-header">
              <h3 className="sidebar__section-title">Клубы</h3>
              <span className="sidebar__section-count">479</span>
            </div>
            {[
              { name: "BIG Club", sub: "BIG Clan", members: "136 580" },
              { name: "ZOTIX ACADEMY", sub: "twitch inkmate0", members: "160 462" },
              { name: "Leo KZ", sub: "LeoKZ Org", members: "22 465" },
            ].map(club => (
              <div key={club.name} className="sidebar__club">
                <div className="club__avatar">{club.name.slice(0,2)}</div>
                <div className="club__info">
                  <p className="club__name">{club.name}</p>
                  <p className="club__sub">{club.sub}</p>
                </div>
                <p className="club__members">👥 {club.members}</p>
              </div>
            ))}
            <button className="sidebar__btn">ОТКРЫТЬ КЛУБЫ</button>
          </div>

        </div>
      </div>
    </div>
  )
}

export default HomePage