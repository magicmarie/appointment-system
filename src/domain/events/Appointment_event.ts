import { randomUUID } from 'crypto'
import { DomainEvent } from './Domain_event.js'

export class AppointmentCreatedEvent implements DomainEvent {
  readonly eventId: string;
  readonly eventType = 'AppointmentCreated';
  readonly occurredAt: Date;

  constructor(
    readonly aggregateId: string,
    readonly payload: {
      patientName: string;
      patientEmail: string;
      appointmentDate: Date;
      reason: string;
    }
  ) {
    this.eventId = randomUUID();
    this.occurredAt = new Date();
  }
}

export class AppointmentConfirmedEvent implements DomainEvent {
  readonly eventId: string;
  readonly eventType = 'AppointmentConfirmed';
  readonly occurredAt: Date;

  constructor(
    readonly aggregateId: string,
    readonly payload: {
      confirmedAt: Date;
    }
  ) {
    this.eventId = randomUUID();
    this.occurredAt = new Date();
  }
}

export class AppointmentCancelledEvent implements DomainEvent {
  readonly eventId: string;
  readonly eventType = 'AppointmentCancelled';
  readonly occurredAt: Date;

  constructor(
    readonly aggregateId: string,
    readonly payload: {
      reason: string;
      cancelledBy: string;
    }
  ) {
    this.eventId = randomUUID();
    this.occurredAt = new Date();
  }
}
