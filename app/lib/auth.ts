import bcrypt from "bcryptjs"
import { SignJWT, jwtVerify } from "jose"
import { requireEnv } from "@/app/lib/env"

const JWT_SECRET = () => new TextEncoder().encode(requireEnv("JWT_SECRET"))

export type JwtClaims = {
  sub: string
  role: "CLIENT" | "ADMIN"
  email: string
  name: string
}

export async function hashPassword(password: string) {
  return bcrypt.hash(password, 10)
}

export async function verifyPassword(password: string, passwordHash: string) {
  return bcrypt.compare(password, passwordHash)
}

export async function signAccessToken(claims: JwtClaims, expiresIn = "7d") {
  return new SignJWT({
    role: claims.role,
    email: claims.email,
    name: claims.name,
  })
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(claims.sub)
    .setIssuedAt()
    .setExpirationTime(expiresIn)
    .sign(JWT_SECRET())
}

export async function verifyAccessToken(token: string) {
  const { payload } = await jwtVerify(token, JWT_SECRET())
  const sub = payload.sub
  const role = payload.role
  const email = payload.email
  const name = payload.name

  if (
    typeof sub !== "string" ||
    (role !== "CLIENT" && role !== "ADMIN") ||
    typeof email !== "string" ||
    typeof name !== "string"
  ) {
    throw new Error("Invalid token payload")
  }

  return { sub, role, email, name } satisfies JwtClaims
}

export function getBearerToken(request: Request): string | null {
  const header = request.headers.get("authorization") ?? request.headers.get("Authorization")
  if (!header) return null
  const match = header.match(/^Bearer\s+(.+)$/i)
  return match?.[1] ?? null
}

