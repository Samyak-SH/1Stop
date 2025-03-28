require("dotenv").config({ path: './.env' });
const {app, startServer, cors, express} = require("./utils/util.js");

const bodyParser = require('body-parser');

const { calcMetroFare } = require("./googleFucntions");
const { submitReward } = require("./controllers/rewardController");
const { busController } = require("./controllers/busController");

//middleware
app.use(cors({
    origin : '*',
    methods: ['GET', 'POST'],
}));
app.use(bodyParser.json({ limit: '10mb' }));
app.use(bodyParser.urlencoded({ 
    limit: '10mb', 
    extended: true 
}));
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

app.post("/poll", busController)
app.post("/submit-reward", submitReward);


//start server
startServer();

