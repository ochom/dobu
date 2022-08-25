import UssdMenu from "ussd-menu-builder";
import { Repo } from "../database/database";
import { Appointment } from "../models";
import { Menu } from "./menu";

const getClinic = (index: string): string => {
  const clinic = ["General", "Surgery", "Orthopedic"];
  return clinic[parseInt(index) - 1];
};

const getStartTime = (date: string, index: number): Date => {
  const startTime = new Date(`${date}T08:00:00`);
  const slotTime = index * 0.5;
  startTime.setTime(startTime.getTime() + slotTime * 3600000);
  return startTime;
};

const getEndTime = (startTime: Date): Date => {
  const endTime = new Date(startTime);
  endTime.setTime(endTime.getTime() + 30 * 60 * 1000);
  return endTime;
};

const bookingMenu = (repo: Repo, menu: UssdMenu): Menu[] => {
  const menus: Menu[] = [];
  menus.push({
    key: "booking.selectClinic",
    options: {
      run: () => {
        menu.con(
          "Select a clinic to visit:\n1. General Clinic\n2. Surgery Clinic\n3. Orthopedic Clinic"
        );
      },
      next: {
        "*^\\d{1}$": "booking.enterDateTime",
      },
    },
  });

  menus.push({
    key: "booking.enterDateTime",
    options: {
      run: async () => {
        // set the clinic choice to session
        await menu.session.set("clinic", getClinic(menu.val));
        menu.con(
          "Enter the appointment date (format DD/MM/YYYY e.g 15/01/2020):"
        );
      },
      next: {
        "*^\\d{2}/\\d{2}/\\d{4}$": "booking.confirm",
      },
    },
  });

  menus.push({
    key: "booking.confirm",
    options: {
      run: async () => {
        await menu.session.set("dateTime", menu.val);

        menu.con("Confirm your appointment?\n1. Yes\n2. Cancel");
      },
      next: {
        1: "booking.confirm.yes",
        2: "booking.confirm.no",
      },
    },
  });

  menus.push({
    key: "booking.confirm.yes",
    options: {
      run: async () => {
        const clinic = await menu.session.get("clinic");
        let dateTime: string = await menu.session.get("dateTime");

        // change date format to YYYY-MM-DD
        const parts = dateTime.split("/");
        dateTime = `${parts[2]}-${parts[1]}-${parts[0]}`;

        const dateClinic = `${dateTime}_clinic`;

        const bookedSlot = await repo.bookSlot(dateClinic);
        if (bookedSlot === -1) {
          return menu.end(
            `Sorry, all slots on this ${dateTime} at ${clinic} Clinic are booked. Please try another date.`
          );
        }

        const startTime = getStartTime(dateTime, bookedSlot);
        const endTime = getEndTime(startTime);
        const app: Appointment = {
          status: "confirmed",
          clinic,
          startTime,
          endTime,
          patientMobile: menu.args.phoneNumber,
        };

        await repo.createAppointment(app);

        menu.end(
          "Your appointment has been booked. Kindly wait for SMS confirmation. Thank you for choosing DoBu."
        );
      },
    },
  });

  return menus;
};

export default bookingMenu;
