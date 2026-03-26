import { prisma } from "@/app/lib/db"
import { errorJson, json } from "@/app/lib/http"
import { loginSchema } from "@/app/lib/schemas"
import { signAccessToken, verifyPassword } from "@/app/lib/auth"

export const runtime = "nodejs"

export async function POST(request: Request) {
  const body = await request.json().catch(() => null)
  const parsed = loginSchema.safeParse(body)
  if (!parsed.success) return errorJson(400, "Validation error", parsed.error.flatten())

  const { email, password } = parsed.data
  const user = await prisma.user.findUnique({
    where: { email },
    select: { id: true, name: true, email: true, role: true, passwordHash: true, createdAt: true },
  })
  if (!user) return errorJson(401, "Invalid credentials")

  const ok = await verifyPassword(password, user.passwordHash)
  if (!ok) return errorJson(401, "Invalid credentials")

  const token = await signAccessToken({
    sub: user.id,
    role: user.role,
    email: user.email,
    name: user.name,
  })

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { passwordHash, ...safeUser } = user
  return json({ user: safeUser, accessToken: token })
}

