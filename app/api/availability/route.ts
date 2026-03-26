import { prisma } from "@/app/lib/db"
import { errorJson, json } from "@/app/lib/http"
import { findAvailableTable, isTableAvailable } from "@/app/lib/reservations"

export const runtime = "nodejs"

export async function GET(request: Request) {
  const url = new URL(request.url)
  const restaurantId = url.searchParams.get("restaurantId") ?? undefined
  const tableId = url.searchParams.get("tableId") ?? undefined
  const capacity = url.searchParams.get("capacity")
  const startAtRaw = url.searchParams.get("startAt")
  const endAtRaw = url.searchParams.get("endAt")

  const date = url.searchParams.get("date")
  const time = url.searchParams.get("time")
  const durationMinutes = Number(url.searchParams.get("durationMinutes") ?? "120") || 120

  if (!startAtRaw || !endAtRaw) {
    if (!date || !time) return errorJson(400, "Provide startAt/endAt or date/time")
  }

  const startAt =
    startAtRaw && endAtRaw
      ? new Date(startAtRaw)
      : new Date(`${date}T${time}:00`)
  const endAt =
    startAtRaw && endAtRaw ? new Date(endAtRaw) : new Date(startAt.getTime() + durationMinutes * 60_000)

  if (Number.isNaN(startAt.getTime()) || Number.isNaN(endAt.getTime()) || endAt <= startAt) {
    return errorJson(400, "Invalid time range")
  }

  if (tableId) {
    const table = await prisma.table.findUnique({ where: { id: tableId }, select: { id: true, restaurantId: true } })
    if (!table) return errorJson(404, "Table not found")
    const ok = await isTableAvailable(tableId, startAt, endAt)
    return json({ available: ok, tableId, startAt, endAt })
  }

  if (!restaurantId) return errorJson(400, "restaurantId is required when tableId is not provided")
  const cap = capacity ? Number(capacity) : NaN
  if (!Number.isFinite(cap) || cap <= 0) return errorJson(400, "capacity is required when tableId is not provided")

  const table = await findAvailableTable({ restaurantId, capacity: cap, startAt, endAt })
  return json({ available: Boolean(table), table, startAt, endAt })
}

