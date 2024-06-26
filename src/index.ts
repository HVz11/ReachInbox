import express from "express";
import { google } from "googleapis";
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = 5000;

const oAuth2Client = new google.auth.OAuth2(
  process.env.CLIENT_ID,
  process.env.CLIENT_SECRET,
  process.env.REDIRECT_URI
);

app.get("/auth/google", (req, res) => {
  const authUrl = oAuth2Client.generateAuthUrl({
    access_type: "offline",
    scope: [
      "https://www.googleapis.com/auth/gmail.readonly",
      "https://www.googleapis.com/auth/gmail.send",
    ],
  });
  res.redirect(authUrl);
});

app.get("/auth/google/callback", async (req, res) => {
  const { code } = req.query;
  const { tokens } = await oAuth2Client.getToken(code as string);
  oAuth2Client.setCredentials(tokens);
  res.send("Authentication successful");
});

app.get("/", (req, res) => {
  res.send("Hello World from ReachInbox");
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
