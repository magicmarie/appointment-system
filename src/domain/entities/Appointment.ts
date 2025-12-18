import { AppointmentId } from '../value-objects/Appointment_id.js';
import { Email } from '../value-objects/Email.js';
import { PhoneNumber } from '../value-objects/Phone_number.js';
import { AppointmentStatus } from '../value-objects/Appointment_status.js';
import { DomainEvent } from '../events/Domain_event.js';
import {
  AppointmentCreatedEvent,
  AppointmentConfirmedEvent,
  AppointmentCancelledEvent,
} from '../events/Appointment_event.js';

export interface AppointmentProps {
  id: AppointmentId;
  patientName: string;
  patientEmail: Email;
  patientPhone: PhoneNumber;
  appointmentDate: Date;
  reason: string;
  status: AppointmentStatus;
  createdAt: Date;
  updatedAt: Date;
  confirmedAt?: Date;
  cancelledAt?: Date;
  cancellationReason?: string;
}

export class Appointment {
  private props: AppointmentProps;
  private domainEvents: DomainEvent[] = [];

  private constructor(props: AppointmentProps) {
    this.props = props;
  }

  // Factory method for creating new appointments
  static create(params: {
    patientName: string;
    patientEmail: string;
    patientPhone: string;
    appointmentDate: Date;
    reason: string;
  }): Appointment {
    const id = AppointmentId.create();
    const now = new Date();

    // Validation: appointment must be in the future
    if (params.appointmentDate <= now) {
      throw new Error('Appointment date must be in the future');
    }

    // Validation: at least 1 hour from now
    const oneHourFromNow = new Date(now.getTime() + 60 * 60 * 1000);
    if (params.appointmentDate < oneHourFromNow) {
      throw new Error('Appointment must be at least 1 hour in the future');
    }

    const appointment = new Appointment({
      id,
      patientName: params.patientName.trim(),
      patientEmail: Email.create(params.patientEmail),
      patientPhone: PhoneNumber.create(params.patientPhone),
      appointmentDate: params.appointmentDate,
      reason: params.reason.trim(),
      status: AppointmentStatus.SCHEDULED,
      createdAt: now,
      updatedAt: now,
    });

    // Raise domain event
    appointment.addDomainEvent(
      new AppointmentCreatedEvent(id.getValue(), {
        patientName: appointment.props.patientName,
        patientEmail: appointment.props.patientEmail.getValue(),
        appointmentDate: appointment.props.appointmentDate,
        reason: appointment.props.reason,
      })
    );

    return appointment;
  }

  // Reconstitute from database
  static fromPersistence(props: AppointmentProps): Appointment {
    return new Appointment(props);
  }

  // Business logic: Confirm appointment
  confirm(): void {
    if (this.props.status !== AppointmentStatus.SCHEDULED) {
      throw new Error(`Cannot confirm appointment in ${this.props.status} status`);
    }

    this.props.status = AppointmentStatus.CONFIRMED;
    this.props.confirmedAt = new Date();
    this.props.updatedAt = new Date();

    this.addDomainEvent(
      new AppointmentConfirmedEvent(this.props.id.getValue(), {
        confirmedAt: this.props.confirmedAt,
      })
    );
  }

  // Business logic: Cancel appointment
  cancel(reason: string, cancelledBy: string): void {
    if (this.props.status === AppointmentStatus.CANCELLED) {
      throw new Error('Appointment is already cancelled');
    }

    if (this.props.status === AppointmentStatus.COMPLETED) {
      throw new Error('Cannot cancel a completed appointment');
    }

    this.props.status = AppointmentStatus.CANCELLED;
    this.props.cancelledAt = new Date();
    this.props.cancellationReason = reason;
    this.props.updatedAt = new Date();

    this.addDomainEvent(
      new AppointmentCancelledEvent(this.props.id.getValue(), {
        reason,
        cancelledBy,
      })
    );
  }

  // Business logic: Mark as completed
  complete(): void {
    if (this.props.status === AppointmentStatus.CANCELLED) {
      throw new Error('Cannot complete a cancelled appointment');
    }

    if (this.props.appointmentDate > new Date()) {
      throw new Error('Cannot complete a future appointment');
    }

    this.props.status = AppointmentStatus.COMPLETED;
    this.props.updatedAt = new Date();
  }

  // Getters
  get id(): AppointmentId {
    return this.props.id;
  }

  get patientName(): string {
    return this.props.patientName;
  }

  get patientEmail(): Email {
    return this.props.patientEmail;
  }

  get patientPhone(): PhoneNumber {
    return this.props.patientPhone;
  }

  get appointmentDate(): Date {
    return this.props.appointmentDate;
  }

  get reason(): string {
    return this.props.reason;
  }

  get status(): AppointmentStatus {
    return this.props.status;
  }

  get createdAt(): Date {
    return this.props.createdAt;
  }

  get updatedAt(): Date {
    return this.props.updatedAt;
  }

  get confirmedAt(): Date | undefined {
    return this.props.confirmedAt;
  }

  get cancelledAt(): Date | undefined {
    return this.props.cancelledAt;
  }

  get cancellationReason(): string | undefined {
    return this.props.cancellationReason;
  }

  // Domain events management
  private addDomainEvent(event: DomainEvent): void {
    this.domainEvents.push(event);
  }

  getDomainEvents(): DomainEvent[] {
    return [...this.domainEvents];
  }

  clearDomainEvents(): void {
    this.domainEvents = [];
  }

  // Convert to plain object (for persistence)
  toObject(): Record<string, unknown> {
    return {
      id: this.props.id.getValue(),
      patientName: this.props.patientName,
      patientEmail: this.props.patientEmail.getValue(),
      patientPhone: this.props.patientPhone.getValue(),
      appointmentDate: this.props.appointmentDate,
      reason: this.props.reason,
      status: this.props.status,
      createdAt: this.props.createdAt,
      updatedAt: this.props.updatedAt,
      confirmedAt: this.props.confirmedAt,
      cancelledAt: this.props.cancelledAt,
      cancellationReason: this.props.cancellationReason,
    };
  }
}
