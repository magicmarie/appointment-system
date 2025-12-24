import { Collection } from 'mongodb'
import { Appointment } from '../../domain/entities/Appointment.js'
import { AppointmentId } from '../../domain/value-objects/Appointment_id.js'
import { AppointmentStatus } from '../../domain/value-objects/Appointment_status.js'
import { AppointmentRepository } from '../../domain/repositories/AppointmentRepository.js'
import { mongoClient } from './MongoDBClient.js'
import { AppointmentMapper, AppointmentDocument } from './Appointment_mapper.js'

export class MongoAppointmentRepository implements AppointmentRepository {
  private collection: Collection<AppointmentDocument>

  constructor() {
    const db = mongoClient.getDb()
    this.collection = db.collection<AppointmentDocument>('appointments')
  }

  async save(appointment: Appointment): Promise<void> {
    const doc = AppointmentMapper.toPersistence(appointment)

    // Upsert pattern (insert or update)
    await this.collection.updateOne(
      { _id: doc._id },
      { $set: doc },
      { upsert: true },
    )
  }

  async findById(id: AppointmentId): Promise<Appointment | null> {
    const doc = await this.collection.findOne({ _id: id.getValue() })

    if (!doc) {
      return null
    }

    return AppointmentMapper.toDomain(doc)
  }

  async findByEmail(email: string): Promise<Appointment[]> {
    const docs = await this.collection
      .find({ patientEmail: email.toLowerCase() })
      .sort({ appointmentDate: -1 })
      .toArray()

    return docs.map(AppointmentMapper.toDomain)
  }

  async findUpcoming(limit: number = 50): Promise<Appointment[]> {
    const now = new Date()

    const docs = await this.collection
      .find({
        appointmentDate: { $gte: now },
        status: { $in: [AppointmentStatus.SCHEDULED, AppointmentStatus.CONFIRMED] },
      })
      .sort({ appointmentDate: 1 })
      .limit(limit)
      .toArray()

    return docs.map(AppointmentMapper.toDomain)
  }

  async delete(id: AppointmentId): Promise<void> {
    await this.collection.deleteOne({ _id: id.getValue() })
  }

  // Utility method for testing/debugging
  async count(): Promise<number> {
    return await this.collection.countDocuments()
  }
}
