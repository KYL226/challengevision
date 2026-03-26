import { prisma } from "@/app/lib/db"
import { errorJson, json, parseDate, parsePagination } from "@/app/lib/http"
import { requireAdmin, requireAuth } from "@/app/lib/request"
import { restaurantCreateSchema } from "@/app/lib/schemas"

export const runtime = "nodejs"

export async function GET(request: Request) {
  const url = new URL(request.url)
  const q = (url.searchParams.get("q") ?? "").trim()
  const capacity = url.searchParams.get("capacity")
  const startAtRaw = url.searchParams.get("startAt")
  const endAtRaw = url.searchParams.get("endAt")
  const date = url.searchParams.get("date")
  const time = url.searchParams.get("time")
  const durationMinutes = Number(url.searchParams.get("durationMinutes") ?? "120") || 120
  const { page, limit, skip } = parsePagination(url)

  const capacityInt = capacity ? Number(capacity) : null

  const hasAvailabilityFilter = Boolean(startAtRaw && endAtRaw) || Boolean(date && time)
  const range =
    hasAvailabilityFilter && (capacityInt && Number.isFinite(capacityInt))
      ? (() => {
          const startAt =
            startAtRaw && endAtRaw ? parseDate(startAtRaw) : parseDate(`${date}T${time}:00`)
          const endAt =
            startAtRaw && endAtRaw ? parseDate(endAtRaw) : new Date(startAt.getTime() + durationMinutes * 60_000)
          if (endAt <= startAt) throw new Error("Invalid time range")
          return { startAt, endAt }
        })()
      : null

  const tablesFilter =
    capacityInt && Number.isFinite(capacityInt)
      ? range
        ? {
            tables: {
              some: {
                capacity: { gte: capacityInt },
                reservations: {
                  none: {
                    status: "CONFIRMED",
                    startAt: { lt: range.endAt },
                    endAt: { gt: range.startAt },
                  },
                },
              },
            },
          }
        : {
            tables: {
              some: { capacity: { gte: capacityInt } },
            },
          }
      : {}

  const where = {
    ...(q
      ? {
          OR: [
            { name: { contains: q, mode: "insensitive" as const } },
            { address: { contains: q, mode: "insensitive" as const } },
          ],
        }
      : {}),
    ...tablesFilter,
  }

  const [items, total] = await Promise.all([
    prisma.restaurant.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip,
      take: limit,
    }),
    prisma.restaurant.count({ where }),
  ])

  return json({ items, page, limit, total })
}

export async function POST(request: Request) {
  const auth = await requireAuth(request)
  if (auth instanceof Response) return auth
  const denied = requireAdmin(auth)
  if (denied) return denied

  const body = await request.json().catch(() => null)
  const parsed = restaurantCreateSchema.safeParse(body)
  if (!parsed.success) return errorJson(400, "Validation error", parsed.error.flatten())

  const restaurant = await prisma.restaurant.create({ data: parsed.data })
  return json(restaurant, { status: 201 })
}

