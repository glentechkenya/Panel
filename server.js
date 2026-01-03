const express = require("express");
const cors = require("cors");
const fs = require("fs-extra");
const path = require("path");
const { exec } = require("child_process");

const app = express();
app.use(cors());
app.use(express.json({ limit: "50mb" }));

/**
 * DEPLOY BOT
 * Expects:
 *  - username
 *  - phone (optional, for display)
 *  - sessionFiles (object: { filename: JSON content })
 */
app.post("/deploy", async (req, res) => {
  try {
    const { username, phone, sessionFiles } = req.body;
    if (!username || !sessionFiles) {
      return res.status(400).json({ error: "username and sessionFiles required" });
    }

    const userDir = path.join(__dirname, "users", username);
    const sessionDir = path.join(userDir, "session");
    const botDir = path.join(userDir, "bot");

    // create folders
    await fs.ensureDir(sessionDir);
    await fs.ensureDir(botDir);

    // copy bot template
    await fs.copy(path.join(__dirname, "template-bot", "index.js"), path.join(botDir, "index.js"));

    // write session files
    for (const [filename, content] of Object.entries(sessionFiles)) {
      await fs.writeFile(path.join(sessionDir, filename), JSON.stringify(content, null, 2));
    }

    // start bot with PM2
    const cmd = `SESSION_PATH=${sessionDir} pm2 start ${botDir}/index.js --name ${username}-bot`;
    exec(cmd, (err) => {
      if (err) return res.status(500).json({ error: err.message });

      res.json({
        success: true,
        message: "Bot deployed successfully",
        user: username,
        phone: phone || "Not provided",
      });
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * List deployed bots
 */
app.get("/bots", (req, res) => {
  exec(`pm2 list --json`, (err, stdout) => {
    if (err) return res.status(500).json({ error: err.message });
    const bots = JSON.parse(stdout);
    res.json(bots);
  });
});

/**
 * Stop a bot
 */
app.post("/stop", (req, res) => {
  const { name } = req.body;
  if (!name) return res.status(400).json({ error: "name required" });

  exec(`pm2 stop ${name}`, (err) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ stopped: true, name });
  });
});

/**
 * Restart a bot
 */
app.post("/restart", (req, res) => {
  const { name } = req.body;
  if (!name) return res.status(400).json({ error: "name required" });

  exec(`pm2 restart ${name}`, (err) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ restarted: true, name });
  });
});

app.listen(3000, () => {
  console.log("🚀 WhatsApp Deployment Panel running on port 3000");
});
