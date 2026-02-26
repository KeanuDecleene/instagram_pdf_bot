/**
 * express server to handle a webhook for receiving email addresses and sending a workout pdf using SendGrid
 */

require("dotenv").config();
const express = require("express");
const fs = require("fs");
const path = require("path");
const sgMail = require("@sendgrid/mail");
const validateEmail = require("./validateEmails");
const { send } = require("process");
const { text } = require("stream/consumers");

const app = express();
app.use(express.json());

sgMail.setApiKey(process.env.SENDGRID_API_KEY);

app.get("webhook", (req, res) => {
  const mode = req.query["hub.mode"];
  const token = req.query["hub.verify_token"];
  const challenge = req.query["hub.challenge"];

  if (mode === "subscribe" && token === process.env.VERIFY_TOKEN) {
    console.log("Webhook verified");
    res.status(200).send(challenge);
  } else {
    console.error("Webhook verification failed");
    res.sendStatus(403);
  }
});

// listends for webhook post request and sends an email
app.post("/webhook", async (req, res) => {
  try {
    const entry = req.body.entry?.[0];
    const msg = entry?.messaging?.[0];
    const messageText = messaging?.message?.text.trim();

    if (messageText && validateEmail(messageText)) {
      await sendEmail(msgText);
      console.log(`Email sent to ${msgText}`);
    }
  } catch (error) {
    console.error("Error processing webhook:", error);
  }
});

/**
 * function to send an email with a workout plan pdf attached using SendGrid
 * @param {email to send to} email
 */
async function sendEmail(email) {
  const filePath = path.join(__dirname, "pdfs", "My_Full_Workout_Plan.pdf");
  const pdf = fs.readFileSync(filePath).toString("base64");

  const msg = {
    to: email,
    from: process.env.SENDER_EMAIL,
    subject: "Keanus PPL Workout Plan",
    text: "Here is my split and some of the exercises I do everyday, hope it helps If you have any questions about the split feel free to reply to this email.",
    attachments: [
      {
        content: pdf,
        filename: "My_Full_Workout_Plan.pdf",
        type: "application/pdf",
        disposition: "attachment",
      },
    ],
  };
  await sgMail.send(msg);
}

// app.get("/test-email", async (req, res) => {
//   try {
//     const msg = {
//       to: "keanudecleene124@gmail.com",
//       from: process.env.FROM_EMAIL,
//       subject: "SendGrid Test ✅",
//       text: "If you received this, SendGrid is working.",
//     };

//     await sgMail.send(msg);
//     res.send("Test email sent successfully!");
//   } catch (error) {
//     console.error(error);
//     res.status(500).send("Email failed");
//   }
// });

app.listen(process.env.PORT || 3000, () => {
  console.log("Server is running");
});
