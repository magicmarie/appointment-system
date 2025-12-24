import { FastifyInstance } from 'fastify'
import { AppointmentsController } from '../controllers/appointments.controller.js'
import { AppointmentService } from '../services/appointment.service.js'
import { MongoAppointmentRepository } from '../../infrastructure/mongodb/MongoAppointmentRepository.js'
import { EventPublisher } from '../../infrastructure/messaging/EventPublisher.js'
import {
  createAppointmentSchema,
  listAppointmentsSchema,
  cancelAppointmentSchema,
} from '../schemas/appointment.schemas.js'

export async function appointmentRoutes(fastify: FastifyInstance): Promise<void> {
  // Dependency injection
  const repository = new MongoAppointmentRepository()
  const eventPublisher = new EventPublisher()
  const service = new AppointmentService(repository, eventPublisher)
  const controller = new AppointmentsController(service)

  // OpenAPI tags for documentation
  const tags = ['appointments']

  // POST /appointments - Create appointment
  fastify.post(
    '/appointments',
    {
      schema: {
        tags,
        body: createAppointmentSchema,
        response: {
          201: { description: 'Appointment created' },
        },
      },
    },
    controller.create.bind(controller)
  )

  // GET /appointments/:id - Get appointment by ID
  fastify.get(
    '/appointments/:id',
    {
      schema: {
        tags,
        params: {
          type: 'object',
          properties: {
            id: { type: 'string', format: 'uuid' },
          },
        },
      },
    },
    controller.getById.bind(controller)
  )

  // GET /appointments - List appointments
  fastify.get(
    '/appointments',
    {
      schema: {
        tags,
        querystring: listAppointmentsSchema,
      },
    },
    controller.list.bind(controller)
  )

  // POST /appointments/:id/confirm - Confirm appointment
  fastify.post(
    '/appointments/:id/confirm',
    {
      schema: {
        tags,
        params: {
          type: 'object',
          properties: {
            id: { type: 'string', format: 'uuid' },
          },
        },
      },
    },
    controller.confirm.bind(controller)
  )

  // POST /appointments/:id/cancel - Cancel appointment
  fastify.post(
    '/appointments/:id/cancel',
    {
      schema: {
        tags,
        params: {
          type: 'object',
          properties: {
            id: { type: 'string', format: 'uuid' },
          },
        },
        body: cancelAppointmentSchema,
      },
    },
    controller.cancel.bind(controller)
  )
}
