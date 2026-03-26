import { prisma } from "@/app/lib/db"
import { errorJson, json } from "@/app/lib/http"
import { requireAdmin, requireAuth } from "@/app/lib/request"
import { restaurantUpdateSchema } from "@/app/lib/schemas"

export const runtime = "nodejs"

export async function GET(_request: Request, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params
  const restaurant = await prisma.restaurant.findUnique({
    where: { id },
    include: { tables: true },
  })
  if (!restaurant) return errorJson(404, "Restaurant not found")
  return json(restaurant)
}

export async function PUT(request: Request, ctx: { params: Promise<{ id: string }> }) {
  const auth = await requireAuth(request)
  if (auth instanceof Response) return auth
  const denied = requireAdmin(auth)
  if (denied) return denied

  const { id } = await ctx.params
  const body = await request.json().catch(() => null)
  const parsed = restaurantUpdateSchema.safeParse(body)
  if (!parsed.success) return errorJson(400, "Validation error", parsed.error.flatten())

  const restaurant = await prisma.restaurant.update({ where: { id }, data: parsed.data }).catch(() => null)
  if (!restaurant) return errorJson(404, "Restaurant not found")
  return json(restaurant)
}

export async function DELETE(request: Request, ctx: { params: Promise<{ id: string }> }) {
  const auth = await requireAuth(request)
  if (auth instanceof Response) return auth
  const denied = requireAdmin(auth)
  if (denied) return denied

  const { id } = await ctx.params
  const deleted = await prisma.restaurant.delete({ where: { id } }).catch(() => null)
  if (!deleted) return errorJson(404, "Restaurant not found")
  return json({ ok: true })
}

