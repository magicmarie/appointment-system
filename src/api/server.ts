import Fastify from 'fastify'
import swagger from '@fastify/swagger'
import swaggerUi from '@fastify/swagger-ui'
import { serializerCompiler, validatorCompiler, type ZodTypeProvider } from 'fastify-type-provider-zod'
import { config } from '../config.js'
import util from 'node:util'
import { initializeInfrastructure, shutdownInfrastructure } from '../infrastructure/index.js'
import { appointmentRoutes } from './routes/appointments.routes.js'
import { errorHandler } from './middleware/error-handler.js'

// Global uncaught exception handler for debugging
process.on('uncaughtException', (err) => {
  console.error('💥 UNCAUGHT EXCEPTION:')
  console.error('Error type:', typeof err)
  console.error('Error constructor:', err?.constructor?.name)
  
  if (err instanceof Error) {
    console.error('Message:', err.message)
    console.error('Stack:', err.stack)
  } else {
    console.error('Raw error:', util.inspect(err, { depth: 10, colors: true, showHidden: true }))
  }
  
  process.exit(1)
})

process.on('unhandledRejection', (reason, promise) => {
  console.error('💥 UNHANDLED REJECTION at:', promise)
  console.error('Reason:', util.inspect(reason, { depth: 10, colors: true, showHidden: true }))
  process.exit(1)
})

export async function buildServer() {
  const fastify = Fastify({
    logger: {
      level: config.LOG_LEVEL,
      transport: {
        target: 'pino-pretty',
        options: {
          colorize: true,
          translateTime: 'HH:MM:ss Z',
          ignore: 'pid,hostname',
        },
      },
    },
  })

  // Set Zod validators
  fastify.setValidatorCompiler(validatorCompiler)
  fastify.setSerializerCompiler(serializerCompiler)

  try {
    // Register Swagger for API documentation
    console.log('Registering Swagger...')
    await fastify.register(swagger, {
      openapi: {
        info: {
          title: 'Appointment System API',
          description: 'Event-driven appointment scheduling system',
          version: '1.0.0',
        },
        servers: [
          {
            url: `http://localhost:${config.PORT}`,
            description: 'Development server',
          },
        ],
      },
    })

    console.log('Registering Swagger UI...')
    await fastify.register(swaggerUi, {
      routePrefix: '/docs',
      uiConfig: {
        docExpansion: 'list',
        deepLinking: false,
      },
    })

    // Global error handler
    console.log('Registering error handler...')
    fastify.setErrorHandler(errorHandler)

    // Health check endpoint
    console.log('Registering health check...')
    fastify.get('/health', async () => ({ status: 'ok', timestamp: new Date().toISOString() }))

    // Register routes
    console.log('Registering appointment routes...')
    await fastify.register(appointmentRoutes, { prefix: '/api/v1' })

    console.log('Server build complete')
    return fastify.withTypeProvider<ZodTypeProvider>()
  } catch (error) {
    console.error('Error building server:')
    console.error(util.inspect(error, { depth: null, colors: true }))
    throw error
  }
}

export async function start() {
  try {
    console.log('Initializing infrastructure...')
    await initializeInfrastructure()

    console.log('Building Fastify server...')
    const fastify = await buildServer()

    console.log('Starting server listener...')
    await fastify.listen({ port: parseInt(config.PORT), host: '0.0.0.0' })

    console.log(`🚀 Server running at http://localhost:${config.PORT}`)
    console.log(`📚 API docs at http://localhost:${config.PORT}/docs`)
  } catch (error) {
    console.error('Failed to start server:')
    console.error(util.inspect(error, { depth: null, colors: true }))
    await shutdownInfrastructure()
    process.exit(1)
  }
}

// Graceful shutdown
process.on('SIGINT', async () => {
  await shutdownInfrastructure()
  process.exit(0)
})

if (process.env.NODE_ENV !== 'test') {
  start().catch((err) => {
    // Log full error object (handles non-Error throwables)
    console.error('Unhandled startup error:')
    console.error('Error type:', typeof err)
    console.error('Error constructor:', err?.constructor?.name)
    
    if (err instanceof Error) {
      console.error('Message:', err.message)
      console.error('Stack:', err.stack)
    } else {
      console.error('Raw error:', util.inspect(err, { depth: 10, colors: true, showHidden: true }))
    }
    
    process.exit(1)
  })
}
