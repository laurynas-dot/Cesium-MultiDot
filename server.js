// server.js
// where your node app starts

// init project
require("dotenv").config();
const express = require('express');
const path = require("path");
const app = express();
http = require('http');
const ws = require('ws');

const server = http.createServer(app);
const wss = new ws.Server({ server });

app.use(express.static('public'));

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public/index.html"));
});

app.get("/cesium-token.js", (req, res) => {
  res.setHeader("Content-Type", "application/javascript");
  res.send(`window.CESIUM_TOKEN = "${process.env.CESIUM_TOKEN}";`);
});

const listener = server.listen(process.env.PORT, function() {
  console.log('Your app is listening on port ' + listener.address().port);
});

// Store the state of the dots
const dots = new Map();

// Handle WebSocket connections
wss.on('connection', (ws) => {
  let clientId = null;

  // Assign a unique ID to the client
  clientId = crypto.randomUUID();
  dots.set(clientId, null);
  ws.clientId = clientId;

  // Notify all clients of the updated dots
  const broadcastDots = () => {
    const dotsData = Array.from(dots.entries())
      .filter(([dotId, position]) => position !== null)
      .map(([id, position]) => ({ id, position }));
    wss.clients.forEach((client) => {
      if (client.readyState === ws.OPEN) {
        const otherDots = dotsData.filter(dot => dot.id !== client.clientId);
        client.send(JSON.stringify({ type: 'update', dots: otherDots }));
      }
    });
  };

  // Send initial state to the new client
  broadcastDots();

  // Handle messages from the client
  ws.on('message', (message) => {
    try {
      const data = JSON.parse(message);
      if (data.type === 'dotPosition' && data.position) {
        dots.set(clientId, data.position);
        console.log(`Client ${clientId} position:`, data.position);
        broadcastDots();
      }
    } catch (err) {
      console.error('Error parsing message:', err);
    }
  });

  // Handle client disconnect
  ws.on('close', () => {
    dots.delete(clientId);
    broadcastDots();
  });
});