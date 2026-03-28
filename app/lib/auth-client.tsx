"use client"

import { createContext, PropsWithChildren, useContext, useEffect, useMemo, useState } from "react"
import type { Role, User } from "@/app/lib/types"
import { logout, tokenStore } from "@/app/lib/api"

type AuthState = {
  user: User | null
  role: Role | null
  isReady: boolean
  accessToken: string | null
  setSession: (user: User, accessToken: string) => void
  clearSession: () => void
}

const AuthContext = createContext<AuthState | null>(null)

function decodeJwt(token: string): { sub: string; role: Role; email: string; name: string } | null {
  try {
    const [, payload] = token.split(".")
    if (!payload) return null
    const json = JSON.parse(atob(payload.replace(/-/g, "+").replace(/_/g, "/")))
    if (!json?.sub || !json?.role || !json?.email || !json?.name) return null
    return { sub: String(json.sub), role: json.role as Role, email: String(json.email), name: String(json.name) }
  } catch {
    return null
  }
}

export function AuthProvider({ children }: PropsWithChildren) {
  const [accessToken, setAccessToken] = useState<string | null>(null)
  const [user, setUser] = useState<User | null>(null)
  const [isReady, setReady] = useState(false)

  useEffect(() => {
    const t = tokenStore.getToken()
    setAccessToken(t)
    if (t) {
      const claims = decodeJwt(t)
      if (claims) {
        setUser({
          id: claims.sub,
          name: claims.name,
          email: claims.email,
          role: claims.role,
          createdAt: new Date().toISOString(),
        })
      } else {
        tokenStore.setToken(null)
      }
    }
    setReady(true)
  }, [])

  const value = useMemo<AuthState>(() => {
    return {
      user,
      role: user?.role ?? null,
      isReady,
      accessToken,
      setSession(nextUser, nextToken) {
        tokenStore.setToken(nextToken)
        setAccessToken(nextToken)
        setUser(nextUser)
      },
      clearSession() {
        logout()
        setAccessToken(null)
        setUser(null)
      },
    }
  }, [accessToken, isReady, user])

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error("useAuth must be used within AuthProvider")
  return ctx
}

