import axios from "axios";
import FormData from "form-data";

const sendSMS = async (
  phone: string,
  message: string,
  linkID = ""
): Promise<void> => {
  try {
    const apiKey = process.env.SMS_API_KEY;
    const userName = process.env.SMS_API_USERNAME;
    const from = process.env.SHORT_CODE;

    const data = new FormData();
    data.append("username", userName);
    data.append("to", phone);
    data.append("message", message);
    data.append("from", from);

    const options = {
      method: "POST",
      headers: {
        accept: "application/json",
        "content-type": "application/x-www-form-urlencoded",
        apikey: apiKey,
      },
      data,
      url: process.env.SMS_API_URL,
    };

    await axios(options);
  } catch (e) {
    console.log("error sending message", e.message);
  }
};

export default sendSMS;
