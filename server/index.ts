import express from "express"
import cors from "cors"
import cookieParser from "cookie-parser"
import authRouter from "./routes/auth"
import friendsRouter from "./routes/friends"
import { WebSocketServer, WebSocket } from "ws"
import http from "http"
import axios from "axios"

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

const clients = new Set<WebSocket>()

const broadcast = (message: object) => {
  clients.forEach(client => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(JSON.stringify(message))
    }
  })
}

const getBotReply = async (text: string): Promise<string> => {
  try {
    const response = await axios.post(
      "https://api.anthropic.com/v1/messages",
      {
        model: "claude-haiku-4-5-20251001",
        max_tokens: 200,
        system: "Ты бот поддержки сайта FACEIT Clone. Отвечай кратко, по делу, на русском языке. Помогай с вопросами об ELO, турнирах, регистрации и игровой платформе.",
        messages: [{ role: "user", content: text }]
      },
      {
        headers: {
          "x-api-key": "ТВОЙ_API_KEY",
          "anthropic-version": "2023-06-01",
          "content-type": "application/json"
        }
      }
    )
    return response.data.content[0].text
  } catch (e) {
    return "Извините, не могу ответить прямо сейчас. Попробуйте позже."
  }
}

wss.on("connection", (ws) => {
  clients.add(ws)

  // Приветствие от бота
  ws.send(JSON.stringify({
    username: "Support Bot",
    text: "Привет! Я бот поддержки FACEIT Clone. Чем могу помочь?",
    time: new Date().toLocaleTimeString("ru-RU", { hour: "2-digit", minute: "2-digit" }),
    isBot: true
  }))

  ws.on("message", async (data) => {
    const message = JSON.parse(data.toString())

    // Рассылаем сообщение всем
    broadcast(message)

    // Бот отвечает
    const reply = await getBotReply(message.text)
    setTimeout(() => {
      broadcast({
        username: "Support Bot",
        text: reply,
        time: new Date().toLocaleTimeString("ru-RU", { hour: "2-digit", minute: "2-digit" }),
        isBot: true
      })
    }, 500)
  })

  ws.on("close", () => {
    clients.delete(ws)
  })
})

server.listen(3001, () => {
  console.log("Сервер запущен на http://localhost:3001")
})