import UssdMenu, { UssdStateOptions } from "ussd-menu-builder";
import { Repo } from "../database/database";
import bookingMenu from "./bookingMenu";

export interface Menu {
  key: string;
  options: UssdStateOptions;
}

export default class MyMenu {
  menu: UssdMenu;
  sessions: any;
  repo: Repo;

  constructor(repo: Repo) {
    this.repo = repo;
    this.menu = new UssdMenu();
    this.sessions = {};
    this.initSession();
    this.initState();
    this.loadAllMenus();
  }

  initSession() {
    this.menu.sessionConfig({
      start: (sessionId, callback) => {
        // initialize current session if it doesn't exist
        // this is called by menu.run()
        if (!(sessionId in this.sessions)) this.sessions[sessionId] = {};
        callback();
      },
      end: (sessionId, callback) => {
        // clear current session
        // this is called by menu.end()
        delete this.sessions[sessionId];
        callback();
      },
      set: (sessionId, key, value, callback) => {
        // store key-value pair in current session
        this.sessions[sessionId][key] = value;
        callback();
      },
      get: (sessionId, key, callback) => {
        // retrieve value by key in current session
        const value = this.sessions[sessionId][key];
        callback(null, value);
      },
    });
  }

  initState() {
    this.menu.startState({
      run: async () => {
        this.menu.con(
          "Welcome to DoBu. Book and Manage Doctor appointments at any time:\n1. Book Appointment\n2. View My Appointments"
        );
      },
      next: {
        1: "booking.selectClinic",
        3: "appointments.ViewAll",
      },
      defaultNext: "endUSSD",
    });
  }

  loadAllMenus() {
    let menus: Menu[] = [];
    menus = [...menus, ...bookingMenu(this.repo, this.menu)];

    menus.forEach((m) => {
      this.menu.state(m.key, m.options);
    });

    this.menu.state("endUSSD", {
      run: () => {
        this.menu.end("Thank you for using DoBu");
      },
    });

    this.menu.on("error", () => {
      this.menu.end(
        "Sorry, we encountered an error. Don't worry this is on us and we will fix it"
      );
    });
  }
}
