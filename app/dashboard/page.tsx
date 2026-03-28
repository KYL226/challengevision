"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import { useEffect, useMemo, useState } from "react"
import {
  adminCreateRestaurant,
  adminCreateTable,
  adminDeleteRestaurant,
  adminDeleteTable,
  adminUpdateRestaurant,
  adminUpdateTable,
  getReservationHistory,
  getRestaurant,
  listReservations,
  listRestaurants,
} from "@/app/lib/api"
import { useAuth } from "@/app/lib/auth-client"
import { useToast } from "@/app/lib/toast"
import type { Reservation, ReservationEvent, Restaurant, Table } from "@/app/lib/types"

type Tab = "restaurants" | "tables" | "reservations" | "stats"

export default function DashboardPage() {
  const router = useRouter()
  const auth = useAuth()
  const toast = useToast()

  const [activeTab, setActiveTab] = useState<Tab>("restaurants")
  const [restaurants, setRestaurants] = useState<Restaurant[]>([])
  const [reservations, setReservations] = useState<Reservation[]>([])
  const [history, setHistory] = useState<ReservationEvent[]>([])
  const [selectedReservationId, setSelectedReservationId] = useState<string | null>(null)
  const [selectedRestaurantId, setSelectedRestaurantId] = useState<string | null>(null)
  const [tables, setTables] = useState<Table[]>([])
  const [tableEdit, setTableEdit] = useState<Record<string, number>>({})
  const [loading, setLoading] = useState(true)
  const [loadingReservations, setLoadingReservations] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [name, setName] = useState("")
  const [address, setAddress] = useState("")
  const [description, setDescription] = useState("")
  const [creating, setCreating] = useState(false)
  const [tableCapacity, setTableCapacity] = useState(2)
  const [creatingTable, setCreatingTable] = useState(false)

  useEffect(() => {
    if (!auth.isReady) return
    if (!auth.user) router.push("/login")
    else if (auth.user.role !== "ADMIN") router.push("/")
  }, [auth.isReady, auth.user, router])

  async function refreshRestaurants() {
    setLoading(true)
    try {
      const res = await listRestaurants({ page: 1, limit: 50 })
      setRestaurants(res.items)
      if (!selectedRestaurantId && res.items[0]) setSelectedRestaurantId(res.items[0].id)
    } catch (e) {
      setError(e instanceof Error ? e.message : "Erreur")
    } finally {
      setLoading(false)
    }
  }

  async function refreshReservations() {
    setLoadingReservations(true)
    try {
      const res = await listReservations({ page: 1, limit: 50 })
      setReservations(res.items)
    } catch (e) {
      setError(e instanceof Error ? e.message : "Erreur")
    } finally {
      setLoadingReservations(false)
    }
  }

  useEffect(() => {
    if (!auth.user || auth.user.role !== "ADMIN") return
    refreshRestaurants()
    refreshReservations()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [auth.user?.id])

  useEffect(() => {
    if (!selectedRestaurantId) return
    getRestaurant(selectedRestaurantId)
      .then((r) => setTables(r.tables))
      .catch(() => setTables([]))
  }, [selectedRestaurantId])

  const selected = useMemo(
    () => restaurants.find((r) => r.id === selectedRestaurantId) ?? null,
    [restaurants, selectedRestaurantId],
  )

  const stats = useMemo(() => {
    const totalReservations = reservations.length
    const confirmed = reservations.filter((r) => r.status === "CONFIRMED").length
    const cancelled = reservations.filter((r) => r.status === "CANCELLED").length
    return { totalReservations, confirmed, cancelled, totalRestaurants: restaurants.length, totalTables: tables.length }
  }, [reservations, restaurants.length, tables.length])

  async function onCreateRestaurant(e: React.FormEvent) {
    e.preventDefault()
    setCreating(true)
    try {
      const r = await adminCreateRestaurant({ name, address, description: description || undefined })
      setName("")
      setAddress("")
      setDescription("")
      setSelectedRestaurantId(r.id)
      await refreshRestaurants()
      toast.push("Restaurant créé", "success")
    } catch (e) {
      setError(e instanceof Error ? e.message : "Erreur")
      toast.push("Erreur création", "error")
    } finally {
      setCreating(false)
    }
  }

  async function onSaveRestaurant() {
    if (!selected) return
    try {
      await adminUpdateRestaurant(selected.id, { name: selected.name, address: selected.address, description: selected.description ?? "" })
      toast.push("Restaurant mis à jour", "success")
    } catch (e) {
      setError(e instanceof Error ? e.message : "Erreur")
      toast.push("Erreur mise à jour", "error")
    }
  }

  async function onDeleteRestaurant(id: string) {
    if (!confirm("Supprimer ce restaurant ?")) return
    try {
      await adminDeleteRestaurant(id)
      setSelectedRestaurantId(null)
      await refreshRestaurants()
      toast.push("Restaurant supprimé", "success")
    } catch (e) {
      setError(e instanceof Error ? e.message : "Erreur")
      toast.push("Erreur suppression", "error")
    }
  }

  async function onCreateTable(e: React.FormEvent) {
    e.preventDefault()
    if (!selectedRestaurantId) return
    setCreatingTable(true)
    try {
      await adminCreateTable({ restaurantId: selectedRestaurantId, capacity: tableCapacity })
      const r = await getRestaurant(selectedRestaurantId)
      setTables(r.tables)
      toast.push("Table ajoutée", "success")
    } catch (e) {
      setError(e instanceof Error ? e.message : "Erreur")
      toast.push("Erreur ajout table", "error")
    } finally {
      setCreatingTable(false)
    }
  }

  async function onUpdateTable(id: string) {
    const capacity = tableEdit[id]
    if (!capacity) return
    try {
      await adminUpdateTable(id, { capacity })
      if (selectedRestaurantId) {
        const r = await getRestaurant(selectedRestaurantId)
        setTables(r.tables)
      }
      toast.push("Table modifiée", "success")
    } catch (e) {
      setError(e instanceof Error ? e.message : "Erreur")
      toast.push("Erreur modification table", "error")
    }
  }

  async function onDeleteTable(id: string) {
    try {
      await adminDeleteTable(id)
      setTables((prev) => prev.filter((t) => t.id !== id))
      toast.push("Table supprimée", "success")
    } catch (e) {
      setError(e instanceof Error ? e.message : "Erreur")
      toast.push("Erreur suppression table", "error")
    }
  }

  async function onLoadHistory(id: string) {
    setSelectedReservationId(id)
    try {
      const out = await getReservationHistory(id)
      setHistory(out.items)
      setActiveTab("stats")
    } catch (e) {
      setError(e instanceof Error ? e.message : "Erreur")
    }
  }

  return (
    <div className="app-container py-8 sm:py-10">
      <div className="grid gap-4 lg:grid-cols-[240px_1fr]">
        <aside className="card h-fit p-3 lg:sticky lg:top-20">
          {(["restaurants", "tables", "reservations", "stats"] as Tab[]).map((tab) => (
            <button
              key={tab}
              className={[
                "mb-1 w-full rounded-xl px-3 py-2 text-left text-sm",
                activeTab === tab ? "bg-black text-white dark:bg-white dark:text-black" : "hover:bg-black/5 dark:hover:bg-white/10",
              ].join(" ")}
              onClick={() => setActiveTab(tab)}
            >
              {tab === "restaurants" ? "Restaurants" : tab === "tables" ? "Tables" : tab === "reservations" ? "Réservations" : "Stats"}
            </button>
          ))}
        </aside>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-semibold">Dashboard Admin</h1>
            <Link href="/api/docs" className="btn btn-outline">Swagger</Link>
          </div>
          {error ? <div className="card p-4 text-sm">{error}</div> : null}

          {activeTab === "restaurants" && (
            <div className="grid gap-4 lg:grid-cols-3">
              <div className="card p-4">
                <div className="mb-3 flex items-center justify-between">
                  <p className="font-semibold">Restaurants</p>
                  <button className="btn btn-ghost" onClick={refreshRestaurants}>Rafraîchir</button>
                </div>
                {loading ? <div className="space-y-2"><div className="h-4 animate-pulse rounded bg-black/10 dark:bg-white/10" /><div className="h-4 animate-pulse rounded bg-black/10 dark:bg-white/10" /></div> : (
                  <div className="grid gap-2">
                    {restaurants.map((r) => (
                      <button key={r.id} onClick={() => setSelectedRestaurantId(r.id)} className="rounded-xl border p-3 text-left">
                        <p className="font-medium">{r.name}</p>
                        <p className="text-xs text-[var(--muted-foreground)]">{r.address}</p>
                      </button>
                    ))}
                  </div>
                )}
                <form onSubmit={onCreateRestaurant} className="mt-4 space-y-2 border-t pt-4">
                  <input className="input" placeholder="Nom" value={name} onChange={(e) => setName(e.target.value)} required />
                  <input className="input" placeholder="Adresse" value={address} onChange={(e) => setAddress(e.target.value)} required />
                  <textarea className="input min-h-20" placeholder="Description" value={description} onChange={(e) => setDescription(e.target.value)} />
                  <button className="btn btn-primary w-full" disabled={creating}>{creating ? "Création..." : "Créer"}</button>
                </form>
              </div>
              <div className="card p-4 lg:col-span-2">
                {selected ? (
                  <div className="space-y-3">
                    <input className="input" value={selected.name} onChange={(e) => setRestaurants((p) => p.map((r) => r.id === selected.id ? { ...r, name: e.target.value } : r))} />
                    <input className="input" value={selected.address} onChange={(e) => setRestaurants((p) => p.map((r) => r.id === selected.id ? { ...r, address: e.target.value } : r))} />
                    <textarea className="input min-h-24" value={selected.description ?? ""} onChange={(e) => setRestaurants((p) => p.map((r) => r.id === selected.id ? { ...r, description: e.target.value } : r))} />
                    <div className="flex gap-2">
                      <button className="btn btn-primary" onClick={onSaveRestaurant}>Enregistrer</button>
                      <button className="btn btn-outline" onClick={() => onDeleteRestaurant(selected.id)}>Supprimer</button>
                    </div>
                  </div>
                ) : <p className="text-sm text-[var(--muted-foreground)]">Sélectionnez un restaurant.</p>}
              </div>
            </div>
          )}

          {activeTab === "tables" && (
            <div className="card p-4">
              <div className="mb-3 flex items-center justify-between">
                <p className="font-semibold">Tables</p>
                {selected && (
                  <form onSubmit={onCreateTable} className="flex gap-2">
                    <input className="input w-20" type="number" min={1} value={tableCapacity} onChange={(e) => setTableCapacity(Number(e.target.value) || 1)} />
                    <button className="btn btn-primary" disabled={creatingTable}>{creatingTable ? "..." : "Ajouter"}</button>
                  </form>
                )}
              </div>
              {!selected ? <p className="text-sm text-[var(--muted-foreground)]">Sélectionnez un restaurant dans l’onglet Restaurants.</p> : (
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                  {tables.map((t) => (
                    <div key={t.id} className="rounded-xl border p-3">
                      <p className="text-xs text-[var(--muted-foreground)]">{t.id.slice(0, 8)}…</p>
                      <div className="mt-2 flex gap-2">
                        <input className="input w-20" type="number" min={1} value={tableEdit[t.id] ?? t.capacity} onChange={(e) => setTableEdit((p) => ({ ...p, [t.id]: Number(e.target.value) || 1 }))} />
                        <button className="btn btn-outline" onClick={() => onUpdateTable(t.id)}>Modifier</button>
                      </div>
                      <button className="btn btn-ghost mt-2 w-full" onClick={() => onDeleteTable(t.id)}>Supprimer</button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === "reservations" && (
            <div className="card p-4">
              <div className="mb-3 flex items-center justify-between">
                <p className="font-semibold">Réservations</p>
                <button className="btn btn-outline" onClick={refreshReservations}>Rafraîchir</button>
              </div>
              {loadingReservations ? <div className="space-y-2"><div className="h-4 animate-pulse rounded bg-black/10 dark:bg-white/10" /><div className="h-4 animate-pulse rounded bg-black/10 dark:bg-white/10" /></div> : (
                <div className="grid gap-2">
                  {reservations.map((r) => (
                    <button key={r.id} onClick={() => onLoadHistory(r.id)} className="rounded-xl border p-3 text-left">
                      <p className="font-medium">{r.restaurant?.name ?? r.restaurantId}</p>
                      <p className="text-xs text-[var(--muted-foreground)]">{new Date(r.startAt).toLocaleString()} • {r.status}</p>
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === "stats" && (
            <div className="space-y-4">
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
                <div className="card p-3"><p className="text-xs">Restaurants</p><p className="text-2xl font-semibold">{stats.totalRestaurants}</p></div>
                <div className="card p-3"><p className="text-xs">Tables</p><p className="text-2xl font-semibold">{stats.totalTables}</p></div>
                <div className="card p-3"><p className="text-xs">Réservations</p><p className="text-2xl font-semibold">{stats.totalReservations}</p></div>
                <div className="card p-3"><p className="text-xs">Confirmées</p><p className="text-2xl font-semibold">{stats.confirmed}</p></div>
                <div className="card p-3"><p className="text-xs">Annulées</p><p className="text-2xl font-semibold">{stats.cancelled}</p></div>
              </div>
              <div className="card p-4">
                <p className="font-semibold">Historique {selectedReservationId ? `(${selectedReservationId.slice(0, 8)}…)` : ""}</p>
                {history.length === 0 ? <p className="mt-2 text-sm text-[var(--muted-foreground)]">Sélectionnez une réservation.</p> : (
                  <div className="mt-3 grid gap-2">
                    {history.map((h) => (
                      <div key={h.id} className="rounded-xl border p-3 text-sm">
                        <p className="font-medium">{h.type}</p>
                        <p className="text-xs text-[var(--muted-foreground)]">{new Date(h.at).toLocaleString()}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

