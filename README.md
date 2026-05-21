# FACEIT Clone

Клон платформы [FACEIT.com](https://www.faceit.com) — игровая платформа для соревновательных матчей по CS2, Dota 2 и Valorant.

**Стек:** React + Vite (клиент), Express + Prisma + SQLite (сервер), WebSocket (чат)

---

## Функционал

- **Аутентификация** — регистрация, вход, выход (bcrypt + cookies)
- **Игроки** — список всех игроков с поиском и фильтром по ELO
- **Профиль** — ELO, уровень мастерства, описание, регион, настройки
- **Друзья** — отправка/принятие/отклонение заявок, список друзей
- **Матчи** — создание матчей, присоединение, разделение на команды
- **Турниры** — список турниров с фильтрами по игре и статусу
- **Лидерборд** — топ игроков по ELO
- **Чат** — LiveChat с WebSocket и ботом поддержки
- **Уведомления** — колокольчик с заявками в друзья и приглашениями
- **Ранговая система** — 10 уровней с визуализацией

---

## Установка и запуск

### Требования
- Node.js ≥ 18.x
- npm

### Сервер

```bash
cd server
npm install
npx prisma migrate deploy
npx ts-node index.ts
```

Сервер запускается на `http://localhost:3001`

### Клиент

```bash
cd client
npm install
npm run dev
```

Клиент запускается на `http://localhost:5173`

---

## Структура проекта

```
faceit-clone/
├── client/                  # React (Vite)
│   └── src/
│       ├── components/      # NavBar, LiveChat, Skeleton
│       ├── context/         # AuthContext
│       ├── pages/           # HomePage, PlayersPage, PlayerPage,
│       │                    # LoginPage, TournamentsPage, ProfilePage,
│       │                    # LeaderBoard, MatchesPage, MatchDetailPage
│       ├── services/        # apiClient, authApi, playerApi, friendApi,
│       │                    # matchApi, notificationApi, profileApi
│       └── utils/           # eloLevel
├── server/                  # Express + Prisma + SQLite
│   ├── prisma/
│   │   └── schema.prisma    # User, Friendship, Match, MatchPlayer, Notification
│   └── routes/              # auth, friends, matches, notifications
└── README.md
```

---

## API Эндпоинты

### Auth
| Метод | Путь | Описание |
|-------|------|----------|
| POST | /api/auth/register | Регистрация |
| POST | /api/auth/login | Вход |
| POST | /api/auth/logout | Выход |
| GET | /api/auth/me | Текущий пользователь |
| PUT | /api/auth/profile | Обновить профиль |
| GET | /api/auth/players | Все игроки |
| GET | /api/auth/players/:id | Игрок по ID |
| GET | /api/auth/leaderboard | Топ-100 по ELO |

### Friends
| Метод | Путь | Описание |
|-------|------|----------|
| POST | /api/friends/request/:id | Отправить заявку |
| POST | /api/friends/accept/:id | Принять заявку |
| POST | /api/friends/reject/:id | Отклонить заявку |
| DELETE | /api/friends/:id | Удалить из друзей |
| GET | /api/friends | Список друзей |
| GET | /api/friends/user/:id | Друзья пользователя |
| GET | /api/friends/status/:id | Статус дружбы |
| GET | /api/friends/pending | Входящие заявки |

### Matches
| Метод | Путь | Описание |
|-------|------|----------|
| GET | /api/matches | Список матчей |
| POST | /api/matches | Создать матч |
| GET | /api/matches/:id | Детали матча |
| POST | /api/matches/:id/join | Присоединиться |
| POST | /api/matches/:id/leave | Покинуть матч |
| GET | /api/matches/history/:id | История игрока |

### Notifications
| Метод | Путь | Описание |
|-------|------|----------|
| GET | /api/notifications | Все уведомления |
| POST | /api/notifications/:id/read | Отметить прочитанным |
| POST | /api/notifications/read-all | Всё прочитано |

---

## Автор

**Артём Палкин**  
Санкт-Петербург, Россия  
GitHub: [@l1umenncs](https://github.com/l1umenncs)

---

*Проект создан в учебных целях.*
