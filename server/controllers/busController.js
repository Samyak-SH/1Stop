const axios = require("axios");
const GOOGLE_API_KEY = process.env.GOOGLE_API_KEY;
const BASE_URL = `https://maps.googleapis.com/maps/api/distancematrix/json`;
const { redisClient } = require("../utils/util.js");

const EXPIRE_TIME = 60000; // 60 seconds
const REDIS_EXPIRY = 15; // 15 seconds
let changeStop = true;

async function busController(req, res) {
    console.log("hit");
    const THRESHOLD = 300; // in meters
    const { origin_lat, origin_lon, dest_lat, dest_lon, busNo } = req.body;

    if (!busNo) {
        return res.status(400).json({ error: "Bus number is required" });
    }

    const busDetails = {
        nextDestination: [dest_lat, dest_lon],
        coords: [origin_lat, origin_lon],
        busNo,
        crowdDensity: 0,
    };

    console.log(busDetails);

    try {
        const response = await axios.get(BASE_URL, {
            params: {
                origins: `${origin_lat},${origin_lon}`,
                destinations: `${dest_lat},${dest_lon}`,
                mode: "driving",
                key: GOOGLE_API_KEY
            }
        });

        const data = response.data;
        if (data.status === "OK") {
            const distance = data.rows[0].elements[0].distance.value; // in meters
            const duration = data.rows[0].elements[0].duration.value; // in seconds
            console.log(distance, " ", duration);

            // Store bus details in Redis with a 15-second expiry
            await redisClient.setEx(`bus:${busNo}`, REDIS_EXPIRY, JSON.stringify(busDetails));

            if (distance <= THRESHOLD) {
                console.log("Near bus stop");
                if (changeStop) {
                    console.log("Asking bus to change stops");
                    changeStop = false;
                    setTimeout(() => {
                        console.log("Change stop expired, setting changeStop to true");
                        changeStop = true;
                    }, EXPIRE_TIME);
                    return res.status(200).json({ nearBusStop: 1, changeStop: 1 });
                } else {
                    console.log("Not asking bus to change stops, already asked once");
                    return res.status(200).json({ nearBusStop: 1, changeStop: 0 });
                }
            } else {
                console.log("Not near bus stop");
                return res.status(200).json({ nearBusStop: 0 });
            }
        }
    } catch (err) {
        console.error("Error while polling:", err);
        return res.status(500).json({ error: "Internal server error" });
    }
}

async function updateDensity(req, res) {
    const { busNo, crowdDensity } = req.body;

    if (!busNo || crowdDensity === undefined) {
        return res.status(400).json({ error: "Bus number and crowd density are required" });
    }

    try {
        const busData = await redisClient.get(`bus:${busNo}`);

        if (!busData) {
            return res.status(404).json({ error: "Bus not found in Redis" });
        }

        const busDetails = JSON.parse(busData);
        busDetails.crowdDensity = crowdDensity;

        // Update Redis with new crowd density and reset expiry
        await redisClient.setEx(`bus:${busNo}`, REDIS_EXPIRY, JSON.stringify(busDetails));

        console.log(`Updated crowd density for bus ${busNo}: ${crowdDensity}`);
        return res.json({ message: "Density updated", busDetails });
    } catch (err) {
        console.error("Error updating density:", err);
        return res.status(500).json({ error: "Internal server error" });
    }
}

async function getBusStatus(req, res) {
    const { busNo } = req.query;

    if (!busNo) {
        return res.status(400).json({ error: "Bus number is required" });
    }

    try {
        const busData = await redisClient.get(`bus:${busNo}`);

        if (!busData) {
            return res.status(404).json({ error: "Bus not found or expired in Redis" });
        }

        const busDetails = JSON.parse(busData);
        return res.status(200).json(busDetails);
    } catch (err) {
        console.error("Error fetching bus status:", err);
        return res.status(500).json({ error: "Internal server error" });
    }
}

module.exports = { busController, updateDensity, getBusStatus };
