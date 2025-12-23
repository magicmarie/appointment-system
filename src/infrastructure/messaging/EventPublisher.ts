import { DomainEvent } from '../../domain/events/Domain_event.js'
import { rabbitMQClient, EXCHANGES, ROUTING_KEYS } from './RabbitMQClient.js'

export class EventPublisher {
  async publish(event: DomainEvent): Promise<void> {
    const channel = rabbitMQClient.getChannel()

    // Map event type to routing key
    const routingKey = this.getRoutingKey(event.eventType)

    // Serialize event
    const message = Buffer.from(
      JSON.stringify({
        eventId: event.eventId,
        eventType: event.eventType,
        occurredAt: event.occurredAt,
        aggregateId: event.aggregateId,
        payload: event.payload,
      })
    )

    // Publish to exchange
    const published = channel.publish(
      EXCHANGES.APPOINTMENTS,
      routingKey,
      message,
      {
        persistent: true, // Survive broker restarts
        contentType: 'application/json',
        timestamp: Date.now(),
      }
    )

    if (!published) {
      throw new Error(`Failed to publish event: ${event.eventType}`)
    }

    console.log(`📤 Published event: ${event.eventType} [${event.eventId}]`)
  }

  async publishBatch(events: DomainEvent[]): Promise<void> {
    for (const event of events) {
      await this.publish(event)
    }
  }

  private getRoutingKey(eventType: string): string {
    switch (eventType) {
      case 'AppointmentCreated':
        return ROUTING_KEYS.APPOINTMENT_CREATED
      case 'AppointmentConfirmed':
        return ROUTING_KEYS.APPOINTMENT_CONFIRMED
      case 'AppointmentCancelled':
        return ROUTING_KEYS.APPOINTMENT_CANCELLED
      default:
        return 'appointment.unknown'
    }
  }
}

export const eventPublisher = new EventPublisher()
