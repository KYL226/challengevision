import { prisma } from "@/app/lib/db"
import { errorJson, json } from "@/app/lib/http"
import { requireAdmin, requireAuth } from "@/app/lib/request"
import { tableCreateSchema } from "@/app/lib/schemas"

export const runtime = "nodejs"

export async function POST(request: Request) {
  const auth = await requireAuth(request)
  if (auth instanceof Response) return auth
  const denied = requireAdmin(auth)
  if (denied) return denied

  const body = await request.json().catch(() => null)
  const parsed = tableCreateSchema.safeParse(body)
  if (!parsed.success) return errorJson(400, "Validation error", parsed.error.flatten())

  const restaurant = await prisma.restaurant.findUnique({
    where: { id: parsed.data.restaurantId },
    select: { id: true },
  })
  if (!restaurant) return errorJson(404, "Restaurant not found")

  const table = await prisma.table.create({ data: parsed.data })
  return json(table, { status: 201 })
}

