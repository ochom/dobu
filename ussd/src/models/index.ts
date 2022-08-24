export type AppointmentStatus = "pending" | "confirmed" | "cancelled";

export interface Appointment {
  id?: number;
  status: AppointmentStatus;
  clinic: string;
  startTime: Date;
  endTime: Date;
  patientMobile: string;
  createdAt: Date;
  updatedAt: Date;
}
