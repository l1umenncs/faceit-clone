import { useState, useEffect, useRef } from "react"
import { useAuth } from "../../context/AuthContext"
import "./LiveChat.css"

const LiveChat = () => {
  const [open, setOpen] = useState(false)
  const [messages, setMessages] = useState([])
  const [input, setInput] = useState("")
  const { user } = useAuth()
  const ws = useRef(null)
  const bottomRef = useRef(null)

  useEffect(() => {
    ws.current = new WebSocket("ws://localhost:3001")

    ws.current.onmessage = (e) => {
      const msg = JSON.parse(e.data)
      setMessages(prev => [...prev, msg])
    }

    ws.current.onclose = () => {
      console.log("WebSocket отключён")
    }

    return () => {
      ws.current?.close()
    }
  }, [])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  const sendMessage = () => {
    if (!input.trim()) return
    if (!ws.current || ws.current.readyState !== WebSocket.OPEN) return

    const msg = {
      username: user ? user.username : "Гость",
      text: input.trim(),
      time: new Date().toLocaleTimeString("ru-RU", { hour: "2-digit", minute: "2-digit" })
    }

    ws.current.send(JSON.stringify(msg))
    setInput("")
  }

  const handleKey = (e) => {
    if (e.key === "Enter") sendMessage()
  }

  return (
    <div className="livechat">

      {/* Кнопка */}
      <button
        className="livechat__toggle"
        onClick={() => setOpen(!open)}
      >
        {open ? "✕" : "💬"}
        {!open && messages.length > 0 && (
          <span className="livechat__badge">{messages.length}</span>
        )}
      </button>

      {/* Окно чата */}
      {open && (
        <div className="livechat__window">
          <div className="livechat__header">
            <span className="livechat__title">Live чат</span>
            <span className="livechat__online">● Онлайн</span>
          </div>

          <div className="livechat__messages">
            {messages.length === 0 && (
              <p className="livechat__empty">Нет сообщений. Начните общение!</p>
            )}
            {messages.map((msg, i) => (
              <div key={i} className={`livechat__msg ${msg.username === user?.username ? "livechat__msg--own" : ""} ${msg.isBot ? "livechat__msg--bot" : ""}`}>
                <span className="msg__username">{msg.username}</span>
                <p className="msg__text">{msg.text}</p>
                <span className="msg__time">{msg.time}</span>
              </div>
            ))}
            <div ref={bottomRef} />
          </div>

          <div className="livechat__input-row">
            <input
              className="livechat__input"
              type="text"
              placeholder={user ? "Написать сообщение..." : "Войдите чтобы писать"}
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={handleKey}
              disabled={!user}
            />
            <button
              className="livechat__send"
              onClick={sendMessage}
              disabled={!user}
            >
              ➤
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

export default LiveChat