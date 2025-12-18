import { randomUUID } from 'crypto';

export class AppointmentId {
  private constructor(private readonly value: string) {}

  static create(): AppointmentId {
    return new AppointmentId(randomUUID());
  }

  static fromString(id: string): AppointmentId {
    if (!id || id.trim().length === 0) {
      throw new Error('AppointmentId cannot be empty');
    }
    return new AppointmentId(id);
  }

  getValue(): string {
    return this.value;
  }

  equals(other: AppointmentId): boolean {
    return this.value === other.value;
  }

  toString(): string {
    return this.value;
  }
}
