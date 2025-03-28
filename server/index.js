require("dotenv").config({ path: './.env' });

const { calDistance } = require("./googleFucntions");
const { submitReward } = require("./controllers/rewardController");

const express = require("express");
const cors = require('cors');
const PORT = process.env.PORT || 8000;

const app = express();

app.use(cors());
app.use(express.json({ limit: '50mb' }));

app.use((req, res, next) => {next();});

app.use((req, res, next) => {
    res.setTimeout(30000, () => {
        console.log("Request timed out");
        res.status(504).json({ error: 'Request timed out' });
    });
    next();
});

app.get("/test", (req, res) => res.status(200).send("Server running"));
app.get("/distance", calDistance);
app.post("/submit-reward", submitReward);

app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server started on http://192.168.1.8:${PORT}\nTest on http://192.168.1.8:${PORT}/test`);
});