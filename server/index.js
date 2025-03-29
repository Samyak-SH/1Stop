require("dotenv").config({ path: "./.env" });
const { app, startServer, express } = require("./utils/util.js");
const bodyParser = require("body-parser");
const { calcMetroFare } = require("./googleFucntions");
const { submitReward } = require("./controllers/rewardController");
const { busController, updateDensity, getBusStatus} = require("./controllers/busController");
const {
  getHistory,
  createBooking,
} = require("./controllers/metroController.js");
const { createUser, getUser } = require("./controllers/userController.js");
const cors = require("cors");
//middleware
app.use(
  cors({
    origin: "*",
    methods: ["GET", "POST"],
  })
);
app.use(bodyParser.json({ limit: "10mb" }));
app.use(
  bodyParser.urlencoded({
    limit: "10mb",
    extended: true,
  })
);
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
// app.use((req, res, next) => {
//     res.setTimeout(30000, () => {
//         console.log("Request timed out");
//         res.status(504).json({ error: 'Request timed out' });
//     });
//     next();
// });

app.get("/test", (req, res) => res.status(200).send("Server running"));
app.get("/metrofare", calcMetroFare);
app.get("/user", getUser);
app.get("/booking-history", getHistory);
app.get("/busstatus",getBusStatus);

app.post("/poll", busController);
app.post("/submit-reward", submitReward);
app.post("/create-booking", createBooking);
app.post("/user", createUser);
app.post("/updatedensity", updateDensity);


//start server
startServer();
