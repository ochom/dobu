import UssdMenu from "ussd-menu-builder";
import { Repo } from "../database/database";
import { Menu } from "./menu";
import moment from "moment";
import { Appointment } from "../models";

const cancelMenu = (repo: Repo, menu: UssdMenu): Menu[] => {
  const menus: Menu[] = [];

  menus.push({
    key: "appointments.viewAll",
    options: {
      run: async () => {
        const appointments = await repo.getMyAppointments(
          menu.args.phoneNumber
        );
        if (appointments.length === 0) {
          return menu.end(
            "You do not have any active appoints. Thank you for choosing DoBu"
          );
        }

        let text = "";
        appointments.forEach((app, index) => {
          const startTime = moment(app.startTime).format("DD/MM/YYYY h:mm a")
          text += `\n${index + 1}. ${app.clinic} Clinic (${startTime})`;
        });

        menu.con(`Select appointment for details:${text}`);
      },
      next: {
        "*^\\d{1}$": "appointments.viewOne",
      },
    },
  });

  menus.push({
    key: "appointments.viewOne",
    options: {
      run: async () => {
        console.log("view one", menu.val);

        const appointments = await repo.getMyAppointments(
          menu.args.phoneNumber
        );
        const index = parseInt(menu.val) - 1;
        if (index < 0 || index >= appointments.length) {
          return menu.end(
            "You have picked invalid appointment. Thank you for choosing DoBu"
          );
        }

        const clinic = appointments[index].clinic;
        const date = moment(appointments[index].startTime).format("DD/MM/YYYY");
        const startTime = moment(appointments[index].startTime).format("h:mm a");
        const endTime = moment(appointments[index].endTime).format("h:mm a");

        await menu.session.set("appointment", appointments[index]);
        return menu.con(
          `Your appointment at ${clinic} Clinic is schedule on ${date} from ${startTime} to ${endTime}:\n1. Cancel Appointment`
        );
      },
      next: {
        "*^\\d{1}$": "appointments.cancel",
      },
    },
  });

  menus.push({
    key: "appointments.cancel",
    options: {
      run: async () => {
        if (menu.val === "1") {
          const appointment: Appointment = await menu.session.get(
            "appointment"
          );
          appointment.status = "cancelled";
          await repo.cancelAppointment(
            menu.args.phoneNumber,
            appointment.clinic
          );
          return menu.end(
            `Your appointment has been cancelled. Thank you for choosing DoBu`
          );
        } else {
          return menu.end(
            `You have picked invalid option. Thank you for choosing DoBu`
          );
        }
      },
    },
  });

  return menus;
};

export default cancelMenu;
