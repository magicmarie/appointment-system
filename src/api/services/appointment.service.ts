import { Appointment } from '../../domain/entities/Appointment.js'
import { AppointmentId } from '../../domain/value-objects/Appointment_id.js'
import { AppointmentRepository } from '../../domain/repositories/AppointmentRepository.js'
import { EventPublisher } from '../../infrastructure/messaging/EventPublisher.js'
import { CreateAppointmentDTO } from '../schemas/appointment.schemas.js'

export class AppointmentService {
  constructor(
    private readonly repository: AppointmentRepository,
    private readonly eventPublisher: EventPublisher
  ) {}

  async createAppointment(dto: CreateAppointmentDTO): Promise<Appointment> {
    // Parse ISO date string to Date object
    const appointmentDate = new Date(dto.appointmentDate)

    // Create domain entity (validation happens here)
    const appointment = Appointment.create({
      patientName: dto.patientName,
      patientEmail: dto.patientEmail,
      patientPhone: dto.patientPhone ?? '',
      appointmentDate,
      reason: dto.reason,
    })

    // Save to database
    await this.repository.save(appointment)

    // Publish domain events to message queue
    const events = appointment.getDomainEvents()
    await this.eventPublisher.publishBatch(events)
    appointment.clearDomainEvents()

    return appointment
  }

  async getAppointment(id: string): Promise<Appointment | null> {
    const appointmentId = AppointmentId.fromString(id)
    return await this.repository.findById(appointmentId)
  }

  async listAppointments(email?: string, limit?: number): Promise<Appointment[]> {
    if (email) {
      return await this.repository.findByEmail(email)
    }
    return await this.repository.findUpcoming(limit)
  }

  async confirmAppointment(id: string): Promise<Appointment> {
    const appointmentId = AppointmentId.fromString(id)

    const appointment = await this.repository.findById(appointmentId)
    if (!appointment) {
      throw new Error('Appointment not found')
    }

    // Business logic (validation happens in domain)
    appointment.confirm()

    // Save changes
    await this.repository.save(appointment)

    // Publish events
    const events = appointment.getDomainEvents()
    await this.eventPublisher.publishBatch(events)
    appointment.clearDomainEvents()

    return appointment
  }

  async cancelAppointment(id: string, reason: string, cancelledBy: string): Promise<Appointment> {
    const appointmentId = AppointmentId.fromString(id)

    const appointment = await this.repository.findById(appointmentId)
    if (!appointment) {
      throw new Error('Appointment not found')
    }

    // Business logic
    appointment.cancel(reason, cancelledBy)

    // Save changes
    await this.repository.save(appointment)

    // Publish events
    const events = appointment.getDomainEvents()
    await this.eventPublisher.publishBatch(events)
    appointment.clearDomainEvents()

    return appointment
  }
}
