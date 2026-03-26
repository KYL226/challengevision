import { prisma } from "@/app/lib/db"
import { errorJson, json, parseDate, parsePagination } from "@/app/lib/http"
import { requireAuth } from "@/app/lib/request"
import { reservationCreateSchema } from "@/app/lib/schemas"
import { findAvailableTable, isTableAvailable } from "@/app/lib/reservations"

export const runtime = "nodejs"

export async function GET(request: Request) {
  const auth = await requireAuth(request)
  if (auth instanceof Response) return auth

  const url = new URL(request.url)
  const { page, limit, skip } = parsePagination(url)

  const userIdFilter = url.searchParams.get("userId")
  const restaurantId = url.searchParams.get("restaurantId")
  const status = url.searchParams.get("status")

  const where = {
    ...(restaurantId ? { restaurantId } : {}),
    ...(status === "CONFIRMED" || status === "CANCELLED" ? { status } : {}),
    ...(auth.role === "ADMIN"
      ? userIdFilter
        ? { userId: userIdFilter }
        : {}
      : { userId: auth.userId }),
  }

  const [items, total] = await Promise.all([
    prisma.reservation.findMany({
      where,
      orderBy: { startAt: "desc" },
      skip,
      take: limit,
      include: {
        table: true,
        restaurant: true,
        user: auth.role === "ADMIN",
      },
    }),
    prisma.reservation.count({ where }),
  ])

  return json({ items, page, limit, total })
}

export async function POST(request: Request) {
  const auth = await requireAuth(request)
  if (auth instanceof Response) return auth

  const body = await request.json().catch(() => null)
  const parsed = reservationCreateSchema.safeParse(body)
  if (!parsed.success) return errorJson(400, "Validation error", parsed.error.flatten())

  const startAt = parseDate(parsed.data.startAt)
  const endAt = parseDate(parsed.data.endAt)
  if (endAt <= startAt) return errorJson(400, "endAt must be after startAt")

  const requestedUserId =
    auth.role === "ADMIN" && parsed.data.userId ? parsed.data.userId : auth.userId

  let tableId = parsed.data.tableId
  let restaurantId = parsed.data.restaurantId

  if (!tableId) {
    if (!restaurantId) return errorJson(400, "restaurantId is required when tableId is not provided")
    const cap = parsed.data.capacity
    if (!cap) return errorJson(400, "capacity is required when tableId is not provided")
    const found = await findAvailableTable({ restaurantId, capacity: cap, startAt, endAt })
    if (!found) return errorJson(409, "No table available for this time slot")
    tableId = found.id
  }

  const table = await prisma.table.findUnique({
    where: { id: tableId },
    select: { id: true, restaurantId: true },
  })
  if (!table) return errorJson(404, "Table not found")
  restaurantId = restaurantId ?? table.restaurantId

  const ok = await isTableAvailable(tableId, startAt, endAt)
  if (!ok) return errorJson(409, "Table not available for this time slot")

  const reservation = await prisma.reservation.create({
    data: {
      userId: requestedUserId,
      tableId,
      restaurantId,
      startAt,
      endAt,
      status: "CONFIRMED",
      events: {
        create: {
          type: "CREATED",
          actorUserId: auth.userId,
          snapshot: { startAt: startAt.toISOString(), endAt: endAt.toISOString(), tableId, restaurantId },
        },
      },
    },
    include: { table: true, restaurant: true },
  })

  return json(reservation, { status: 201 })
}

