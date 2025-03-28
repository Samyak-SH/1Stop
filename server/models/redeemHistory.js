const mongoose = require("mongoose");

const redeemHistorySchema = new mongoose.Schema({
  uid: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  trans_id: {
    type: String,
    required: true,
    unique: true,
  },
  type: {
    type: String,
    enum: ["bus", "metro", "electricity", "recycling_reward"],
    required: true,
  },
  redeemedAt: {
    type: Date,
    default: Date.now,
  },
  amount: {
    type: Number,
    required: true,
  },
});

const RedeemHistoryModel = mongoose.model("RedeemHistory", redeemHistorySchema);

module.exports = RedeemHistoryModel;
