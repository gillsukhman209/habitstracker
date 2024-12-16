import config from "@/config";
import FormData from "form-data";
import Mailgun from "mailgun.js";

// Initialize Mailgun with form-data
const mailgun = new Mailgun(FormData);

// Create a Mailgun client

const mg = mailgun.client({
  username: "api",
  key:
    process.env.MAILGUN_API_KEY ||
    "b818e5f759c9a5ca26c6637b7cb08840-0920befd-0b3cb324",
});

console.log("MAILGUN_API_KEY", process.env.MAILGUN_API_KEY);

export const sendEmail = async ({ to }) => {
  await mg.messages
    .create("mg.21habits.co", {
      from: config.mailgun.fromAdmin,
      to: to,
      subject: "Don't forget to work on your habits today!",
      text: "This is a friendly reminder to work on your habits today, or else you will be charged",
    })
    .then((msg) => console.log(msg)) // logs response data
    .catch((err) => console.log(err)); // logs any errorch(err => console.log(err)); // logs any error
};
