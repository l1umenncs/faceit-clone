import { Request } from "express"
import { AppError } from "./index"

export const requireAuth = (req: Request): number => {
  const raw = req.cookies.user
  if (!raw) throw new AppError("Не авторизован", 401)
  try { return JSON.parse(raw).id } catch { throw new AppError("Не авторизован", 401) }
}