// server.js
// where your node app starts

// init project
require("dotenv").config();
const express = require('express');
const path = require("path");
const app = express();

app.use(express.static('public'));

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public/index.html"));
});

app.get("/cesium-token.js", (req, res) => {
  res.setHeader("Content-Type", "application/javascript");
  res.send(`window.CESIUM_TOKEN = "${process.env.CESIUM_TOKEN}";`);
});

const listener = app.listen(process.env.PORT, function() {
  console.log('Your app is listening on port ' + listener.address().port);
});
