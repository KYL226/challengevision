import { z } from "zod"

export const registerSchema = z.object({
  name: z.string().min(1).max(100),
  email: z.string().email().max(320),
  password: z.string().min(8).max(200),
})

export const loginSchema = z.object({
  email: z.string().email().max(320),
  password: z.string().min(1).max(200),
})

export const restaurantCreateSchema = z.object({
  name: z.string().min(1).max(200),
  address: z.string().min(1).max(300),
  description: z.string().max(2000).optional(),
})

export const restaurantUpdateSchema = restaurantCreateSchema.partial().refine(
  (v) => Object.keys(v).length > 0,
  { message: "At least one field is required" },
)

export const tableCreateSchema = z.object({
  restaurantId: z.string().min(1),
  capacity: z.number().int().min(1).max(100),
})

export const tableUpdateSchema = z
  .object({
    capacity: z.number().int().min(1).max(100).optional(),
  })
  .refine((v) => Object.keys(v).length > 0, { message: "At least one field is required" })

export const reservationCreateSchema = z.object({
  userId: z.string().min(1).optional(),
  restaurantId: z.string().min(1).optional(),
  tableId: z.string().min(1).optional(),
  capacity: z.number().int().min(1).max(100).optional(),
  startAt: z.string().min(1),
  endAt: z.string().min(1),
})

export const reservationUpdateSchema = z
  .object({
    tableId: z.string().min(1).optional(),
    startAt: z.string().min(1).optional(),
    endAt: z.string().min(1).optional(),
    status: z.enum(["CONFIRMED", "CANCELLED"]).optional(),
  })
  .refine((v) => Object.keys(v).length > 0, { message: "At least one field is required" })

