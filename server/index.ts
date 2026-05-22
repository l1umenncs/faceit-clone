import express, { Request, Response, NextFunction } from "express"
import cors from "cors"
import cookieParser from "cookie-parser"
import authRouter from "./routes/auth"
import friendsRouter from "./routes/friends"
import matchesRouter from "./routes/matches"
import notificationsRouter from "./routes/notifications"
import { WebSocketServer, WebSocket } from "ws"
import http from "http"
import httpShim from "http"
import { PrismaClient } from "@prisma/client"

interface WsUser {
  id: number
  username: string
}

interface AuthSocket extends WebSocket {
  user?: WsUser
}

export class AppError extends Error {
  statusCode: number
  constructor(message: string, statusCode: number = 500) {
    super(message)
    this.statusCode = statusCode
  }
}

const app = express()
const server = http.createServer(app)
const wss = new WebSocketServer({ server })

app.use(express.json())
app.use(cookieParser())
app.use(cors({
  origin: "http://localhost:5173",
  credentials: true
}))

app.use("/api/auth", authRouter)
app.use("/api/friends", friendsRouter)
app.use("/api/matches", matchesRouter)
app.use("/api/notifications", notificationsRouter)

const prisma = new PrismaClient()
const clients = new Set<AuthSocket>()

const time = () =>
  new Date().toLocaleTimeString("ru-RU", { hour: "2-digit", minute: "2-digit" })

const broadcast = (message: object, exclude?: AuthSocket) => {
  clients.forEach(client => {
    if (client !== exclude && client.readyState === WebSocket.OPEN) {
      client.send(JSON.stringify(message))
    }
  })
}

const parseCookie = (header: string | undefined, name: string): string | null => {
  if (!header) return null
  for (const part of header.split(";")) {
    const [key, ...rest] = part.trim().split("=")
    if (key === name) return decodeURIComponent(rest.join("="))
  }
  return null
}

const replies: Record<string, string> = {
  elo: "ELO — это рейтинг мастерства на FACEIT. Максимальный уровень — 10 (2001+ ELO). Каждый уровень имеет свой цвет: 1-2 серый, 3-4 зелёный, 5-7 жёлтый/оранжевый, 8-9 красный, 10 — бордовый.",
  level: "Всего 10 уровней мастерства. Чем выше ELO, тем выше уровень. Для повышения уровня нужно выигрывать матчи и набирать ELO.",
  tournament: "На платформе доступны турниры по CS2, Dota 2 и Valorant. Призовые — от $250 до $25,000. Заходи в раздел Турниры, чтобы зарегистрироваться.",
  match: "Матчи создаются в разделе Матчи. Там же можно присоединиться к существующим. Игроки делятся на две команды автоматически.",
  регистраци: "Для регистрации нажми Войти в правом верхнем углу и выбери Зарегистрироваться. Нужен никнейм и пароль.",
  друг: "Чтобы добавить друга — зайди на его страницу и нажми + Добавить в друзья. После принятия заявки вы будете отображаться в списке друзей.",
  привет: "Привет! Чем могу помочь? Расскажу про ELO, турниры, матчи или друзей.",
  как: "Я бот поддержки FACEIT Clone. Могу рассказать про уровни, ELO, турниры, матчи и друзей. Просто спроси!",
  спасиб: "Всегда пожалуйста! Если будут вопросы — обращайся 👍",
  чат: "Этот чат — общий. Все сообщения видят все участники. Я — автоматический бот поддержки.",
  "cs2": "CS2 — основная дисциплина на FACEIT. Доступны матчи 5v5, турниры и лиги. Твой навык измеряется ELO.",
  "dota": "Dota 2 доступна на платформе. Участвуй в турнирах, находи команду и поднимай ELO.",
  "valoran": "Valorant поддерживается на FACEIT Clone. Создавай матчи и соревнуйся с другими игроками.",
}

const getBotReply = async (text: string): Promise<string> => {
  const lower = text.toLowerCase()

  for (const [keyword, reply] of Object.entries(replies)) {
    if (lower.includes(keyword)) return reply
  }

  const responses = [
    "Хороший вопрос! Попробуй написать мне про ELO, турниры, матчи или друзей — я всё расскажу.",
    "Я ещё учусь, но могу помочь с информацией о платформе. Спроси про уровни, матчи или турниры.",
    "Напиши мне о чём-то конкретном: ELO, друзья, турниры, матчи, регистрация.",
    "Я знаю всё про FACEIT Clone! Спроси про рейтинг, команды или соревнования.",
  ]
  return responses[Math.floor(Math.random() * responses.length)]
}

wss.on("connection", (ws: AuthSocket, req: httpShim.IncomingMessage) => {
  const cookie = parseCookie(req.headers.cookie, "user")
  let user: WsUser | null = null

  if (cookie) {
    try {
      const parsed = JSON.parse(cookie)
      if (parsed.id && parsed.username) user = { id: parsed.id, username: parsed.username }
    } catch {}
  }

  if (!user) {
    ws.send(JSON.stringify({ type: "error", text: "Требуется авторизация" }))
    ws.close()
    return
  }

  ws.user = user
  clients.add(ws)

  broadcast({ type: "system", text: `${user.username} присоединился к чату`, time: time() })

  ws.send(JSON.stringify({
    type: "bot",
    username: "Support Bot",
    text: `Привет, ${user.username}! Я бот поддержки FACEIT Clone. Чем могу помочь?`,
    time: time(),
  }))

  ws.on("message", async (data) => {
    try {
      const { text } = JSON.parse(data.toString())

      if (!text || !text.trim()) return

      broadcast({ type: "message", username: user!.username, text: text.trim(), time: time() })

      const reply = await getBotReply(text.trim())
      setTimeout(() => {
        broadcast({ type: "bot", username: "Support Bot", text: reply, time: time() })
      }, 500)
    } catch (err) {
      console.error("[WS ERROR]", err)
    }
  })

  ws.on("close", () => {
    clients.delete(ws)
    broadcast({ type: "system", text: `${user!.username} покинул чат`, time: time() })
  })
})

app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
  const statusCode = err instanceof AppError ? err.statusCode : 500
  const message = err.message || "Внутренняя ошибка сервера"

  if (statusCode === 500) {
    console.error(`[ERROR] ${err.message}\n${err.stack}`)
  }

  res.status(statusCode).json({ error: message })
})

process.on("uncaughtException", (err) => {
  console.error(`[UNCAUGHT] ${err.message}\n${err.stack}`)
  process.exit(1)
})

process.on("unhandledRejection", (reason) => {
  console.error(`[UNHANDLED] ${reason}`)
})

server.listen(3001, () => {
  console.log("Сервер запущен на http://localhost:3001")
})