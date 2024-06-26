import express from "express";
import { google } from "googleapis";
import { ConfidentialClientApplication } from "@azure/msal-node";
import dotenv from "dotenv";

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

const msalConfig = {
  auth: {
    clientId: process.env.AZURE_CLIENT_ID || "",
    authority: process.env.AZURE_AUTHORITY,
    clientSecret: process.env.AZURE_CLIENT_SECRET,
  },
};

const cca = new ConfidentialClientApplication(msalConfig);

app.get("/auth/outlook", async (req, res) => {
  const authUrl = await cca.getAuthCodeUrl({
    scopes: ["Mail.ReadWrite", "Mail.Send"],
    redirectUri: process.env.OUTLOOK_REDIRECT_URI ?? "",
  });
  res.redirect(authUrl);
});

app.get("/auth/outlook/callback", async (req, res) => {
  const { code } = req.query;
  const tokenResponse = await cca.acquireTokenByCode({
    code: code as string,
    scopes: ["Mail.ReadWrite", "Mail.Send"],
    redirectUri: process.env.OUTLOOK_REDIRECT_URI ?? "",
  });
  res.send("Outlook OAuth successful!");
});

app.get("/", (req, res) => {
  res.send("Hello World from ReachInbox");
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
