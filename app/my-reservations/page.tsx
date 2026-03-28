"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { cancelReservation, listMyReservations } from "@/app/lib/api"
import { useAuth } from "@/app/lib/auth-client"
import type { Reservation } from "@/app/lib/types"

function formatRange(startAt: string, endAt: string) {
  const s = new Date(startAt)
  const e = new Date(endAt)
  const dd = String(s.getDate()).padStart(2, "0")
  const mm = String(s.getMonth() + 1).padStart(2, "0")
  const yyyy = s.getFullYear()
  const hh = String(s.getHours()).padStart(2, "0")
  const min = String(s.getMinutes()).padStart(2, "0")
  const eh = String(e.getHours()).padStart(2, "0")
  const emin = String(e.getMinutes()).padStart(2, "0")
  return `${dd}/${mm}/${yyyy} • ${hh}:${min} → ${eh}:${emin}`
}

export default function MyReservationsPage() {
  const router = useRouter()
  const auth = useAuth()
  const [items, setItems] = useState<Reservation[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [cancelId, setCancelId] = useState<string | null>(null)

  useEffect(() => {
    if (auth.isReady && !auth.user) router.push("/login")
  }, [auth.isReady, auth.user, router])

  useEffect(() => {
    if (!auth.user) return
    let alive = true
    setLoading(true)
    setError(null)
    listMyReservations({ page: 1, limit: 20 })
      .then((res) => alive && setItems(res.items))
      .catch((e) => alive && setError(e instanceof Error ? e.message : "Erreur"))
      .finally(() => alive && setLoading(false))
    return () => {
      alive = false
    }
  }, [auth.user])

  async function onCancel(id: string) {
    setCancelId(id)
    setError(null)
    try {
      const updated = await cancelReservation(id)
      setItems((prev) => prev.map((r) => (r.id === id ? updated : r)))
    } catch (e) {
      setError(e instanceof Error ? e.message : "Erreur")
    } finally {
      setCancelId(null)
    }
  }

  return (
    <div className="app-container py-8 sm:py-10">
      <div className="flex flex-col gap-6">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div className="space-y-2">
            <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">Mes réservations</h1>
            <p className="text-sm text-[var(--muted-foreground)]">Consultez et annulez vos réservations.</p>
          </div>
          <Link href="/restaurants" className="btn btn-primary">
            Nouvelle réservation
          </Link>
        </div>

        {loading ? (
          <div className="card p-6 text-sm text-[var(--muted-foreground)]">Chargement…</div>
        ) : error ? (
          <div className="card p-6 text-sm text-[var(--muted-foreground)]">{error}</div>
        ) : items.length === 0 ? (
          <div className="card p-6 text-sm text-[var(--muted-foreground)]">
            Vous n’avez pas encore de réservation.
          </div>
        ) : (
          <div className="grid gap-3">
            {items.map((r) => (
              <div key={r.id} className="card p-5">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                  <div className="space-y-1">
                    <p className="text-sm font-semibold">
                      {r.restaurant?.name ?? "Restaurant"} • Table {r.table?.capacity ?? "?"} pers.
                    </p>
                    <p className="text-sm text-[var(--muted-foreground)]">{formatRange(r.startAt, r.endAt)}</p>
                    <p className="text-xs text-[var(--muted-foreground)]">ID: {r.id}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span
                      className={[
                        "rounded-full border px-2 py-1 text-xs font-semibold",
                        r.status === "CONFIRMED"
                          ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-300"
                          : "bg-zinc-500/10 text-zinc-600 dark:text-zinc-300",
                      ].join(" ")}
                    >
                      {r.status}
                    </span>
                    <button
                      className="btn btn-outline"
                      onClick={() => onCancel(r.id)}
                      disabled={r.status !== "CONFIRMED" || cancelId === r.id}
                    >
                      {cancelId === r.id ? "Annulation..." : "Annuler"}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

