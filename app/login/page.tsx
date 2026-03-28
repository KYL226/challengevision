"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { AuthCard } from "@/app/components/AuthCard"
import { login } from "@/app/lib/api"
import { useAuth } from "@/app/lib/auth-client"

export default function LoginPage() {
  const router = useRouter()
  const auth = useAuth()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setLoading(true)
    try {
      const out = await login({ email, password })
      auth.setSession(out.user, out.accessToken)
      router.push(out.user.role === "ADMIN" ? "/dashboard" : "/restaurants")
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur")
    } finally {
      setLoading(false)
    }
  }

  return (
    <AuthCard title="Se connecter" subtitle="Accédez à vos réservations et réservez en quelques clics.">
      <form onSubmit={onSubmit} className="space-y-4">
        <div className="space-y-2">
          <label className="text-sm font-medium">Email</label>
          <input
            className="input"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            type="email"
            autoComplete="email"
            placeholder="vous@exemple.com"
            required
          />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium">Mot de passe</label>
          <input
            className="input"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            type="password"
            autoComplete="current-password"
            required
          />
        </div>

        {error ? (
          <div className="rounded-xl border bg-[var(--muted)] px-3 py-2 text-sm text-[var(--muted-foreground)]">
            {error}
          </div>
        ) : null}

        <button className="btn btn-primary w-full" disabled={loading}>
          {loading ? "Connexion..." : "Connexion"}
        </button>

        <p className="text-sm text-[var(--muted-foreground)]">
          Pas de compte ?{" "}
          <Link href="/register" className="font-semibold underline underline-offset-4">
            Créer un compte
          </Link>
        </p>
      </form>
    </AuthCard>
  )
}

