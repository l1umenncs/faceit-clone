import { useState } from "react"
import "./TournamentsPage.css"

const TOURNAMENTS = [
  { id: 1, name: "FPL Season 12", game: "CS2", prize: "$10,000", status: "live", players: 128, region: "EU" },
  { id: 2, name: "Monday Cup #44", game: "CS2", prize: "$500", status: "upcoming", players: 64, region: "EU" },
  { id: 3, name: "Weekly Clash", game: "Dota 2", prize: "$1,000", status: "upcoming", players: 32, region: "NA" },
  { id: 4, name: "Pro League S5", game: "CS2", prize: "$25,000", status: "finished", players: 256, region: "EU" },
  { id: 5, name: "Friday Cup #12", game: "Dota 2", prize: "$250", status: "upcoming", players: 64, region: "SA" },
  { id: 6, name: "Champions Cup", game: "CS2", prize: "$5,000", status: "live", players: 128, region: "AS" },
]

const FILTERS = ["Все", "CS2", "Dota 2"]
const STATUSES = ["Все", "live", "upcoming", "finished"]

const statusLabel = {
  live: "LIVE",
  upcoming: "СКОРО",
  finished: "ЗАВЕРШЁН"
}

const statusClass = {
  live: "status--live",
  upcoming: "status--upcoming",
  finished: "status--finished"
}

const TournamentsPage = () => {
  const [gameFilter, setGameFilter] = useState("Все")
  const [statusFilter, setStatusFilter] = useState("Все")
  const [search, setSearch] = useState("")

  const filtered = TOURNAMENTS.filter(t => {
    const matchGame = gameFilter === "Все" || t.game === gameFilter
    const matchStatus = statusFilter === "Все" || t.status === statusFilter
    const matchSearch = t.name.toLowerCase().includes(search.toLowerCase())
    return matchGame && matchStatus && matchSearch
  })

  return (
    <div className="tournaments">
      <div className="tournaments__header">
        <h1 className="tournaments__title">Турниры</h1>
        <input
          className="tournaments__search"
          type="text"
          placeholder="Поиск турнира..."
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
      </div>

      <div className="tournaments__filters">
        <div className="filter__group">
          <span className="filter__label">Игра:</span>
          {FILTERS.map(f => (
            <button
              key={f}
              className={`filter__btn ${gameFilter === f ? "filter__btn--active" : ""}`}
              onClick={() => setGameFilter(f)}
            >
              {f}
            </button>
          ))}
        </div>
        <div className="filter__group">
          <span className="filter__label">Статус:</span>
          {STATUSES.map(s => (
            <button
              key={s}
              className={`filter__btn ${statusFilter === s ? "filter__btn--active" : ""}`}
              onClick={() => setStatusFilter(s)}
            >
              {s === "Все" ? "Все" : statusLabel[s]}
            </button>
          ))}
        </div>
      </div>

      <div className="tournaments__grid">
        {filtered.length === 0 && (
          <p className="tournaments__empty">Турниры не найдены</p>
        )}
        {filtered.map(t => (
          <div key={t.id} className="tournament__card">
            <div className="tournament__card-header">
              <span className="tournament__game">{t.game}</span>
              <span className={`tournament__status ${statusClass[t.status]}`}>
                {statusLabel[t.status]}
              </span>
            </div>
            <h3 className="tournament__name">{t.name}</h3>
            <div className="tournament__info">
              <div className="tournament__info-item">
                <span className="info__label">Приз</span>
                <span className="info__value">{t.prize}</span>
              </div>
              <div className="tournament__info-item">
                <span className="info__label">Игроки</span>
                <span className="info__value">{t.players}</span>
              </div>
              <div className="tournament__info-item">
                <span className="info__label">Регион</span>
                <span className="info__value">{t.region}</span>
              </div>
            </div>
            <button className="tournament__btn">
              {t.status === "upcoming" ? "Зарегистрироваться" : "Подробнее"}
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}

export default TournamentsPage