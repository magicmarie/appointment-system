import { MongoClient, Db } from 'mongodb'
import { config } from '../../config.js'

class MongoDBClient {
  private static instance: MongoDBClient
  private client: MongoClient | null = null
  private db: Db | null = null

  private constructor() {}

  static getInstance(): MongoDBClient {
    if (!MongoDBClient.instance) {
      MongoDBClient.instance = new MongoDBClient()
    }
    return MongoDBClient.instance
  }

  async connect(): Promise<void> {
    if (this.client) {
      return // Already connected
    }

    try {
      this.client = await MongoClient.connect(config.MONGODB_URI)
      this.db = this.client.db()
      console.log('MongoDB connected')

      // Create indexes
      await this.createIndexes()
    } catch (error) {
      console.error('MongoDB connection failed:', error)
      throw error
    }
  }

  private async createIndexes(): Promise<void> {
    if (!this.db) return

    const appointmentsCollection = this.db.collection('appointments')

    // Index for querying by email
    await appointmentsCollection.createIndex({ patientEmail: 1 })

    // Index for querying by date range
    await appointmentsCollection.createIndex({ appointmentDate: 1 })

    // Index for querying by status
    await appointmentsCollection.createIndex({ status: 1 })

    // Compound index for common queries
    await appointmentsCollection.createIndex({
      patientEmail: 1,
      appointmentDate: 1,
    })

    console.log('✅ MongoDB indexes created')
  }

  getDb(): Db {
    if (!this.db) {
      throw new Error('MongoDB not connected. Call connect() first.')
    }
    return this.db
  }

  async disconnect(): Promise<void> {
    if (this.client) {
      await this.client.close()
      this.client = null
      this.db = null
      console.log('✅ MongoDB disconnected')
    }
  }

  async healthCheck(): Promise<boolean> {
    try {
      if (!this.db) return false
      await this.db.admin().ping()
      return true
    } catch {
      return false
    }
  }
}

export const mongoClient = MongoDBClient.getInstance()
