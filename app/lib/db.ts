import { PrismaMariaDb } from "@prisma/adapter-mariadb"
import { PrismaClient } from "@/app/generated/prisma/client"
import { requireEnv } from "./env"

declare global {
  var __prisma: PrismaClient | undefined
}

function createPrismaClient() {
  const url = requireEnv("DATABASE_URL")
  const adapter = new PrismaMariaDb(url)
  return new PrismaClient({ adapter })
}

export const prisma: PrismaClient = globalThis.__prisma ?? createPrismaClient()

if (process.env.NODE_ENV !== "production") {
  globalThis.__prisma = prisma
}

