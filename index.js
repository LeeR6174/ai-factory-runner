{
  "name": "nap-tracker",
  "version": "1.0.0",
  "description": "A simple Node.js application to track naps and set timers.",
  "main": "app.js",
  "scripts": {
    "start": "node app.js"
  },
  "keywords": [
    "nap",
    "tracker",
    "timer",
    "node",
    "express"
  ],
  "author": "Your Name",
  "license": "MIT",
  "dependencies": {
    "express": "^4.19.2"
  }
}
const express = require('express');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;
const NAPS_FILE = path.join(__dirname, 'naps.json'); // Path to store nap records

// Middleware to parse JSON request bodies
app.use(express.json());

// --- Helper Functions for File I/O ---

/**
 * Loads nap records from the naps.json file.
 * If the file doesn't exist or is empty/invalid, returns an empty array.
 * @returns {Array<Object>} An array of nap records.
 */
function loadNaps() {
    try {
        if (fs.existsSync(NAPS_FILE)) {
            const data = fs.readFileSync(NAPS_FILE, 'utf8');
            // Handle case where file might be empty or contain invalid JSON
            if (data.trim() === '') {
                return [];
            }
            return JSON.parse(data);
        }
    } catch (error) {
        console.error('Error loading naps data:', error.message);
    }
    return []; // Return empty array if file not found or error
}

/**
 * Saves the current nap records to the naps.json file.
 * @param {Array<Object>} naps - The array of nap records to save.
 */
function saveNaps(naps) {
    try {
        fs.writeFileSync(NAPS_FILE, JSON.stringify(naps, null, 2), 'utf8');
    } catch (error) {
        console.error('Error saving naps data:', error.message);
    }
}

// --- API Endpoints ---

/**
 * GET /naps
 * Returns all recorded naps.
 */
app.get('/naps', (req, res) => {
    const naps = loadNaps();
    res.json(naps);
});

/**
 * POST /naps/start
 * Starts a nap timer for a specified duration and records the nap when complete.
 * Request body: { "duration": 10 | 20 | 30 } (minutes)
 */
app.post('/naps/start', (req, res) => {
    const { duration } = req.body; // duration in minutes

    const allowedDurations = [10, 20, 30];
    if (typeof duration !== 'number' || !allowedDurations.includes(duration)) {
        return res.status(400).json({ error: 'Invalid or missing duration. Allowed: 10, 20, 30 minutes.' });
    }

    const durationMs = duration * 60 * 1000; // Convert minutes to milliseconds
    const startTime = new Date(); // Record when the timer started

    console.log(`[${new Date().toISOString()}] Nap timer started for ${duration} minutes.`);
    res.status(202).json({
        message: `Nap timer started for ${duration} minutes.`,
        startTime: startTime.toISOString(),
        expectedEndTime: new Date(startTime.getTime() + durationMs).toISOString()
    });

    // Start the timer
    setTimeout(() => {
        const endTime = new Date();
        const napRecord = {
            date: startTime.toISOString(), // Use start time as the record date
            durationMinutes: duration,
            endTime: endTime.toISOString(),
        };

        const naps = loadNaps();
        naps.push(napRecord);
        saveNaps(naps);

        console.log(`[${endTime.toISOString()}] Nap completed! Duration: ${duration} minutes.`);
        console.log('Nap recorded:', napRecord);

    }, durationMs);
});

// --- Server Start ---
app.listen(PORT, () => {
    console.log(`Nap Tracker API running on http://localhost:${PORT}`);
    console.log(`Available endpoints:`);
    console.log(`  GET /naps - Get all recorded naps`);
    console.log(`  POST /naps/start - Start a nap timer (body: { "duration": 10|20|30 })`);
    console.log(`\nTo get started:`);
    console.log(`1. Save the first JSON block above into a file named 'package.json'.`);
    console.log(`2. Save the JavaScript block above into a file named 'app.js'.`);
    console.log(`3. Run 'npm install' in your terminal.`);
    console.log(`4. Run 'npm start' to begin.`);
    console.log(`\nExample usage with curl:`);
    console.log(`  To start a 20-minute nap:`);
    console.log(`    curl -X POST -H "Content-Type: application/json" -d '{"duration": 20}' http://localhost:${PORT}/naps/start`);
    console.log(`  To view recorded naps:`);
    console.log(`    curl http://localhost:${PORT}/naps`);
});