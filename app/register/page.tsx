"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { AuthCard } from "@/app/components/AuthCard"
import { register } from "@/app/lib/api"
import { useAuth } from "@/app/lib/auth-client"

export default function RegisterPage() {
  const router = useRouter()
  const auth = useAuth()
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setLoading(true)
    try {
      const out = await register({ name, email, password })
      auth.setSession(out.user, out.accessToken)
      router.push("/restaurants")
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur")
    } finally {
      setLoading(false)
    }
  }

  return (
    <AuthCard title="Créer un compte" subtitle="Réservez plus vite et gérez vos réservations.">
      <form onSubmit={onSubmit} className="space-y-4">
        <div className="space-y-2">
          <label className="text-sm font-medium">Nom</label>
          <input
            className="input"
            value={name}
            onChange={(e) => setName(e.target.value)}
            type="text"
            autoComplete="name"
            placeholder="Votre nom"
            required
          />
        </div>
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
            autoComplete="new-password"
            minLength={8}
            required
          />
          <p className="text-xs text-[var(--muted-foreground)]">Min. 8 caractères.</p>
        </div>

        {error ? (
          <div className="rounded-xl border bg-[var(--muted)] px-3 py-2 text-sm text-[var(--muted-foreground)]">
            {error}
          </div>
        ) : null}

        <button className="btn btn-primary w-full" disabled={loading}>
          {loading ? "Création..." : "Créer mon compte"}
        </button>

        <p className="text-sm text-[var(--muted-foreground)]">
          Déjà un compte ?{" "}
          <Link href="/login" className="font-semibold underline underline-offset-4">
            Se connecter
          </Link>
        </p>
      </form>
    </AuthCard>
  )
}

