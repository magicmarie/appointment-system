import { Appointment } from '../entities/Appointment.js'
import { AppointmentId } from '../value-objects/Appointment_id.js'

export interface AppointmentRepository {
  save(appointment: Appointment): Promise<void>
  findById(id: AppointmentId): Promise<Appointment | null>
  findByEmail(email: string): Promise<Appointment[]>
  findUpcoming(limit?: number): Promise<Appointment[]>
  delete(id: AppointmentId): Promise<void>
}
