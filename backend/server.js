const express = require('express');
const fs = require('fs-extra');
const path = require('path');
const { Client, LocalAuth } = require('whatsapp-web.js');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

// Serve frontend
app.use(express.static(path.join(__dirname, '../frontend')));
app.get('/', (req, res) => res.sendFile(path.join(__dirname, '../frontend/index.html')));

const PORT = process.env.PORT || 3000;

const botsFile = path.join(__dirname, '../data/bots.json');
const botsFolder = path.join(__dirname, 'bots');

// Make sure data folder exists
fs.ensureDirSync(path.join(__dirname, '../data'));
fs.ensureDirSync(botsFolder);

// Load saved bots info
let bots = [];
if (fs.existsSync(botsFile)) {
    bots = fs.readJsonSync(botsFile);
}

// Save bots info
const saveBots = () => fs.writeJsonSync(botsFile, bots, { spaces: 2 });

// Deploy a bot (uses existing pre-scanned session)
app.post('/deploy', (req, res) => {
    const { name, number } = req.body;
    if (!name || !number) return res.status(400).json({ error: 'Name & number required' });

    // Check if session folder exists
    const sessionPath = path.join(botsFolder, name);
    if (!fs.existsSync(sessionPath)) {
        return res.status(400).json({ error: 'Bot session folder does not exist. Pre-scan required.' });
    }

    // Prevent duplicate running
    if (bots.find(b => b.name === name && b.status === 'running')) {
        return res.status(400).json({ error: 'Bot already running' });
    }

    const client = new Client({
        authStrategy: new LocalAuth({ clientId: name, dataPath: sessionPath }),
        puppeteer: { headless: true }
    });

    client.on('ready', () => {
        console.log(`${name} is ready!`);
        const index = bots.findIndex(b => b.name === name);
        if (index !== -1) bots[index].status = 'running';
        saveBots();
    });

    client.on('message', msg => {
        console.log(`${name} received: ${msg.body}`);
    });

    client.initialize();

    // Save bot info if not exists
    if (!bots.find(b => b.name === name)) {
        bots.push({ name, number, status: 'initializing' });
        saveBots();
    }

    res.json({ message: `Bot ${name} is deploying...` });
});

// List bots
app.get('/bots', (req, res) => res.json(bots));

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
