-- ============================================
-- Скрипт создания базы данных FACEIT Clone
-- СУБД: PostgreSQL
-- ============================================

-- Таблица пользователей
CREATE TABLE IF NOT EXISTS "User" (
    "id" SERIAL NOT NULL PRIMARY KEY,
    "username" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "elo" INTEGER NOT NULL DEFAULT 1000,
    "description" TEXT,
    "region" TEXT NOT NULL DEFAULT 'EU',
    "avatar" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE UNIQUE INDEX IF NOT EXISTS "User_username_key" ON "User"("username");

-- Таблица дружбы
CREATE TABLE IF NOT EXISTS "Friendship" (
    "id" SERIAL NOT NULL PRIMARY KEY,
    "senderId" INTEGER NOT NULL,
    "receiverId" INTEGER NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY ("senderId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    FOREIGN KEY ("receiverId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
CREATE UNIQUE INDEX IF NOT EXISTS "Friendship_senderId_receiverId_key" ON "Friendship"("senderId", "receiverId");

-- Таблица матчей
CREATE TABLE IF NOT EXISTS "Match" (
    "id" SERIAL NOT NULL PRIMARY KEY,
    "game" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'WAITING',
    "maxPlayers" INTEGER NOT NULL DEFAULT 10,
    "createdById" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "finishedAt" TIMESTAMP(3),
    FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- Таблица участников матча
CREATE TABLE IF NOT EXISTS "MatchPlayer" (
    "id" SERIAL NOT NULL PRIMARY KEY,
    "matchId" INTEGER NOT NULL,
    "userId" INTEGER NOT NULL,
    "team" INTEGER,
    "kills" INTEGER NOT NULL DEFAULT 0,
    "deaths" INTEGER NOT NULL DEFAULT 0,
    "win" BOOLEAN,
    FOREIGN KEY ("matchId") REFERENCES "Match"("id") ON DELETE CASCADE ON UPDATE CASCADE,
    FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
CREATE UNIQUE INDEX IF NOT EXISTS "MatchPlayer_matchId_userId_key" ON "MatchPlayer"("matchId", "userId");

-- Таблица уведомлений
CREATE TABLE IF NOT EXISTS "Notification" (
    "id" SERIAL NOT NULL PRIMARY KEY,
    "userId" INTEGER NOT NULL,
    "type" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "link" TEXT,
    "read" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- ============================================
-- Заполнение тестовыми данными
-- ============================================

INSERT INTO "User" (username, password, elo, region) VALUES
('ShadowStrike', '$2a$10$hash1', 1850, 'EU'),
('VenomX', '$2a$10$hash2', 2200, 'NA'),
('CyberWolf', '$2a$10$hash3', 1300, 'AS'),
('ProGamer42', '$2a$10$hash4', 2500, 'EU'),
('NoobSlayer', '$2a$10$hash5', 450, 'SA'),
('FrostByte', '$2a$10$hash6', 1750, 'EU'),
('NightHawk', '$2a$10$hash7', 900, 'NA'),
('BlazeFury', '$2a$10$hash8', 1600, 'OC'),
('StormRider', '$2a$10$hash9', 2000, 'EU'),
('DeathNote', '$2a$10$hash10', 1100, 'AS');

INSERT INTO "Friendship" (senderId, receiverId, status) VALUES
(1, 2, 'ACCEPTED'),
(2, 3, 'ACCEPTED'),
(4, 1, 'ACCEPTED'),
(5, 6, 'PENDING'),
(7, 8, 'ACCEPTED');

INSERT INTO "Match" (game, status, maxPlayers, createdById) VALUES
('CS2', 'WAITING', 10, 1),
('Dota 2', 'IN_PROGRESS', 10, 4),
('Valorant', 'FINISHED', 10, 7),
('CS2', 'WAITING', 10, 3);

INSERT INTO "MatchPlayer" (matchId, userId, team, kills, deaths, win) VALUES
(1, 1, 1, 0, 0, NULL),
(1, 2, 2, 0, 0, NULL),
(2, 4, 1, 18, 12, NULL),
(2, 5, 1, 22, 15, NULL),
(3, 7, 1, 15, 10, true),
(3, 8, 2, 12, 14, false),
(4, 3, 1, 0, 0, NULL),
(4, 1, 2, 0, 0, NULL);
