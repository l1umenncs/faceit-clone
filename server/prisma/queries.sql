-- ============================================
-- Задание 2. SQL-запросы
-- База: faceit_clone (PostgreSQL)
-- ============================================

-- 1. SELECT с условием WHERE
-- Игроки с ELO выше 1500
SELECT id, username, elo, region
FROM "User"
WHERE elo > 1500
ORDER BY elo DESC;

-- 2. INSERT
-- Добавить нового игрока
INSERT INTO "User" (username, password, elo, region)
VALUES ('TestPlayer', '$2a$10$dummyhash', 1200, 'EU');

-- Проверить, что добавилось
SELECT * FROM "User" WHERE username = 'TestPlayer';

-- 3. UPDATE
-- Повысить ELO игроку
UPDATE "User"
SET elo = elo + 100
WHERE username = 'TestPlayer';

-- Проверить обновление
SELECT username, elo FROM "User" WHERE username = 'TestPlayer';

-- 4. DELETE
-- Удалить тестового игрока
DELETE FROM "User"
WHERE username = 'TestPlayer';

-- 5. SELECT с JOIN
-- Все участники матчей с их никнеймами, убийствами и результатом
SELECT
  m.id AS match_id,
  m.game,
  u.username AS player,
  mp.kills,
  mp.deaths,
  mp.win
FROM "Match" m
JOIN "MatchPlayer" mp ON mp."matchId" = m.id
JOIN "User" u ON u.id = mp."userId"
ORDER BY m.id, mp.team;
