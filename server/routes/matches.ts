import { Router, Request, Response } from "express"
import { PrismaClient } from "@prisma/client"
import { createNotification } from "./notifications"

const router = Router()
const prisma = new PrismaClient()

const getUserId = (req: Request): number | null => {
  const raw = req.cookies.user
  if (!raw) return null
  try { return JSON.parse(raw).id } catch { return null }
}

const GAMES = ["CS2", "Dota 2", "Valorant"]

// список матчей
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

// создать матч
router.post("/", async (req: Request, res: Response) => {
  const userId = getUserId(req)
  if (!userId) { res.status(401).json({ error: "Не авторизован" }); return }

  const { game, maxPlayers } = req.body
  if (!GAMES.includes(game)) { res.status(400).json({ error: "Неверная игра" }); return }
  if (maxPlayers < 2 || maxPlayers > 20) { res.status(400).json({ error: "Неверное количество игроков" }); return }

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

// join match
router.post("/:id/join", async (req: Request, res: Response) => {
  const userId = getUserId(req)
  if (!userId) { res.status(401).json({ error: "Не авторизован" }); return }

  const matchId = Number(req.params.id)
  const match = await prisma.match.findUnique({
    where: { id: matchId },
    include: { players: true }
  })

  if (!match) { res.status(404).json({ error: "Матч не найден" }); return }
  if (match.status !== "WAITING") { res.status(400).json({ error: "Матч уже начался" }); return }
  if (match.players.length >= match.maxPlayers) { res.status(400).json({ error: "Матч полон" }); return }
  if (match.players.some(p => p.userId === userId)) { res.status(400).json({ error: "Уже в матче" }); return }

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

// leave match
router.post("/:id/leave", async (req: Request, res: Response) => {
  const userId = getUserId(req)
  if (!userId) { res.status(401).json({ error: "Не авторизован" }); return }

  const matchId = Number(req.params.id)

  const mp = await prisma.matchPlayer.findUnique({
    where: { matchId_userId: { matchId, userId } }
  })

  if (!mp) { res.status(400).json({ error: "Не в матче" }); return }

  await prisma.matchPlayer.delete({ where: { id: mp.id } })

  // удалить матч если никого не осталось
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

// детали матча
router.get("/:id", async (req: Request, res: Response) => {
  const match = await prisma.match.findUnique({
    where: { id: Number(req.params.id) },
    include: {
      creator: { select: { id: true, username: true } },
      players: { include: { user: { select: { id: true, username: true, elo: true } } } }
    }
  })

  if (!match) { res.status(404).json({ error: "Матч не найден" }); return }
  res.json(match)
})

// история матчей пользователя
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
