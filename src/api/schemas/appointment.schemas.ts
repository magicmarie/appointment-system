import { z } from 'zod'

// Simple, minimal validation schemas for appointments

export const appointmentStatusSchema = z.enum([
  'SCHEDULED',
  'CONFIRMED',
  'CANCELLED',
  'COMPLETED',
  'NO_SHOW',
])

export const createAppointmentSchema = z.object({
  patientName: z.string().min(2),
  patientEmail: z.string().regex(/^[^\s@]+@[^\s@]+\.[^\s@]+$/),
  patientPhone: z.string().optional(),
  appointmentDate: z.string(), // ISO 8601 string expected
  reason: z.string().min(5),
})

export type CreateAppointmentDTO = z.infer<typeof createAppointmentSchema>

export const confirmAppointmentSchema = z.object({
  id: z.string().regex(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i),
})

export const cancelAppointmentSchema = z.object({
  id: z.string().regex(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i),
  reason: z.string().min(5),
  cancelledBy: z.string().min(2),
})

export const listAppointmentsSchema = z.object({
  email: z.string().regex(/^[^\s@]+@[^\s@]+\.[^\s@]+$/).optional(),
  limit: z.coerce.number().min(1).max(100).default(50),
})

export const appointmentResponseSchema = z.object({
  id: z.string().regex(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i),
  patientName: z.string(),
  patientEmail: z.string().regex(/^[^\s@]+@[^\s@]+\.[^\s@]+$/),
  patientPhone: z.string().optional(),
  appointmentDate: z.string(),
  reason: z.string(),
  status: appointmentStatusSchema,
  createdAt: z.string(),
  updatedAt: z.string(),
  confirmedAt: z.string().optional(),
  cancelledAt: z.string().optional(),
  cancellationReason: z.string().optional(),
})

export type AppointmentResponse = z.infer<typeof appointmentResponseSchema>
