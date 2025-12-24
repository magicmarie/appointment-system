import { Appointment } from '../../domain/entities/Appointment.js'
import { AppointmentId } from '../../domain/value-objects/Appointment_id.js'
import { Email } from '../../domain/value-objects/Email.js'
import { PhoneNumber } from '../../domain/value-objects/Phone_number.js'
import { AppointmentStatus } from '../../domain/value-objects/Appointment_status.js'

// Database document shape
export interface AppointmentDocument {
  _id: string;
  patientName: string;
  patientEmail: string;
  patientPhone: string;
  appointmentDate: Date;
  reason: string;
  status: AppointmentStatus;
  createdAt: Date;
  updatedAt: Date;
  confirmedAt?: Date | undefined;
  cancelledAt?: Date | undefined;
  cancellationReason?: string | undefined;
}

export class AppointmentMapper {
  // Domain entity → Database document
  static toPersistence(appointment: Appointment): AppointmentDocument {
    return {
      _id: appointment.id.getValue(),
      patientName: appointment.patientName,
      patientEmail: appointment.patientEmail.getValue(),
      patientPhone: appointment.patientPhone.getValue(),
      appointmentDate: appointment.appointmentDate,
      reason: appointment.reason,
      status: appointment.status,
      createdAt: appointment.createdAt,
      updatedAt: appointment.updatedAt,
      confirmedAt: appointment.confirmedAt,
      cancelledAt: appointment.cancelledAt,
      cancellationReason: appointment.cancellationReason,
    };
  }

  // Database document → Domain entity
  static toDomain(doc: AppointmentDocument): Appointment {
    return Appointment.fromPersistence({
      id: AppointmentId.fromString(doc._id),
      patientName: doc.patientName,
      patientEmail: Email.create(doc.patientEmail),
      patientPhone: PhoneNumber.create(doc.patientPhone),
      appointmentDate: doc.appointmentDate,
      reason: doc.reason,
      status: doc.status,
      createdAt: doc.createdAt,
      updatedAt: doc.updatedAt,
      ...(doc.confirmedAt && { confirmedAt: doc.confirmedAt }),
      ...(doc.cancelledAt && { cancelledAt: doc.cancelledAt }),
      ...(doc.cancellationReason && { cancellationReason: doc.cancellationReason }),
    })
  }
}
