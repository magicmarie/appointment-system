import { mongoClient } from './mongodb/MongoDBClient.js'
import { rabbitMQClient } from './messaging/RabbitMQClient.js'

export async function initializeInfrastructure(): Promise<void> {
  console.log('Initializing infrastructure...')

  await mongoClient.connect()
  await rabbitMQClient.connect()

  console.log('Infrastructure ready\n')
}

export async function shutdownInfrastructure(): Promise<void> {
  console.log('Shutting down infrastructure...')

  await rabbitMQClient.disconnect()
  await mongoClient.disconnect()

  console.log('Infrastructure shut down\n')
}

// Graceful shutdown on process signals
process.on('SIGINT', async () => {
  await shutdownInfrastructure()
  process.exit(0)
})

process.on('SIGTERM', async () => {
  await shutdownInfrastructure()
  process.exit(0)
})
