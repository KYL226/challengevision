import { prisma } from "@/app/lib/db"
import { errorJson, json } from "@/app/lib/http"
import { registerSchema } from "@/app/lib/schemas"
import { hashPassword, signAccessToken } from "@/app/lib/auth"

export const runtime = "nodejs"

export async function POST(request: Request) {
  const body = await request.json().catch(() => null)
  const parsed = registerSchema.safeParse(body)
  if (!parsed.success) return errorJson(400, "Validation error", parsed.error.flatten())

  const { name, email, password } = parsed.data

  const existing = await prisma.user.findUnique({ where: { email } })
  if (existing) return errorJson(409, "Email already in use")

  let role: "CLIENT" | "ADMIN" = "CLIENT"
  const bootstrapTokenHeader = request.headers.get("x-bootstrap-token")
  const bootstrapToken = process.env.ADMIN_BOOTSTRAP_TOKEN
  if (bootstrapToken && bootstrapTokenHeader === bootstrapToken) {
    const adminCount = await prisma.user.count({ where: { role: "ADMIN" } })
    if (adminCount === 0) role = "ADMIN"
  }

  const user = await prisma.user.create({
    data: {
      name,
      email,
      passwordHash: await hashPassword(password),
      role,
    },
    select: { id: true, name: true, email: true, role: true, createdAt: true },
  })

  const token = await signAccessToken({
    sub: user.id,
    role: user.role,
    email: user.email,
    name: user.name,
  })

  return json({ user, accessToken: token }, { status: 201 })
}

