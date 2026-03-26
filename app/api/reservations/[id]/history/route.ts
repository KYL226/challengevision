import { prisma } from "@/app/lib/db"
import { errorJson, json } from "@/app/lib/http"
import { requireAuth } from "@/app/lib/request"

export const runtime = "nodejs"

export async function GET(request: Request, ctx: { params: Promise<{ id: string }> }) {
  const auth = await requireAuth(request)
  if (auth instanceof Response) return auth

  const { id } = await ctx.params
  const reservation = await prisma.reservation.findUnique({ where: { id }, select: { userId: true } })
  if (!reservation) return errorJson(404, "Reservation not found")
  if (auth.role !== "ADMIN" && reservation.userId !== auth.userId) return errorJson(403, "Forbidden")

  const events = await prisma.reservationEvent.findMany({
    where: { reservationId: id },
    orderBy: { at: "asc" },
  })
  return json({ items: events })
}

