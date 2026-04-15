import { z } from 'zod'

const dateString = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Invalid date format (YYYY-MM-DD)')

export const MotorcycleSchema = z.object({
  license_plate: z.string().max(10),
  model: z.string().max(100).optional().nullable(),
  make: z.string().max(100).optional().nullable(),
  year: z.string().max(10).optional().nullable(),
  color: z.string().max(50).optional().nullable(),
  renavam: z.string().max(20).optional().nullable(),
  chassis: z.string().max(20).optional().nullable(),
  fuel: z.string().max(50).optional().nullable(),
  engine_capacity: z.string().max(20).optional().nullable(),
  previous_owner: z.string().max(200).optional().nullable(),
  previous_owner_cpf: z.string().max(14).optional().nullable(),
  purchase_date: dateString.optional().nullable(),
  fipe_value: z.number().positive().max(9999999).optional().nullable(),
  maintenance_up_to_date: z.boolean().optional().nullable(),
  status: z.enum(['available', 'rented', 'maintenance', 'inactive']).optional(),
  photo_url: z.string().url().optional().nullable(),
  km_current: z.number().int().min(0).optional().nullable(),
  observations: z.string().max(2000).optional().nullable(),
})

export const CustomerSchema = z.object({
  name: z.string().min(1).max(200),
  cpf: z.string().max(14).optional().nullable(),
  rg: z.string().max(20).optional().nullable(),
  state: z.string().max(2).optional().nullable(),
  phone: z.string().max(20).optional().nullable(),
  email: z.string().email().max(200).optional().nullable(),
  address: z.string().max(1000).optional().nullable(),
  zip_code: z.string().max(10).optional().nullable(),
  emergency_contact: z.string().max(300).optional().nullable(),
  drivers_license: z.string().max(20).optional().nullable(),
  drivers_license_validity: dateString.optional().nullable(),
  drivers_license_category: z.string().max(10).optional().nullable(),
  birth_date: dateString.optional().nullable(),
  payment_status: z.string().max(50).optional().nullable(),
  observations: z.string().max(2000).optional().nullable(),
  in_queue: z.boolean().optional(),
  active: z.boolean().optional(),
  departure_date: dateString.optional().nullable(),
  departure_reason: z.string().max(1000).optional().nullable(),
})

export const BillingSchema = z.object({
  contract_id: z.string().uuid().optional().nullable(),
  customer_id: z.string().uuid(),
  description: z.string().min(1).max(300),
  amount: z.number().positive().max(9999999),
  due_date: dateString,
  status: z.enum(['pending', 'paid', 'overdue', 'loss']).optional(),
  payment_date: dateString.optional().nullable(),
  observations: z.string().max(2000).optional().nullable(),
})

export const IncomeSchema = z.object({
  vehicle: z.string().max(10),
  date: dateString,
  lessee: z.string().min(1).max(200),
  amount: z.number().positive().max(9999999),
  reference: z.string().max(50).optional().nullable(),
  payment_method: z.string().max(50).optional().nullable(),
  period_from: dateString.optional().nullable(),
  period_to: dateString.optional().nullable(),
  observations: z.string().max(2000).optional().nullable(),
})

export const ExpenseSchema = z.object({
  description: z.string().min(1).max(300),
  amount: z.number().positive().max(9999999),
  category: z.string().max(100),
  date: dateString,
  motorcycle_id: z.string().uuid().optional().nullable(),
  observations: z.string().max(2000).optional().nullable(),
})

export const FineSchema = z.object({
  customer_id: z.string().uuid(),
  motorcycle_id: z.string().uuid(),
  description: z.string().min(1).max(300),
  amount: z.number().positive().max(9999999),
  infraction_date: dateString,
  due_date: dateString.optional().nullable(),
  status: z.enum(['pending', 'paid']).optional(),
  payment_date: dateString.optional().nullable(),
  responsible: z.enum(['customer', 'company']).optional(),
  observations: z.string().max(2000).optional().nullable(),
})

export type MotorcycleInput = z.infer<typeof MotorcycleSchema>
export type CustomerInput = z.infer<typeof CustomerSchema>
export type BillingInput = z.infer<typeof BillingSchema>
export type IncomeInput = z.infer<typeof IncomeSchema>
export type ExpenseInput = z.infer<typeof ExpenseSchema>
export type FineInput = z.infer<typeof FineSchema>
