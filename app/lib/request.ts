import { getBearerToken, verifyAccessToken } from "@/app/lib/auth"
import { errorJson } from "@/app/lib/http"

export type AuthContext = {
  userId: string
  role: "CLIENT" | "ADMIN"
  email: string
  name: string
}

export async function requireAuth(request: Request): Promise<AuthContext | Response> {
  const token = getBearerToken(request)
  if (!token) return errorJson(401, "Missing Bearer token")
  try {
    const claims = await verifyAccessToken(token)
    return {
      userId: claims.sub,
      role: claims.role,
      email: claims.email,
      name: claims.name,
    }
  } catch {
    return errorJson(401, "Invalid token")
  }
}

export function requireAdmin(auth: AuthContext): Response | null {
  if (auth.role !== "ADMIN") return errorJson(403, "Admin role required")
  return null
}

