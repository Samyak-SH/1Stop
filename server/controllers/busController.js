const axios = require("axios")
const GOOGLE_API_KEY = process.env.GOOGLE_API_KEY;
const BASE_URL = `https://maps.googleapis.com/maps/api/distancematrix/json`;

const busDetails = {
    nextDestination : [],
    coords : [],
    busNo : "298M",
    crowdDensity : 0,
}

const EXPIRE_TIME = 60000; //60 seconds
let changeStop = true;

async function busController(req, res) {
    const THRESHOLD = 500; //in meters
    const { origin_lat, origin_lon, dest_lat, dest_lon} = req.body;
    busDetails.nextDestination = [dest_lat,dest_lon];
    busDetails.coords = [origin_lat,origin_lon];
    console.log(busDetails);

    try {
        const response = await axios.get(BASE_URL, {
            params: {
                origins: `${origin_lat},${origin_lon}`,
                destinations: `${dest_lat},${dest_lon}`,
                mode: "transit",
                transit_mode: 'bus',
                key: GOOGLE_API_KEY
            }
        })

        const data = response.data;
        if (data.status === "OK") {
            const distance = data.rows[0].elements[0].distance.value //in meters
            const duration = data.rows[0].elements[0].duration.value //in seconds
            console.log(distance, " ", duration);  

            if (distance <= THRESHOLD) {
                console.log("Near bus stop");
                if(changeStop){
                    console.log("asking bus to change stops");
                    changeStop = false;
                    setTimeout(() => {
                        console.log("change stop expired, setting changeStop to true");
                        changeStop = true;
                    }, EXPIRE_TIME);
                    res.status(200).json({nearBusStop: 1, changeStop: 1});
                }
                else {
                    console.log("not asking bus to cahnge stops, already asked once");
                    res.status(200).json({nearBusStop: 1, changeStop: 0});
                }                

            }
            else {
                console.log("not near bustop");
                res.status(200).json({nearBusStop: 1});
            }
        }

    }
    catch (err) {
        console.error("Error while polling : ", err);
        res.status(500).json({ error: "Internal server error"});
    }
}

module.exports = { busController, busDetails };