"use client"

import Link from "next/link"
import { useEffect, useMemo, useState } from "react"
import { listRestaurants } from "@/app/lib/api"
import type { Restaurant } from "@/app/lib/types"

function todayIso() {
  const d = new Date()
  const yyyy = d.getFullYear()
  const mm = String(d.getMonth() + 1).padStart(2, "0")
  const dd = String(d.getDate()).padStart(2, "0")
  return `${yyyy}-${mm}-${dd}`
}

export default function RestaurantsPage() {
  const [q, setQ] = useState("")
  const [capacity, setCapacity] = useState<number>(2)
  const [date, setDate] = useState(todayIso())
  const [time, setTime] = useState("19:30")

  const [page, setPage] = useState(1)
  const [limit] = useState(9)
  const [items, setItems] = useState<Restaurant[]>([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const query = useMemo(() => ({ q, capacity, date, time, page, limit }), [q, capacity, date, time, page, limit])

  useEffect(() => {
    let alive = true
    setLoading(true)
    setError(null)
    listRestaurants(query)
      .then((res) => {
        if (!alive) return
        setItems(res.items)
        setTotal(res.total)
      })
      .catch((e) => alive && setError(e instanceof Error ? e.message : "Erreur"))
      .finally(() => alive && setLoading(false))
    return () => {
      alive = false
    }
  }, [query])

  const pageCount = Math.max(1, Math.ceil(total / limit))

  return (
    <div className="app-container py-8 sm:py-10">
      <div className="flex flex-col gap-8">
        <div className="space-y-2">
          <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">Restaurants</h1>
          <p className="text-sm text-[var(--muted-foreground)]">
            Filtre par capacité et créneau pour voir ceux qui ont une table disponible.
          </p>
        </div>

        <div className="card p-4 sm:p-5">
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-[var(--muted-foreground)]">Recherche</label>
              <input className="input" value={q} onChange={(e) => setQ(e.target.value)} placeholder="Nom, adresse..." />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-semibold text-[var(--muted-foreground)]">Personnes</label>
              <input
                className="input"
                value={capacity}
                onChange={(e) => setCapacity(Number(e.target.value) || 1)}
                type="number"
                min={1}
                max={20}
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-semibold text-[var(--muted-foreground)]">Date</label>
              <input className="input" value={date} onChange={(e) => setDate(e.target.value)} type="date" />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-semibold text-[var(--muted-foreground)]">Heure</label>
              <input className="input" value={time} onChange={(e) => setTime(e.target.value)} type="time" />
            </div>
          </div>
        </div>

        {loading ? (
          <div className="card p-6 text-sm text-[var(--muted-foreground)]">Chargement…</div>
        ) : error ? (
          <div className="card p-6 text-sm text-[var(--muted-foreground)]">{error}</div>
        ) : items.length === 0 ? (
          <div className="card p-6 text-sm text-[var(--muted-foreground)]">Aucun restaurant trouvé.</div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {items.map((r) => (
              <Link key={r.id} href={`/restaurants/${r.id}?capacity=${capacity}&date=${date}&time=${time}`}>
                <div className="card p-6 transition hover:-translate-y-0.5 hover:shadow-md">
                  <div className="flex items-start justify-between gap-3">
                    <div className="space-y-1">
                      <p className="text-base font-semibold">{r.name}</p>
                      <p className="text-sm text-[var(--muted-foreground)]">{r.address}</p>
                    </div>
                    <span className="rounded-full border bg-[var(--muted)] px-2 py-1 text-xs font-semibold text-[var(--muted-foreground)]">
                      {capacity} pers.
                    </span>
                  </div>
                  {r.description ? (
                    <p className="mt-4 line-clamp-3 text-sm text-[var(--muted-foreground)]">{r.description}</p>
                  ) : (
                    <p className="mt-4 text-sm text-[var(--muted-foreground)]">
                      Cliquez pour voir les tables disponibles.
                    </p>
                  )}
                </div>
              </Link>
            ))}
          </div>
        )}

        <div className="flex items-center justify-between">
          <p className="text-sm text-[var(--muted-foreground)]">
            Page {page} / {pageCount} • {total} résultat(s)
          </p>
          <div className="flex gap-2">
            <button className="btn btn-outline" onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page <= 1}>
              Précédent
            </button>
            <button
              className="btn btn-outline"
              onClick={() => setPage((p) => Math.min(pageCount, p + 1))}
              disabled={page >= pageCount}
            >
              Suivant
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

