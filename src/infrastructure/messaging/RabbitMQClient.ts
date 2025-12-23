import * as amqp from 'amqplib'
import { config } from '../../config.js'

export const EXCHANGES = {
  APPOINTMENTS: 'appointments',
} as const

export const QUEUES = {
  APPOINTMENT_NOTIFICATIONS: 'appointment.notifications',
  APPOINTMENT_REMINDERS: 'appointment.reminders',
} as const

export const ROUTING_KEYS = {
  APPOINTMENT_CREATED: 'appointment.created',
  APPOINTMENT_CONFIRMED: 'appointment.confirmed',
  APPOINTMENT_CANCELLED: 'appointment.cancelled',
} as const

class RabbitMQClient {
  private static instance: RabbitMQClient
  private connection: amqp.Connection | null = null
  private channel: amqp.Channel | null = null

  private constructor() {}

  static getInstance(): RabbitMQClient {
    if (!RabbitMQClient.instance) {
      RabbitMQClient.instance = new RabbitMQClient()
    }
    return RabbitMQClient.instance
  }

  async connect(): Promise<void> {
    if (this.connection && this.channel) {
      return // Already connected
    }

    try {
      // Connect to RabbitMQ
      this.connection = (await amqp.connect(config.RABBITMQ_URI)) as unknown as amqp.Connection
      this.channel = (await (this.connection as unknown as { createChannel: () => Promise<amqp.Channel> }).createChannel()) as amqp.Channel

      console.log('RabbitMQ connected')

      // Set up topology
      await this.setupTopology()

      // Handle connection errors
      this.connection?.on('error', (err) => {
        console.error('RabbitMQ connection error:', err)
      })

      this.connection?.on('close', () => {
        console.warn('RabbitMQ connection closed')
      })
    } catch (error) {
      console.error('RabbitMQ connection failed:', error)
      throw error
    }
  }

  private async setupTopology(): Promise<void> {
    if (!this.channel) return

    // Create exchange (topic type for routing)
    await this.channel.assertExchange(EXCHANGES.APPOINTMENTS, 'topic', {
      durable: true, // Survive broker restarts
    })

    // Create queues
    await this.channel.assertQueue(QUEUES.APPOINTMENT_NOTIFICATIONS, {
      durable: true,
    })

    await this.channel.assertQueue(QUEUES.APPOINTMENT_REMINDERS, {
      durable: true,
    })

    // Bind queues to exchange with routing keys
    await this.channel.bindQueue(
      QUEUES.APPOINTMENT_NOTIFICATIONS,
      EXCHANGES.APPOINTMENTS,
      'appointment.*', // Match all appointment events
    )

    console.log('RabbitMQ topology created')
  }

  getChannel(): amqp.Channel {
    if (!this.channel) {
      throw new Error('RabbitMQ not connected. Call connect() first.')
    }
    return this.channel
  }

  async disconnect(): Promise<void> {
    try {
      if (this.channel) {
        await this.channel.close()
      }
      if (this.connection) {
        await (this.connection as unknown as { close: () => Promise<void> }).close()
      }
      console.log('RabbitMQ disconnected')
    } catch (error) {
      console.error('Error disconnecting RabbitMQ:', error)
    }
  }

  async healthCheck(): Promise<boolean> {
    return this.connection !== null && this.channel !== null
  }
}

export const rabbitMQClient = RabbitMQClient.getInstance()
