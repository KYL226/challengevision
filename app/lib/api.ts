import type { Reservation, ReservationEvent, Restaurant, Table, User } from "@/app/lib/types"

type ApiError = { error?: { message?: string } }

function getToken() {
  if (typeof window === "undefined") return null
  return localStorage.getItem("accessToken")
}

function setToken(token: string | null) {
  if (typeof window === "undefined") return
  if (!token) localStorage.removeItem("accessToken")
  else localStorage.setItem("accessToken", token)
}

export const tokenStore = { getToken, setToken }

async function apiFetch<T>(path: string, init: RequestInit = {}): Promise<T> {
  const headers = new Headers(init.headers)
  if (!headers.has("content-type") && init.body) headers.set("content-type", "application/json")
  const token = getToken()
  if (token) headers.set("authorization", `Bearer ${token}`)

  const res = await fetch(path, { ...init, headers })
  if (!res.ok) {
    const payload = (await res.json().catch(() => ({}))) as ApiError
    throw new Error(payload?.error?.message ?? `HTTP ${res.status}`)
  }
  return (await res.json()) as T
}

export async function register(input: { name: string; email: string; password: string }) {
  const out = await apiFetch<{ user: User; accessToken: string }>("/api/auth/register", {
    method: "POST",
    body: JSON.stringify(input),
  })
  setToken(out.accessToken)
  return out
}

export async function login(input: { email: string; password: string }) {
  const out = await apiFetch<{ user: User; accessToken: string }>("/api/auth/login", {
    method: "POST",
    body: JSON.stringify(input),
  })
  setToken(out.accessToken)
  return out
}

export function logout() {
  setToken(null)
}

export async function listRestaurants(params: {
  page?: number
  limit?: number
  q?: string
  capacity?: number
  date?: string
  time?: string
  durationMinutes?: number
}) {
  const sp = new URLSearchParams()
  if (params.page) sp.set("page", String(params.page))
  if (params.limit) sp.set("limit", String(params.limit))
  if (params.q) sp.set("q", params.q)
  if (params.capacity) sp.set("capacity", String(params.capacity))
  if (params.date) sp.set("date", params.date)
  if (params.time) sp.set("time", params.time)
  if (params.durationMinutes) sp.set("durationMinutes", String(params.durationMinutes))
  return apiFetch<{ items: Restaurant[]; page: number; limit: number; total: number }>(
    `/api/restaurants?${sp.toString()}`,
  )
}

export async function getRestaurant(id: string) {
  return apiFetch<Restaurant & { tables: Table[] }>(`/api/restaurants/${id}`)
}

export async function listTables(restaurantId: string, params?: { capacity?: number; date?: string; time?: string }) {
  const sp = new URLSearchParams()
  if (params?.capacity) sp.set("capacity", String(params.capacity))
  if (params?.date) sp.set("date", params.date)
  if (params?.time) sp.set("time", params.time)
  const q = sp.toString()
  return apiFetch<{ items: Table[] }>(`/api/restaurants/${restaurantId}/tables${q ? `?${q}` : ""}`)
}

export async function adminCreateRestaurant(input: { name: string; address: string; description?: string }) {
  return apiFetch<Restaurant>("/api/restaurants", {
    method: "POST",
    body: JSON.stringify(input),
  })
}

export async function adminDeleteRestaurant(id: string) {
  return apiFetch<{ ok: true }>(`/api/restaurants/${id}`, { method: "DELETE" })
}

export async function adminUpdateRestaurant(
  id: string,
  input: Partial<{ name: string; address: string; description: string }>,
) {
  return apiFetch<Restaurant>(`/api/restaurants/${id}`, {
    method: "PUT",
    body: JSON.stringify(input),
  })
}

export async function adminCreateTable(input: { restaurantId: string; capacity: number }) {
  return apiFetch<Table>("/api/tables", { method: "POST", body: JSON.stringify(input) })
}

export async function adminUpdateTable(id: string, input: { capacity: number }) {
  return apiFetch<Table>(`/api/tables/${id}`, { method: "PUT", body: JSON.stringify(input) })
}

export async function adminDeleteTable(id: string) {
  return apiFetch<{ ok: true }>(`/api/tables/${id}`, { method: "DELETE" })
}

export async function createReservation(input: {
  restaurantId?: string
  tableId?: string
  capacity?: number
  startAt: string
  endAt: string
}) {
  return apiFetch<Reservation>("/api/reservations", {
    method: "POST",
    body: JSON.stringify(input),
  })
}

export async function listMyReservations(params?: { page?: number; limit?: number }) {
  const sp = new URLSearchParams()
  if (params?.page) sp.set("page", String(params.page))
  if (params?.limit) sp.set("limit", String(params.limit))
  const q = sp.toString()
  return apiFetch<{ items: Reservation[]; page: number; limit: number; total: number }>(
    `/api/reservations${q ? `?${q}` : ""}`,
  )
}

export async function listReservations(params?: {
  page?: number
  limit?: number
  userId?: string
  restaurantId?: string
  status?: "CONFIRMED" | "CANCELLED"
}) {
  const sp = new URLSearchParams()
  if (params?.page) sp.set("page", String(params.page))
  if (params?.limit) sp.set("limit", String(params.limit))
  if (params?.userId) sp.set("userId", params.userId)
  if (params?.restaurantId) sp.set("restaurantId", params.restaurantId)
  if (params?.status) sp.set("status", params.status)
  const q = sp.toString()
  return apiFetch<{ items: Reservation[]; page: number; limit: number; total: number }>(
    `/api/reservations${q ? `?${q}` : ""}`,
  )
}

export async function cancelReservation(id: string) {
  return apiFetch<Reservation>(`/api/reservations/${id}`, { method: "DELETE" })
}

export async function getReservationHistory(id: string) {
  return apiFetch<{ items: ReservationEvent[] }>(`/api/reservations/${id}/history`)
}

