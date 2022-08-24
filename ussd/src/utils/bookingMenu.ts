import UssdMenu from "ussd-menu-builder";
import { Repo } from "../database/database";
import { Menu } from "./menu";

const getClinic = (index: string): string => {
  const clinic = ["General Clinical", "General Surgery", "Orthopedic"];
  return clinic[parseInt(index) - 1];
};

const bookingMenu = (repo: Repo, menu: UssdMenu): Menu[] => {
  const menus: Menu[] = [];
  menus.push({
    key: "booking.selectClinic",
    options: {
      run: () => {
        menu.con("Select a clinic to visit:");
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
          "Enter the appointment date (format DD/MM/YYY HH:MM e.g 15/01/2020 12:00):"
        );
      },
      next: {
        "*^\\d{2}/\\d{2}/\\d{4} \\d{2}:\\d{2}$": "booking.confirm",
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
        const dateTime: Date = new Date(await menu.session.get("dateTime"));

        const appointment = await repo.getAppointment(clinic, dateTime);
        if (appointment) {
          return menu.end(
            "Sorry, there is an appointment at this time,  please select some other time."
          );
        }
        menu.end(
          "Your appointment has been booked. Thank you for choosing DoBu."
        );
      },
    },
  });

  return menus;
};

export default bookingMenu;
