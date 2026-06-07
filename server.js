require('dotenv').config();
const express = require('express');
const path = require('path');
const calculateApi = require('./src/api/calculate');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json()); // For parsing application/json
app.use(express.static(path.join(__dirname, 'public'))); // Serve static files from 'public' directory

// API Routes
app.post('/api/calculate', calculateApi.handleCalculation);

// All other GET requests will return the main index.html file
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Start the server
app.listen(PORT, () => {
  console.log(`EvalXpert Web UI server running on http://localhost:${PORT}`);
});
