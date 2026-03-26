import { prisma } from "@/app/lib/db"
import { errorJson, json } from "@/app/lib/http"
import { requireAdmin, requireAuth } from "@/app/lib/request"
import { tableUpdateSchema } from "@/app/lib/schemas"

export const runtime = "nodejs"

export async function PUT(request: Request, ctx: { params: Promise<{ id: string }> }) {
  const auth = await requireAuth(request)
  if (auth instanceof Response) return auth
  const denied = requireAdmin(auth)
  if (denied) return denied

  const { id } = await ctx.params
  const body = await request.json().catch(() => null)
  const parsed = tableUpdateSchema.safeParse(body)
  if (!parsed.success) return errorJson(400, "Validation error", parsed.error.flatten())

  const table = await prisma.table.update({ where: { id }, data: parsed.data }).catch(() => null)
  if (!table) return errorJson(404, "Table not found")
  return json(table)
}

export async function DELETE(request: Request, ctx: { params: Promise<{ id: string }> }) {
  const auth = await requireAuth(request)
  if (auth instanceof Response) return auth
  const denied = requireAdmin(auth)
  if (denied) return denied

  const { id } = await ctx.params
  const deleted = await prisma.table.delete({ where: { id } }).catch(() => null)
  if (!deleted) return errorJson(404, "Table not found")
  return json({ ok: true })
}

