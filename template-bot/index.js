const { makeWASocket, useMultiFileAuthState } = require("@whiskeysockets/baileys");
const path = require("path");

async function startBot() {
  const SESSION_PATH = process.env.SESSION_PATH;

  if (!SESSION_PATH) {
    console.error("❌ SESSION_PATH not provided");
    process.exit(1);
  }

  const { state, saveCreds } = await useMultiFileAuthState(SESSION_PATH);

  const sock = makeWASocket({ auth: state });

  sock.ev.on("creds.update", saveCreds);

  sock.ev.on("connection.update", (update) => {
    const { connection } = update;
    if (connection === "open") {
      console.log("✅ Bot connected successfully");
    }
    if (connection === "close") {
      console.log("❌ Bot disconnected");
    }
  });

  sock.ev.on("messages.upsert", async ({ messages }) => {
    const msg = messages[0];
    if (!msg.message) return;

    const text = msg.message.conversation || "";
    if (text === "ping") {
      await sock.sendMessage(msg.key.remoteJid, {
        text: "pong 🟢 bot is alive"
      });
    }
  });
}

startBot();
