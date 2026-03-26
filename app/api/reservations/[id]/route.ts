import { prisma } from "@/app/lib/db"
import { errorJson, json, parseDate } from "@/app/lib/http"
import { requireAuth } from "@/app/lib/request"
import { reservationUpdateSchema } from "@/app/lib/schemas"
import { isTableAvailable } from "@/app/lib/reservations"

export const runtime = "nodejs"

export async function GET(request: Request, ctx: { params: Promise<{ id: string }> }) {
  const auth = await requireAuth(request)
  if (auth instanceof Response) return auth

  const { id } = await ctx.params
  const reservation = await prisma.reservation.findUnique({
    where: { id },
    include: { table: true, restaurant: true, user: auth.role === "ADMIN" },
  })
  if (!reservation) return errorJson(404, "Reservation not found")
  if (auth.role !== "ADMIN" && reservation.userId !== auth.userId) return errorJson(403, "Forbidden")

  return json(reservation)
}

export async function PUT(request: Request, ctx: { params: Promise<{ id: string }> }) {
  const auth = await requireAuth(request)
  if (auth instanceof Response) return auth

  const { id } = await ctx.params
  const existing = await prisma.reservation.findUnique({ where: { id } })
  if (!existing) return errorJson(404, "Reservation not found")
  if (auth.role !== "ADMIN" && existing.userId !== auth.userId) return errorJson(403, "Forbidden")

  const body = await request.json().catch(() => null)
  const parsed = reservationUpdateSchema.safeParse(body)
  if (!parsed.success) return errorJson(400, "Validation error", parsed.error.flatten())

  const nextStatus = parsed.data.status
  if (nextStatus === "CANCELLED") {
    const reservation = await prisma.reservation.update({
      where: { id },
      data: {
        status: "CANCELLED",
        cancelledAt: new Date(),
        events: {
          create: { type: "CANCELLED", actorUserId: auth.userId },
        },
      },
      include: { table: true, restaurant: true },
    })
    return json(reservation)
  }

  const nextStartAt = parsed.data.startAt ? parseDate(parsed.data.startAt) : existing.startAt
  const nextEndAt = parsed.data.endAt ? parseDate(parsed.data.endAt) : existing.endAt
  if (nextEndAt <= nextStartAt) return errorJson(400, "endAt must be after startAt")

  const nextTableId = parsed.data.tableId ?? existing.tableId
  const ok = await isTableAvailable(nextTableId, nextStartAt, nextEndAt, id)
  if (!ok) return errorJson(409, "Table not available for this time slot")

  const table = await prisma.table.findUnique({ where: { id: nextTableId }, select: { restaurantId: true } })
  if (!table) return errorJson(404, "Table not found")

  const reservation = await prisma.reservation.update({
    where: { id },
    data: {
      tableId: nextTableId,
      restaurantId: table.restaurantId,
      startAt: nextStartAt,
      endAt: nextEndAt,
      events: {
        create: {
          type: "UPDATED",
          actorUserId: auth.userId,
          snapshot: {
            startAt: nextStartAt.toISOString(),
            endAt: nextEndAt.toISOString(),
            tableId: nextTableId,
            restaurantId: table.restaurantId,
          },
        },
      },
    },
    include: { table: true, restaurant: true },
  })

  return json(reservation)
}

export async function DELETE(request: Request, ctx: { params: Promise<{ id: string }> }) {
  const auth = await requireAuth(request)
  if (auth instanceof Response) return auth

  const { id } = await ctx.params
  const existing = await prisma.reservation.findUnique({ where: { id } })
  if (!existing) return errorJson(404, "Reservation not found")
  if (auth.role !== "ADMIN" && existing.userId !== auth.userId) return errorJson(403, "Forbidden")

  const reservation = await prisma.reservation.update({
    where: { id },
    data: {
      status: "CANCELLED",
      cancelledAt: new Date(),
      events: { create: { type: "CANCELLED", actorUserId: auth.userId } },
    },
    include: { table: true, restaurant: true },
  })
  return json(reservation)
}

