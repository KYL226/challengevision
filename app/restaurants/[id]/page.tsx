"use client"

import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { use, useEffect, useMemo, useState } from "react"
import { createReservation, getRestaurant, listTables } from "@/app/lib/api"
import { useAuth } from "@/app/lib/auth-client"
import type { Restaurant, Table } from "@/app/lib/types"

function addMinutes(date: Date, minutes: number) {
  return new Date(date.getTime() + minutes * 60_000)
}

export default function RestaurantDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params)
  const router = useRouter()
  const sp = useSearchParams()
  const auth = useAuth()

  const capacity = Number(sp.get("capacity") ?? "2") || 2
  const date = sp.get("date") ?? ""
  const time = sp.get("time") ?? "19:30"

  const [restaurant, setRestaurant] = useState<Restaurant | null>(null)
  const [tables, setTables] = useState<Table[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [reserveLoading, setReserveLoading] = useState<string | null>(null)

  const range = useMemo(() => {
    const start = new Date(`${date}T${time}:00`)
    const end = addMinutes(start, 120)
    return { start, end }
  }, [date, time])

  useEffect(() => {
    let alive = true
    setLoading(true)
    setError(null)
    Promise.all([getRestaurant(resolvedParams.id), listTables(resolvedParams.id, { capacity, date, time })])
      .then(([r, t]) => {
        if (!alive) return
        setRestaurant(r)
        setTables(t.items)
      })
      .catch((e) => alive && setError(e instanceof Error ? e.message : "Erreur"))
      .finally(() => alive && setLoading(false))
    return () => {
      alive = false
    }
  }, [resolvedParams.id, capacity, date, time])

  async function reserve(tableId: string) {
    if (!auth.user) {
      router.push(`/login`)
      return
    }
    setReserveLoading(tableId)
    setError(null)
    try {
      await createReservation({
        tableId,
        startAt: range.start.toISOString(),
        endAt: range.end.toISOString(),
      })
      router.push("/my-reservations")
    } catch (e) {
      setError(e instanceof Error ? e.message : "Erreur")
    } finally {
      setReserveLoading(null)
    }
  }

  return (
    <div className="app-container py-8 sm:py-10">
      <div className="flex flex-col gap-8">
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-2">
            <p className="text-xs font-semibold text-[var(--muted-foreground)]">
              <Link className="underline underline-offset-4" href="/restaurants">
                Restaurants
              </Link>{" "}
              / Détails
            </p>
            <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">
              {restaurant?.name ?? "Restaurant"}
            </h1>
            <p className="text-sm text-[var(--muted-foreground)]">{restaurant?.address}</p>
          </div>
          <div className="hidden sm:block">
            <div className="rounded-2xl border bg-[var(--muted)] px-4 py-3 text-sm text-[var(--muted-foreground)]">
              {capacity} pers. • {date} • {time}
            </div>
          </div>
        </div>

        {loading ? (
          <div className="card p-6 text-sm text-[var(--muted-foreground)]">Chargement…</div>
        ) : error ? (
          <div className="card p-6 text-sm text-[var(--muted-foreground)]">{error}</div>
        ) : (
          <>
            {restaurant?.description ? (
              <div className="card p-6 text-sm text-[var(--muted-foreground)]">{restaurant.description}</div>
            ) : null}

            <div className="card p-6">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-base font-semibold">Tables disponibles</p>
                  <p className="mt-1 text-sm text-[var(--muted-foreground)]">
                    Créneau: {date} • {time} (120 min)
                  </p>
                </div>
                {!auth.user ? (
                  <Link href="/login" className="btn btn-primary">
                    Se connecter pour réserver
                  </Link>
                ) : null}
              </div>

              {tables.length === 0 ? (
                <div className="mt-6 rounded-2xl border bg-[var(--muted)] p-4 text-sm text-[var(--muted-foreground)]">
                  Aucune table dispo pour ce créneau. Essayez une autre heure ou une capacité différente.
                </div>
              ) : (
                <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                  {tables.map((t) => (
                    <div key={t.id} className="rounded-2xl border p-4">
                      <p className="text-sm font-semibold">Table {t.capacity} pers.</p>
                      <p className="mt-1 text-xs text-[var(--muted-foreground)]">ID: {t.id.slice(0, 8)}…</p>
                      <button
                        className="btn btn-primary mt-4 w-full"
                        onClick={() => reserve(t.id)}
                        disabled={reserveLoading === t.id}
                      >
                        {reserveLoading === t.id ? "Réservation..." : "Réserver"}
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  )
}

