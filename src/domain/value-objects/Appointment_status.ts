export enum AppointmentStatus {
  SCHEDULED = 'SCHEDULED',
  CONFIRMED = 'CONFIRMED',
  CANCELLED = 'CANCELLED',
  COMPLETED = 'COMPLETED',
  NO_SHOW = 'NO_SHOW',
}

export function isValidStatus(status: string): status is AppointmentStatus {
  return Object.values(AppointmentStatus).includes(status as AppointmentStatus);
}
