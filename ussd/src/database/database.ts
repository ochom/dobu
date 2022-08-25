import knex, { Knex } from "knex";
import { Appointment } from "../models";

export interface Repo {
  createAppointment(data: Appointment): Promise<Boolean>;
  getMyAppointments(mobile: string): Promise<Appointment[]>;
  cancelAppointment(mobile: string, clinic: string): Promise<Boolean>;
  checkSlot(dateClinic: string): Promise<Boolean>;
  bookSlot(dateClinic: string): Promise<number>;
}

export class Repository implements Repo {
  db: Knex;
  slots: Object;

  constructor() {
    this.slots = {};
    this.db = knex({
      client: "pg",
      connection: {
        host: process.env.DB_HOST,
        user: process.env.DB_USER,
        port: parseInt(process.env.DB_PORT),
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME,
      },
    });

    this.db.schema.hasTable("appointments").then((exists) => {
      if (!exists) {
        this.db.schema
          .createTable("appointments", (table) => {
            table.increments("id").primary();
            table.string("status");
            table.string("clinic");
            table.dateTime("startTime");
            table.dateTime("endTime");
            table.string("patientMobile");
            table.dateTime("createdAt").defaultTo(this.db.fn.now());
            table.dateTime("updatedAt").defaultTo(this.db.fn.now());
          })
          .then(() => {
            console.log("Table created");
          });
      }
    });
  }

  async checkSlot(dateClinic: string): Promise<Boolean> {
    try {
      let availableSlots: number[] = this.slots[dateClinic] || [];
      if (availableSlots.length === 0) {
        availableSlots = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
        this.slots[dateClinic] = availableSlots;
        return true;
      }

      for (let i = 0; i <= 15; i++) {
        if (availableSlots[i] === 0) {
          return true;
        }
      }
      return false;
    } catch (e) {
      console.log("error getting slot", e.message);
      return false;
    }
  }

  async bookSlot(dateClinic: string): Promise<number> {
    try {
      const isSlotAvailable: Boolean = await this.checkSlot(dateClinic);
      if (!isSlotAvailable) {
        return -1;
      }

      const availableSlots = this.slots[dateClinic];
      for (let i = 0; i < availableSlots.length; i++) {
        if (availableSlots[i] === 0) {
          availableSlots[i] = 1;
          return i;
        }
      }
      return -1;
    } catch (e) {
      console.log("error getting slot", e.message);
      return -1;
    }
  }

  async createAppointment(data: Appointment): Promise<Boolean> {
    try {
      await this.db("appointments").insert(data);
      return true;
    } catch (e) {
      console.log("error creating appointment: ", e.message);
      return false;
    }
  }

  async cancelAppointment(mobile: string, clinic: string): Promise<Boolean> {
    try {
      const appointment: Appointment = await this.db("appointments")
        .where({
          patientMobile: mobile,
          clinic,
        })
        .first();

      if (appointment) {
        appointment.status = "cancelled";
        appointment.updatedAt = new Date();
      }
      await this.db("appointments")
        .update(appointment)
        .where({ id: appointment.id });
      return true;
    } catch (e) {
      console.log("error updating appointment: ", e.message);
      return false;
    }
  }

  async getMyAppointments(mobile: string): Promise<Appointment[]> {
    let appointments: Appointment[] = [];
    try {
      const res = await this.db<Appointment>("appointments")
        .where("patientMobile", mobile)
        .where("status", "confirmed")
        .orderBy("startTime", "asc");

      if (res) {
        appointments = res;
      }
    } catch (e) {
      console.log(e.message);
    }
    return appointments;
  }
}
