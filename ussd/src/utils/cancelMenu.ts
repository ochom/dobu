import UssdMenu from "ussd-menu-builder";
import { Repo } from "../database/database";
import { Menu } from "./menu";
import moment from "moment";
import { Appointment } from "../models";
import sendSMS from "../service/sms";

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
          const startTime = moment(app.startTime).format("DD/MM/YYYY h:mm a");
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
        const startTime = moment(appointments[index].startTime).format(
          "h:mm a"
        );
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
          return menu.con(
            `What is your reason for cancelling this appointment?`
          );
        } else {
          return menu.end(`Thank you for choosing DoBu`);
        }
      },
      next: {
        "*\\w+": "appointments.cancelSubmit",
      },
    },
  });

  menus.push({
    key: "appointments.cancelSubmit",
    options: {
      run: async () => {
        const appointment: Appointment = await menu.session.get("appointment");
        await repo.cancelAppointment(
          menu.args.phoneNumber,
          appointment.clinic,
          menu.val
        );

        const date = moment(appointment.startTime).format("DD/MM/YYYY");
        const startTime = moment(appointment.startTime).format("h:mm a");
        const endTime = moment(appointment.endTime).format("h:mm a");

        const text = `Your appointment that was scheduled on ${date} from ${startTime} to ${endTime} has been cancelled successfully. Thank you for choosing DoBu`;
        sendSMS(menu.args.phoneNumber, text);

        return menu.end(
          `Your appointment has been cancelled. Thank you for choosing DoBu`
        );
      },
    },
  });

  return menus;
};

export default cancelMenu;
