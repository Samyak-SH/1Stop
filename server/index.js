require("dotenv").config({ path: '.env' });

const { calcMetroFare } = require("./googleFucntions");
const { submitReward } = require("./controllers/rewardController");
const { busController } = require("./controllers/busController");

const express = require("express");
const cors = require('cors');

const PORT = process.env.PORT || 8000;
const LAPTOP_IP = process.env.LAPTOP_IP_ADRESS;

const app = express();

//middleware
app.use(cors());
app.use(express.urlencoded({ extended: true }));
app.use(express.json({ limit: '50mb' }));

app.use((req, res, next) => {
    res.setTimeout(30000, () => {
        console.log("Request timed out");
        res.status(504).json({ error: 'Request timed out' });
    });
    next();
});

app.get("/test", (req, res) => res.status(200).send("Server running"));
app.get("/metrofare", calcMetroFare);

app.post("/poll", busController)
app.post("/submit-reward", submitReward);

app.listen(PORT, `0.0.0.0`, () => {
    console.log(`Server started on http://${LAPTOP_IP}:${PORT}\nTest on http://${LAPTOP_IP}:${PORT}/test`);
});