import { PrismaClient } from "@prisma/client"
import bcrypt from "bcryptjs"

const prisma = new PrismaClient()

async function seed() {
  const password = await bcrypt.hash("123456", 10)

  const s1 = await prisma.user.create({ data: { username: "ShadowStrike", password, elo: 1850, region: "EU", description: "Профессиональный игрок в CS2", avatar: "#e74c3c" } })
  const s2 = await prisma.user.create({ data: { username: "VenomX", password, elo: 2200, region: "NA", avatar: "#8e44ad" } })
  const s3 = await prisma.user.create({ data: { username: "CyberWolf", password, elo: 1300, region: "AS", description: "Ищу тиммейтов", avatar: "#2ecc71" } })
  const s4 = await prisma.user.create({ data: { username: "ProGamer42", password, elo: 2500, region: "EU", avatar: "#f1c40f" } })
  const s5 = await prisma.user.create({ data: { username: "NoobSlayer", password, elo: 450, region: "SA", avatar: "#e67e22" } })
  const s6 = await prisma.user.create({ data: { username: "FrostByte", password, elo: 1750, region: "EU", avatar: "#3498db" } })
  const s7 = await prisma.user.create({ data: { username: "NightHawk", password, elo: 900, region: "NA", avatar: "#2c3e50" } })
  const s8 = await prisma.user.create({ data: { username: "BlazeFury", password, elo: 1600, region: "OC", description: "Люблю Valorant", avatar: "#e74c3c" } })
  const s9 = await prisma.user.create({ data: { username: "StormRider", password, elo: 2000, region: "EU", avatar: "#1abc9c" } })
  const s10 = await prisma.user.create({ data: { username: "DeathNote", password, elo: 1100, region: "AS", avatar: "#34495e" } })

  await prisma.friendship.create({ data: { senderId: s1.id, receiverId: s2.id, status: "ACCEPTED" } })
  await prisma.friendship.create({ data: { senderId: s2.id, receiverId: s3.id, status: "ACCEPTED" } })
  await prisma.friendship.create({ data: { senderId: s4.id, receiverId: s1.id, status: "ACCEPTED" } })
  await prisma.friendship.create({ data: { senderId: s5.id, receiverId: s6.id, status: "PENDING" } })
  await prisma.friendship.create({ data: { senderId: s7.id, receiverId: s8.id, status: "ACCEPTED" } })

  const m1 = await prisma.match.create({ data: { game: "CS2", status: "WAITING", maxPlayers: 10, createdById: s1.id } })
  const m2 = await prisma.match.create({ data: { game: "Dota 2", status: "IN_PROGRESS", maxPlayers: 10, createdById: s4.id } })
  const m3 = await prisma.match.create({ data: { game: "Valorant", status: "FINISHED", maxPlayers: 10, createdById: s7.id } })
  const m4 = await prisma.match.create({ data: { game: "CS2", status: "WAITING", maxPlayers: 10, createdById: s3.id } })

  await prisma.matchPlayer.create({ data: { matchId: m1.id, userId: s1.id, team: 1, kills: 0, deaths: 0 } })
  await prisma.matchPlayer.create({ data: { matchId: m1.id, userId: s2.id, team: 2, kills: 0, deaths: 0 } })
  await prisma.matchPlayer.create({ data: { matchId: m2.id, userId: s4.id, team: 1, kills: 18, deaths: 12 } })
  await prisma.matchPlayer.create({ data: { matchId: m2.id, userId: s5.id, team: 1, kills: 22, deaths: 15 } })
  await prisma.matchPlayer.create({ data: { matchId: m3.id, userId: s7.id, team: 1, kills: 15, deaths: 10, win: true } })
  await prisma.matchPlayer.create({ data: { matchId: m3.id, userId: s8.id, team: 2, kills: 12, deaths: 14, win: false } })
  await prisma.matchPlayer.create({ data: { matchId: m4.id, userId: s3.id, team: 1, kills: 0, deaths: 0 } })
  await prisma.matchPlayer.create({ data: { matchId: m4.id, userId: s1.id, team: 2, kills: 0, deaths: 0 } })

  await prisma.notification.create({ data: { userId: s1.id, type: "friend_accepted", message: "VenomX принял ваш запрос в друзья", link: "/players/2" } })
  await prisma.notification.create({ data: { userId: s5.id, type: "friend_request", message: "FrostByte хочет добавить вас в друзья", link: "/players/6" } })

  console.log("Seed completed!")
}

seed().catch((e) => { console.error(e); process.exit(1) }).finally(() => prisma.$disconnect())
