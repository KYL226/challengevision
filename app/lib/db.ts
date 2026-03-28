import { PrismaClient } from "@/app/generated/prisma/client"
import path from "node:path"
import { PrismaLibSql } from "@prisma/adapter-libsql"

declare global {
  var __prisma: PrismaClient | undefined
}

function createPrismaClient() {
  const url =
    process.env.DATABASE_URL && process.env.DATABASE_URL !== "undefined"
      ? process.env.DATABASE_URL
      : `file:${path.join(process.cwd(), "dev.db")}`
  const adapter = new PrismaLibSql({ url })
  return new PrismaClient({ adapter })
}

export const prisma: PrismaClient = globalThis.__prisma ?? createPrismaClient()

if (process.env.NODE_ENV !== "production") {
  globalThis.__prisma = prisma
}

