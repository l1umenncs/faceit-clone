import { Router, Request, Response } from "express"
import { PrismaClient } from "@prisma/client"
import { AppError } from "../index"
import { requireAuth } from "../utils"

const router = Router()
const prisma = new PrismaClient()

router.get("/", async (req: Request, res: Response) => {
  const userId = requireAuth(req)

  const notifications = await prisma.notification.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    take: 30
  })

  res.json(notifications)
})

router.post("/:id/read", async (req: Request, res: Response) => {
  const userId = requireAuth(req)

  await prisma.notification.updateMany({
    where: { id: Number(req.params.id), userId },
    data: { read: true }
  })

  res.json({ message: "Прочитано" })
})

router.post("/read-all", async (req: Request, res: Response) => {
  const userId = requireAuth(req)

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