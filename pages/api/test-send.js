import Twilio from "twilio";
import { handleIncomingMessage } from "./bot-logic";

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
    TWILIO_WHATSAPP_NUMBER
  } = process.env;

  const { to, message } = req.body || {};
  if (!to || !message) {
    return res.status(400).json({ error: "Missing 'to' or 'message' in body" });
  }

  const responseText = handleIncomingMessage(message);

  try {
    const client = Twilio(TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN);
    await client.messages.create({
      body: responseText,
      from: TWILIO_WHATSAPP_NUMBER,
      to
    });
    return res.status(200).json({ status: "sent", reply: responseText });
  } catch (e) {
    return res.status(500).json({ error: e.message });
  }
}
