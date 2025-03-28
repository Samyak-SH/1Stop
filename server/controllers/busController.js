async function busController(req,res) {
    const {latitude, longitude, busId, busNo} = req.body;
    console.log(req.body);
    console.log("latitude : ", latitude);
    console.log("longitude : ", longitude);
    console.log("busId : ", busId);
    console.log("busNo : ", busNo);
}

module.exports = {busController};