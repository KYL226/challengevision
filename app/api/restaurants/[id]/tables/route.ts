import { prisma } from "@/app/lib/db"
import { errorJson, json, parseDate } from "@/app/lib/http"

export const runtime = "nodejs"

export async function GET(request: Request, ctx: { params: Promise<{ id: string }> }) {
  const { id: restaurantId } = await ctx.params
  const restaurant = await prisma.restaurant.findUnique({ where: { id: restaurantId }, select: { id: true } })
  if (!restaurant) return errorJson(404, "Restaurant not found")

  const url = new URL(request.url)
  const capacity = url.searchParams.get("capacity")
  const startAtRaw = url.searchParams.get("startAt")
  const endAtRaw = url.searchParams.get("endAt")
  const date = url.searchParams.get("date")
  const time = url.searchParams.get("time")
  const durationMinutes = Number(url.searchParams.get("durationMinutes") ?? "120") || 120

  const capacityInt = capacity ? Number(capacity) : null
  const hasRange = Boolean(startAtRaw && endAtRaw) || Boolean(date && time)
  const range = hasRange
    ? (() => {
        const startAt =
          startAtRaw && endAtRaw ? parseDate(startAtRaw) : parseDate(`${date}T${time}:00`)
        const endAt =
          startAtRaw && endAtRaw ? parseDate(endAtRaw) : new Date(startAt.getTime() + durationMinutes * 60_000)
        if (endAt <= startAt) throw new Error("Invalid time range")
        return { startAt, endAt }
      })()
    : null

  const tables = await prisma.table.findMany({
    where: {
      restaurantId,
      ...(capacityInt && Number.isFinite(capacityInt) ? { capacity: { gte: capacityInt } } : {}),
      ...(range
        ? {
            reservations: {
              none: {
                status: "CONFIRMED",
                startAt: { lt: range.endAt },
                endAt: { gt: range.startAt },
              },
            },
          }
        : {}),
    },
    orderBy: [{ capacity: "asc" }, { createdAt: "asc" }],
  })
  return json({ items: tables })
}

