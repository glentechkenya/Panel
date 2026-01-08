import { handleIncomingMessage } from "../bot-logic";
import Twilio from "twilio";

export const config = {
  api: {
    bodyParser: true
  }
};

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).send("Method Not Allowed");
  }

  const {
    TWILIO_ACCOUNT_SID,
    TWILIO_AUTH_TOKEN,
    TWILIO_WHATSAPP_NUMBER,
    BOT_ENABLED
  } = process.env;

  const botEnabled = (BOT_ENABLED || "true").toLowerCase() === "true";
  if (!botEnabled) {
    return res.status(200).send("Bot disabled");
  }

  const fromNumber = req.body.From || "";
  const body = req.body.Body || "";

  const responseText = handleIncomingMessage(body);

  if (!TWILIO_ACCOUNT_SID || !TWILIO_AUTH_TOKEN || !TWILIO_WHATSAPP_NUMBER) {
    return res.status(200).send("Missing Twilio env vars");
  }

  try {
    const client = Twilio(TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN);
    await client.messages.create({
      body: responseText,
      from: TWILIO_WHATSAPP_NUMBER, // e.g., 'whatsapp:+14155238886'
      to: fromNumber
    });
    return res.status(200).send("OK");
  } catch (e) {
    return res.status(200).send(`Error: ${e.message}`);
  }
}
