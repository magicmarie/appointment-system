import { FastifyError, FastifyReply, FastifyRequest } from 'fastify'
import { ZodError, ZodIssue } from 'zod'

export async function errorHandler(
  error: FastifyError | ZodError,
  _request: FastifyRequest,
  reply: FastifyReply
): Promise<void> {
  // Zod validation errors
  if (error instanceof ZodError) {
    reply.code(400).send({
      error: 'Validation failed',
      details: error.issues.map((err: ZodIssue) => ({
        path: err.path.join('.'),
        message: err.message,
      })),
    })
    return
  }

  // Domain/business logic errors
  if (error.message && (error.message.includes('cannot') || error.message.includes('must'))) {
    reply.code(400).send({
      error: 'Business rule violation',
      message: error.message,
    })
    return
  }

  // Not found errors
  if (error.message && error.message.toLowerCase().includes('not found')) {
    reply.code(404).send({
      error: 'Not found',
      message: error.message,
    })
    return
  }

  // Log unexpected errors
  console.error('Unexpected error:', error)

  // Generic 500 error
  reply.code(500).send({
    error: 'Internal server error',
    message: 'An unexpected error occurred',
  })
}
