const BookingHistoryModel = require("../models/bookHistory");

async function createBooking(req, res) {
  const uid = req.headers["authorization"]?.split(" ")[1];
  try {
    const { toStation, fromStation, fare, passengers } = req.body;

    const newBooking = new BookingHistoryModel({
      uid,
      to: toStation,
      from: fromStation,
      Totalfare: fare * passengers,
      no_of_people: passengers,
    });

    const savedBooking = await newBooking.save();
    res
      .status(201)
      .json({ message: "Booking created successfully", savedBooking });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error creating booking", error: error.message });
  }
}

async function getHistory(req, res) {
  const uid = req.headers["authorization"]?.split(" ")[1];
  console.log(uid, "uid in gethistory");
  try {
    const bookingHistory = await BookingHistoryModel.find({ uid });
    res.status(200).json({ bookingHistory });
  } catch (error) {
    res.status(500).json({
      message: "Error fetching booking history",
      error: error.message,
    });
  }
}
module.exports = { getHistory, createBooking };
