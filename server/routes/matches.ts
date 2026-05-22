import { Router, Request, Response } from "express"
import { PrismaClient } from "@prisma/client"
import { createNotification } from "./notifications"
import { AppError } from "../index"
import { requireAuth } from "../utils"

const router = Router()
const prisma = new PrismaClient()

const GAMES = ["CS2", "Dota 2", "Valorant"]

router.get("/", async (req: Request, res: Response) => {
  const { game, status } = req.query

  const where: any = {}
  if (game && GAMES.includes(game as string)) where.game = game
  if (status) where.status = status

  const matches = await prisma.match.findMany({
    where,
    include: {
      creator: { select: { id: true, username: true } },
      players: { include: { user: { select: { id: true, username: true } } } }
    },
    orderBy: { createdAt: "desc" },
    take: 50
  })

  res.json(matches)
})

router.post("/", async (req: Request, res: Response) => {
  const userId = requireAuth(req)

  const { game, maxPlayers } = req.body
  if (!GAMES.includes(game)) throw new AppError("Неверная игра", 400)
  if (maxPlayers < 2 || maxPlayers > 20) throw new AppError("Неверное количество игроков", 400)

  const match = await prisma.match.create({
    data: { game, maxPlayers: Number(maxPlayers), createdById: userId },
    include: {
      creator: { select: { id: true, username: true } },
      players: { include: { user: { select: { id: true, username: true } } } }
    }
  })

  await prisma.matchPlayer.create({
    data: { matchId: match.id, userId, team: 1 }
  })

  const full = await prisma.match.findUnique({
    where: { id: match.id },
    include: {
      creator: { select: { id: true, username: true } },
      players: { include: { user: { select: { id: true, username: true } } } }
    }
  })

  res.json(full)
})

router.post("/:id/join", async (req: Request, res: Response) => {
  const userId = requireAuth(req)
  const matchId = Number(req.params.id)

  const match = await prisma.match.findUnique({
    where: { id: matchId },
    include: { players: true }
  })

  if (!match) throw new AppError("Матч не найден", 404)
  if (match.status !== "WAITING") throw new AppError("Матч уже начался", 400)
  if (match.players.length >= match.maxPlayers) throw new AppError("Матч полон", 400)
  if (match.players.some(p => p.userId === userId)) throw new AppError("Уже в матче", 400)

  const team1 = match.players.filter(p => p.team === 1).length
  const team2 = match.players.filter(p => p.team === 2).length
  const team = team1 <= team2 ? 1 : 2

  await prisma.matchPlayer.create({ data: { matchId, userId, team } })

  const joiner = await prisma.user.findUnique({ where: { id: userId }, select: { username: true } })
  if (match.createdById !== userId) {
    await createNotification(prisma, match.createdById, "match_join",
      `${joiner?.username} присоединился к твоему матчу`,
      `/matches/${matchId}`)
  }

  const updated = await prisma.match.findUnique({
    where: { id: matchId },
    include: {
      creator: { select: { id: true, username: true } },
      players: { include: { user: { select: { id: true, username: true } } } }
    }
  })

  res.json(updated)
})

router.post("/:id/leave", async (req: Request, res: Response) => {
  const userId = requireAuth(req)
  const matchId = Number(req.params.id)

  const mp = await prisma.matchPlayer.findUnique({
    where: { matchId_userId: { matchId, userId } }
  })

  if (!mp) throw new AppError("Не в матче", 400)

  await prisma.matchPlayer.delete({ where: { id: mp.id } })

  const remaining = await prisma.matchPlayer.count({ where: { matchId } })
  if (remaining === 0) {
    await prisma.match.delete({ where: { id: matchId } })
    res.json({ message: "Матч удалён" })
    return
  }

  const updated = await prisma.match.findUnique({
    where: { id: matchId },
    include: {
      creator: { select: { id: true, username: true } },
      players: { include: { user: { select: { id: true, username: true } } } }
    }
  })

  res.json(updated)
})

router.get("/:id", async (req: Request, res: Response) => {
  const match = await prisma.match.findUnique({
    where: { id: Number(req.params.id) },
    include: {
      creator: { select: { id: true, username: true } },
      players: { include: { user: { select: { id: true, username: true, elo: true } } } }
    }
  })

  if (!match) throw new AppError("Матч не найден", 404)
  res.json(match)
})

router.get("/history/:userId", async (req: Request, res: Response) => {
  const matches = await prisma.match.findMany({
    where: {
      players: { some: { userId: Number(req.params.userId) } }
    },
    include: {
      creator: { select: { id: true, username: true } },
      players: { include: { user: { select: { id: true, username: true } } } }
    },
    orderBy: { createdAt: "desc" },
    take: 20
  })

  res.json(matches)
})

export default router