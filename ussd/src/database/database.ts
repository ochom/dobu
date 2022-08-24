import knex, { Knex } from "knex";
import { Appointment } from "../models";

export interface Repo {
  getAppointment(clinic: string, dateTime: Date): Promise<Appointment | null>;
  getMyAppointments(mobile: string): Promise<Appointment[]>;
}

export class Repository implements Repo {
  db: Knex;

  constructor() {
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

  async getAppointment(
    clinic: string,
    dateTime: Date
  ): Promise<Appointment | null> {
    let app: Appointment = null;
    try {
      // get appointment that ends after the dateTime and confirmed
      const res = await this.db<Appointment>("appointments")
        .where("clinic", clinic)
        .where("endTime", ">=", dateTime)
        .where("status", "confirmed")
        .first();

      if (app) {
        app = res;
      }
    } catch (e) {
      console.log(e.message);
    }
    return app;
  }

  async getMyAppointments(mobile: string): Promise<Appointment[]> {
    let appointments: Appointment[] = [];
    try {
      const res = await this.db<Appointment>("appointments")
        .where("patientMobile", mobile)
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
