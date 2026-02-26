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

app.get("/webhook", (req, res) => {
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

// listens for webhook post request and sends an email if valid
app.post("/webhook", async (req, res) => {
  try {
    const entry = req.body.entry?.[0];
    const msg = entry?.messaging?.[0];
    const messageText = msg?.message?.text?.trim();

    if (messageText && validateEmail(messageText)) {
      await sendEmail(messageText);
      console.log(`Email sent to ${messageText}`);
    }
  } catch (error) {
    console.error("Error processing webhook:", error);
    res.sendStatus(500);
  }
});

app.get("/privacy", (req, res) => {
  res.send(`
    <h1>Privacy Policy</h1>
    <p>Last updated: ${new Date().toDateString()}</p>

    <p>This application ("pdf email-IG") is operated by Keanu De Cleene.</p>

    <h2>Information We Collect</h2>
    <p>We may collect Instagram usernames, message content, and email addresses provided voluntarily by users via Instagram Direct Messages.</p>

    <h2>How We Use Information</h2>
    <p>Collected information is used solely to:
      <ul>
        <li>Respond to Instagram Direct messages</li>
        <li>Send requested PDF document</li>
        <li>Provide automated responses</li>
      </ul>
    </p>

    <h2>Data Storage</h2>
    <p>We do not sell, rent, or share user data. Information is not stored permanently unless required for email delivery.</p>

    <h2>Data Deletion</h2>
    <p>Users may request deletion of their data by emailing: keanudecleene124@gmail.com</p>

    <h2>Contact</h2>
    <p>Email: keanudecleene124@gmail.com</p>
  `);
});

app.get("/data-deletion", (req, res) => {
  res.send(`
    <h1>Data Deletion Instructions</h1>
    <p>If you would like your data removed from our systems, please email:</p>
    <p><strong>keanudecleene124@gmail.com</strong></p>
    <p>Include your Instagram username and request for data deletion.</p>
  `);
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
//       subject: "SendGrid Test ",
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
