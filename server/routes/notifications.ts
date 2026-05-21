import { Router, Request, Response } from "express"
import { PrismaClient } from "@prisma/client"

const router = Router()
const prisma = new PrismaClient()

const getUserId = (req: Request): number | null => {
  const raw = req.cookies.user
  if (!raw) return null
  try { return JSON.parse(raw).id } catch { return null }
}

router.get("/", async (req: Request, res: Response) => {
  const userId = getUserId(req)
  if (!userId) { res.status(401).json({ error: "Не авторизован" }); return }

  const notifications = await prisma.notification.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    take: 30
  })

  res.json(notifications)
})

router.post("/:id/read", async (req: Request, res: Response) => {
  const userId = getUserId(req)
  if (!userId) { res.status(401).json({ error: "Не авторизован" }); return }

  await prisma.notification.updateMany({
    where: { id: Number(req.params.id), userId },
    data: { read: true }
  })

  res.json({ message: "Прочитано" })
})

router.post("/read-all", async (req: Request, res: Response) => {
  const userId = getUserId(req)
  if (!userId) { res.status(401).json({ error: "Не авторизован" }); return }

  await prisma.notification.updateMany({
    where: { userId, read: false },
    data: { read: true }
  })

  res.json({ message: "Все прочитаны" })
})

export default router

export const createNotification = async (
  prisma: PrismaClient,
  userId: number,
  type: string,
  message: string,
  link?: string
) => {
  await prisma.notification.create({
    data: { userId, type, message, link }
  })
}
