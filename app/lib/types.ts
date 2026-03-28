export type Role = "CLIENT" | "ADMIN"

export type User = {
  id: string
  name: string
  email: string
  role: Role
  createdAt: string
}

export type Restaurant = {
  id: string
  name: string
  address: string
  description?: string | null
  createdAt: string
  updatedAt: string
}

export type Table = {
  id: string
  restaurantId: string
  capacity: number
  createdAt: string
  updatedAt: string
}

export type ReservationStatus = "CONFIRMED" | "CANCELLED"

export type Reservation = {
  id: string
  userId: string
  tableId: string
  restaurantId: string
  startAt: string
  endAt: string
  status: ReservationStatus
  cancelledAt?: string | null
  createdAt: string
  updatedAt: string
  restaurant?: Restaurant
  table?: Table
  user?: User
}

export type ReservationEvent = {
  id: string
  reservationId: string
  type: "CREATED" | "UPDATED" | "CANCELLED"
  actorUserId?: string | null
  at: string
  snapshot?: unknown
}

