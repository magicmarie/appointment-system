import { FastifyReply, FastifyRequest } from 'fastify'
import { AppointmentService } from '../services/appointment.service.js'
import {
  CreateAppointmentDTO,
  AppointmentResponse,
} from '../schemas/appointment.schemas.js'

export class AppointmentsController {
  constructor(private readonly service: AppointmentService) {}

  async create(
    request: FastifyRequest<{ Body: CreateAppointmentDTO }>,
    reply: FastifyReply
  ): Promise<void> {
    try {
      const appointment = await this.service.createAppointment(request.body)

      const response: AppointmentResponse = {
        id: appointment.id.getValue(),
        patientName: appointment.patientName,
        patientEmail: appointment.patientEmail.getValue(),
        patientPhone: appointment.patientPhone.getValue(),
        appointmentDate: appointment.appointmentDate.toISOString(),
        reason: appointment.reason,
        status: appointment.status,
        createdAt: appointment.createdAt.toISOString(),
        updatedAt: appointment.updatedAt.toISOString(),
      }

      reply.code(201).send(response)
    } catch (error) {
      throw error
    }
  }

  async getById(
    request: FastifyRequest<{ Params: { id: string } }>,
    reply: FastifyReply
  ): Promise<void> {
    const appointment = await this.service.getAppointment(request.params.id)

    if (!appointment) {
      reply.code(404).send({ error: 'Appointment not found' })
      return
    }

    const response: AppointmentResponse = {
      id: appointment.id.getValue(),
      patientName: appointment.patientName,
      patientEmail: appointment.patientEmail.getValue(),
      patientPhone: appointment.patientPhone.getValue(),
      appointmentDate: appointment.appointmentDate.toISOString(),
      reason: appointment.reason,
      status: appointment.status,
      createdAt: appointment.createdAt.toISOString(),
      updatedAt: appointment.updatedAt.toISOString(),
      confirmedAt: appointment.confirmedAt?.toISOString(),
      cancelledAt: appointment.cancelledAt?.toISOString(),
      cancellationReason: appointment.cancellationReason,
    }

    reply.send(response)
  }

  async list(
    request: FastifyRequest<{ Querystring: { email?: string; limit?: number } }>,
    reply: FastifyReply
  ): Promise<void> {
    const { email, limit } = request.query
    const appointments = await this.service.listAppointments(email, limit)

    const response = appointments.map((apt) => ({
      id: apt.id.getValue(),
      patientName: apt.patientName,
      patientEmail: apt.patientEmail.getValue(),
      patientPhone: apt.patientPhone.getValue(),
      appointmentDate: apt.appointmentDate.toISOString(),
      reason: apt.reason,
      status: apt.status,
      createdAt: apt.createdAt.toISOString(),
      updatedAt: apt.updatedAt.toISOString(),
    }))

    reply.send(response)
  }

  async confirm(
    request: FastifyRequest<{ Params: { id: string } }>,
    reply: FastifyReply
  ): Promise<void> {
    const appointment = await this.service.confirmAppointment(request.params.id)

    const response: AppointmentResponse = {
      id: appointment.id.getValue(),
      patientName: appointment.patientName,
      patientEmail: appointment.patientEmail.getValue(),
      patientPhone: appointment.patientPhone.getValue(),
      appointmentDate: appointment.appointmentDate.toISOString(),
      reason: appointment.reason,
      status: appointment.status,
      createdAt: appointment.createdAt.toISOString(),
      updatedAt: appointment.updatedAt.toISOString(),
      confirmedAt: appointment.confirmedAt?.toISOString(),
    }

    reply.send(response)
  }

  async cancel(
    request: FastifyRequest<{ Params: { id: string }; Body: { reason: string; cancelledBy: string } }>,
    reply: FastifyReply
  ): Promise<void> {
    const appointment = await this.service.cancelAppointment(
      request.params.id,
      request.body.reason,
      request.body.cancelledBy
    )

    const response: AppointmentResponse = {
      id: appointment.id.getValue(),
      patientName: appointment.patientName,
      patientEmail: appointment.patientEmail.getValue(),
      patientPhone: appointment.patientPhone.getValue(),
      appointmentDate: appointment.appointmentDate.toISOString(),
      reason: appointment.reason,
      status: appointment.status,
      createdAt: appointment.createdAt.toISOString(),
      updatedAt: appointment.updatedAt.toISOString(),
      cancelledAt: appointment.cancelledAt?.toISOString(),
      cancellationReason: appointment.cancellationReason,
    }

    reply.send(response)
  }
}
