import { Router, Request, Response } from "express"
import { PrismaClient } from "@prisma/client"

const router = Router()
const prisma = new PrismaClient()

const getUserId = (req: Request): number | null => {
  const raw = req.cookies.user
  if (!raw) return null
  try {
    return JSON.parse(raw).id
  } catch {
    return null
  }
}

// заявка в друзья
router.post("/request/:userId", async (req: Request, res: Response) => {
  const senderId = getUserId(req)
  if (!senderId) { res.status(401).json({ error: "Не авторизован" }); return }

  const receiverId = Number(req.params.userId)
  if (senderId === receiverId) { res.status(400).json({ error: "Нельзя добавить себя" }); return }

  const exists = await prisma.friendship.findUnique({
    where: { senderId_receiverId: { senderId, receiverId } }
  })
  if (exists) { res.status(400).json({ error: "Заявка уже существует" }); return }

  const reverse = await prisma.friendship.findUnique({
    where: { senderId_receiverId: { senderId: receiverId, receiverId: senderId } }
  })
  if (reverse) { res.status(400).json({ error: "Заявка уже существует" }); return }

  await prisma.friendship.create({
    data: { senderId, receiverId, status: "PENDING" }
  })

  res.json({ message: "Заявка отправлена" })
})

// принять заявку
router.post("/accept/:userId", async (req: Request, res: Response) => {
  const userId = getUserId(req)
  if (!userId) { res.status(401).json({ error: "Не авторизован" }); return }

  const senderId = Number(req.params.userId)

  const friendship = await prisma.friendship.findUnique({
    where: { senderId_receiverId: { senderId, receiverId: userId } }
  })

  if (!friendship || friendship.status !== "PENDING") {
    res.status(400).json({ error: "Заявка не найдена" })
    return
  }

  await prisma.friendship.update({
    where: { id: friendship.id },
    data: { status: "ACCEPTED" }
  })

  res.json({ message: "Заявка принята" })
})

// отклонить заявку
router.post("/reject/:userId", async (req: Request, res: Response) => {
  const userId = getUserId(req)
  if (!userId) { res.status(401).json({ error: "Не авторизован" }); return }

  const senderId = Number(req.params.userId)

  const friendship = await prisma.friendship.findUnique({
    where: { senderId_receiverId: { senderId, receiverId: userId } }
  })

  if (!friendship || friendship.status !== "PENDING") {
    res.status(400).json({ error: "Заявка не найдена" })
    return
  }

  await prisma.friendship.delete({ where: { id: friendship.id } })

  res.json({ message: "Заявка отклонена" })
})

// удалить из друзей / отменить заявку
router.delete("/:userId", async (req: Request, res: Response) => {
  const userId = getUserId(req)
  if (!userId) { res.status(401).json({ error: "Не авторизован" }); return }

  const targetId = Number(req.params.userId)

  const f1 = await prisma.friendship.findUnique({
    where: { senderId_receiverId: { senderId: userId, receiverId: targetId } }
  })
  if (f1) { await prisma.friendship.delete({ where: { id: f1.id } }); res.json({ message: "Удалено" }); return }

  const f2 = await prisma.friendship.findUnique({
    where: { senderId_receiverId: { senderId: targetId, receiverId: userId } }
  })
  if (f2) { await prisma.friendship.delete({ where: { id: f2.id } }); res.json({ message: "Удалено" }); return }

  res.status(404).json({ error: "Не найдено" })
})

const getFriendsList = async (userId: number) => {
  const sent = await prisma.friendship.findMany({
    where: { senderId: userId, status: "ACCEPTED" },
    include: { receiver: { select: { id: true, username: true, elo: true } } }
  })

  const received = await prisma.friendship.findMany({
    where: { receiverId: userId, status: "ACCEPTED" },
    include: { sender: { select: { id: true, username: true, elo: true } } }
  })

  return [
    ...sent.map(f => f.receiver),
    ...received.map(f => f.sender)
  ]
}

// список друзей текущего пользователя
router.get("/", async (req: Request, res: Response) => {
  const userId = getUserId(req)
  if (!userId) { res.status(401).json({ error: "Не авторизован" }); return }

  const friends = await getFriendsList(userId)
  res.json(friends)
})

// список друзей конкретного пользователя
router.get("/user/:userId", async (req: Request, res: Response) => {
  const userId = Number(req.params.userId)

  const user = await prisma.user.findUnique({ where: { id: userId } })
  if (!user) { res.status(404).json({ error: "Пользователь не найден" }); return }

  const friends = await getFriendsList(userId)
  res.json(friends)
})

// статус дружбы с конкретным пользователем
router.get("/status/:userId", async (req: Request, res: Response) => {
  const userId = getUserId(req)
  if (!userId) { res.status(401).json({ error: "Не авторизован" }); return }

  const targetId = Number(req.params.userId)

  const sent = await prisma.friendship.findUnique({
    where: { senderId_receiverId: { senderId: userId, receiverId: targetId } }
  })
  if (sent) { res.json({ status: sent.status, direction: "sent" }); return }

  const received = await prisma.friendship.findUnique({
    where: { senderId_receiverId: { senderId: targetId, receiverId: userId } }
  })
  if (received) { res.json({ status: received.status, direction: "received" }); return }

  res.json({ status: null, direction: null })
})

// входящие заявки
router.get("/pending", async (req: Request, res: Response) => {
  const userId = getUserId(req)
  if (!userId) { res.status(401).json({ error: "Не авторизован" }); return }

  const pending = await prisma.friendship.findMany({
    where: { receiverId: userId, status: "PENDING" },
    include: { sender: { select: { id: true, username: true, elo: true } } }
  })

  res.json(pending.map(f => f.sender))
})

export default router
