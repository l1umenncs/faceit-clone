import { Router, Request, Response } from "express"
import { PrismaClient } from "@prisma/client"
import { createNotification } from "./notifications"
import { AppError } from "../index"
import { requireAuth } from "../utils"

const router = Router()
const prisma = new PrismaClient()

const getUser = async (id: number) => {
  return prisma.user.findUnique({ where: { id }, select: { id: true, username: true } })
}

router.post("/request/:userId", async (req: Request, res: Response) => {
  const senderId = requireAuth(req)
  const receiverId = Number(req.params.userId)

  if (senderId === receiverId) throw new AppError("Нельзя добавить себя", 400)

  const exists = await prisma.friendship.findUnique({
    where: { senderId_receiverId: { senderId, receiverId } }
  })
  if (exists) throw new AppError("Заявка уже существует", 400)

  const reverse = await prisma.friendship.findUnique({
    where: { senderId_receiverId: { senderId: receiverId, receiverId: senderId } }
  })
  if (reverse) throw new AppError("Заявка уже существует", 400)

  const sender = await getUser(senderId)

  await prisma.friendship.create({
    data: { senderId, receiverId, status: "PENDING" }
  })

  await createNotification(prisma, receiverId, "friend_request",
    `${sender?.username} хочет добавить тебя в друзья`,
    `/players/${senderId}`)

  res.json({ message: "Заявка отправлена" })
})

router.post("/accept/:userId", async (req: Request, res: Response) => {
  const userId = requireAuth(req)
  const senderId = Number(req.params.userId)

  const friendship = await prisma.friendship.findUnique({
    where: { senderId_receiverId: { senderId, receiverId: userId } }
  })

  if (!friendship || friendship.status !== "PENDING") throw new AppError("Заявка не найдена", 400)

  const accepter = await getUser(userId)

  await prisma.friendship.update({
    where: { id: friendship.id },
    data: { status: "ACCEPTED" }
  })

  await createNotification(prisma, senderId, "friend_accepted",
    `${accepter?.username} принял(а) заявку в друзья`,
    `/players/${userId}`)

  res.json({ message: "Заявка принята" })
})

router.post("/reject/:userId", async (req: Request, res: Response) => {
  const userId = requireAuth(req)
  const senderId = Number(req.params.userId)

  const friendship = await prisma.friendship.findUnique({
    where: { senderId_receiverId: { senderId, receiverId: userId } }
  })

  if (!friendship || friendship.status !== "PENDING") throw new AppError("Заявка не найдена", 400)

  await prisma.friendship.delete({ where: { id: friendship.id } })
  res.json({ message: "Заявка отклонена" })
})

router.delete("/:userId", async (req: Request, res: Response) => {
  const userId = requireAuth(req)
  const targetId = Number(req.params.userId)

  const f1 = await prisma.friendship.findUnique({
    where: { senderId_receiverId: { senderId: userId, receiverId: targetId } }
  })
  if (f1) { await prisma.friendship.delete({ where: { id: f1.id } }); res.json({ message: "Удалено" }); return }

  const f2 = await prisma.friendship.findUnique({
    where: { senderId_receiverId: { senderId: targetId, receiverId: userId } }
  })
  if (f2) { await prisma.friendship.delete({ where: { id: f2.id } }); res.json({ message: "Удалено" }); return }

  throw new AppError("Не найдено", 404)
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

router.get("/", async (req: Request, res: Response) => {
  const userId = requireAuth(req)
  const friends = await getFriendsList(userId)
  res.json(friends)
})

router.get("/user/:userId", async (req: Request, res: Response) => {
  const userId = Number(req.params.userId)

  const user = await prisma.user.findUnique({ where: { id: userId } })
  if (!user) throw new AppError("Пользователь не найден", 404)

  const friends = await getFriendsList(userId)
  res.json(friends)
})

router.get("/status/:userId", async (req: Request, res: Response) => {
  const userId = requireAuth(req)
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

router.get("/pending", async (req: Request, res: Response) => {
  const userId = requireAuth(req)

  const pending = await prisma.friendship.findMany({
    where: { receiverId: userId, status: "PENDING" },
    include: { sender: { select: { id: true, username: true, elo: true } } }
  })

  res.json(pending.map(f => f.sender))
})

export default router