import { prisma } from "@/app/lib/db"

export async function isTableAvailable(tableId: string, startAt: Date, endAt: Date, excludeReservationId?: string) {
  const conflict = await prisma.reservation.findFirst({
    where: {
      tableId,
      status: "CONFIRMED",
      ...(excludeReservationId ? { id: { not: excludeReservationId } } : {}),
      startAt: { lt: endAt },
      endAt: { gt: startAt },
    },
    select: { id: true },
  })
  return !conflict
}

export async function findAvailableTable(params: {
  restaurantId: string
  capacity: number
  startAt: Date
  endAt: Date
}) {
  const tables = await prisma.table.findMany({
    where: {
      restaurantId: params.restaurantId,
      capacity: { gte: params.capacity },
    },
    orderBy: [{ capacity: "asc" }, { createdAt: "asc" }],
    select: { id: true, capacity: true, restaurantId: true },
  })

  for (const t of tables) {
    const ok = await isTableAvailable(t.id, params.startAt, params.endAt)
    if (ok) return t
  }
  return null
}

