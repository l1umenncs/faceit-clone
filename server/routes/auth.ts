import { Router, Request, Response } from "express"
import bcrypt from "bcryptjs"
import { PrismaClient } from "@prisma/client"

const router = Router()
const prisma = new PrismaClient()

router.post("/register", async (req: Request, res: Response) => {
  const { username, password } = req.body

  const exists = await prisma.user.findUnique({
    where: { username }
  })

  if (exists) {
    res.status(400).json({ error: "Пользователь уже существует" })
    return
  }

  const hashedPassword = await bcrypt.hash(password, 10)

  const newUser = await prisma.user.create({
    data:
     { username,
       password: hashedPassword,
      elo: Math.floor(Math.random() * 2500) + 100 }
  })

  res.cookie("user", JSON.stringify({ id: newUser.id, username }), {
    httpOnly: true,
    maxAge: 7 * 24 * 60 * 60 * 1000
  })

  res.json({ username: newUser.username })
})

router.post("/login", async (req: Request, res: Response) => {
  const { username, password } = req.body

  const user = await prisma.user.findUnique({
    where: { username }
  })

  if (!user) {
    res.status(400).json({ error: "Неверный логин или пароль" })
    return
  }

  const valid = await bcrypt.compare(password, user.password)
  if (!valid) {
    res.status(400).json({ error: "Неверный логин или пароль" })
    return
  }

  res.cookie("user", JSON.stringify({ id: user.id, username }), {
    httpOnly: true,
    maxAge: 7 * 24 * 60 * 60 * 1000
  })

  res.json({ username: user.username })
})

router.get("/me", async (req: Request, res: Response) => {
  const userCookie = req.cookies.user
  if (!userCookie) {
    res.status(401).json({ error: "Не авторизован" })
    return
  }
  const { id } = JSON.parse(userCookie)
  const user = await prisma.user.findUnique({
    where: { id },
    select: { id: true, username: true, elo: true, description: true, region: true, avatar: true, createdAt: true }
  })
  if (!user) { res.status(404).json({ error: "Не найден" }); return }
  res.json(user)
})

router.post("/logout", (req: Request, res: Response) => {
  res.clearCookie("user")
  res.json({ message: "Вышел" })
})

router.get("/players", async (req: Request, res: Response) => {
  const players = await prisma.user.findMany({
    select: {
      id: true,
      username: true,
      elo: true,
      region: true,
      createdAt: true
    }
  })
  res.json(players)
})


router.get("/players/:id", async (req: Request, res: Response) => {
  const player = await prisma.user.findUnique({
    where: { id: Number(req.params.id) },
    select: {
      id: true,
      username: true,
      elo: true,
      region: true,
      description: true,
      createdAt: true
    }
  })

  if (!player) {
    res.status(404).json({ error: "Игрок не найден" })
    return
  }

  res.json(player)
})



router.put("/profile", async (req: Request, res: Response) => {
  const raw = req.cookies.user
  if (!raw) { res.status(401).json({ error: "Не авторизован" }); return }

  const { id } = JSON.parse(raw)
  const { description, region, avatar } = req.body

  const updated = await prisma.user.update({
    where: { id },
    data: {
      ...(description !== undefined && { description }),
      ...(region !== undefined && { region }),
      ...(avatar !== undefined && { avatar }),
    },
    select: { id: true, username: true, description: true, region: true, elo: true, avatar: true, createdAt: true }
  })

  res.json(updated)
})

router.get("/leaderboard", async (req: Request, res: Response) => {
  const players = await prisma.user.findMany({
    select: {
      id: true,
      username: true,
      elo: true,
      createdAt: true
    },
    orderBy: {
      elo: "desc"
    },
    take: 100
  })
  res.json(players)
})




export default router