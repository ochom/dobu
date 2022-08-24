import express from "express";
import bodyParser from "body-parser";
import MyMenu from "./utils/menu";

const app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

const myMenu = new MyMenu();

app.get("/ussd", (req, res) => {
  res.send("Hello USSD");
});

app.post("/ussd", (req, res) => {
  const { sessionId, serviceCode, phoneNumber, text } = req.body;
});

const PORT = 5000;
app.listen(PORT, () => {
  console.log(`Server started on port ${PORT}`);
});
