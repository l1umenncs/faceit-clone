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
    data: { username, password: hashedPassword }
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

router.get("/me", (req: Request, res: Response) => {
  const userCookie = req.cookies.user
  if (!userCookie) {
    res.status(401).json({ error: "Не авторизован" })
    return
  }
  res.json(JSON.parse(userCookie))
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
      createdAt: true
    }
  })

  if (!player) {
    res.status(404).json({ error: "Игрок не найден" })
    return
  }

  res.json(player)
})




export default router