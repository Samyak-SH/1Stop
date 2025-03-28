const express = require("express");
const mongoose = require("mongoose");

const PORT = process.env.PORT || 8000;
const LAPTOP_IP = process.env.LAPTOP_IP_ADRESS;

const MONGODB_URL = process.env.MONGODB_URL;

const app = express();

async function startServer() {
  try {
    console.log(MONGODB_URL);
    await mongoose.connect(`${MONGODB_URL}`).then(() => {
      console.log("database started");
    });

    //starting server
    app.listen(PORT, `0.0.0.0`, () => {
      console.log(
        `Server started on http://${LAPTOP_IP}:${PORT}\nTest on http://${LAPTOP_IP}:${PORT}/test`
      );
    });
  } catch (err) {
    console.error("Error while starting server : ", err);
  }
}

module.exports = { app, mongoose, startServer, express };
