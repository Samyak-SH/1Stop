const mongoose = require("mongoose");

const BookingHistorySchema = new mongoose.Schema(
  {
    uid: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    book_id: {
      type: String,
      required: true,
    },
    to: {
      type: String,
      required: true,
    },
    from: {
      type: String,
      required: true,
    },
    Totalfare: {
      type: Number,
      required: true,
    },
    no_of_people: {
      type: Number,
      required: true,
      min: 1,
    },
  },
  { timestamps: true }
);

const BookingHistoryModel = mongoose.model(
  "BookingHistory",
  BookingHistorySchema
);
module.exports = BookingHistoryModel;
