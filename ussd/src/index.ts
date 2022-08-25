import express from "express";
import bodyParser from "body-parser";
import MyMenu from "./utils/menu";
import { Repo, Repository } from "./database/database";
import { UssdGatewayArgs } from "ussd-menu-builder";

const app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.get("/ussd", (req, res) => {
  res.send("Hello USSD");
});

const repo: Repo = new Repository();

const myMenu = new MyMenu(repo);

app.post("/ussd", (req, res) => {
  res.setHeader("Content-Type", "text/plain");
  const args: UssdGatewayArgs = req.body;
  myMenu.menu
    .run(args)
    .then((response) => {
      res.send(response);
    })
    .catch((err) => {
      res.status(500).send(err.message);
    });
});

const PORT = 5002;
app.listen(PORT, () => {
  console.log(`Server started on port ${PORT}`);
});
