const mongoose = require("mongoose");

const userStreakSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
      index: true,
    },
    currentStreak: { type: Number, default: 0, min: 0 },
    longestStreak: { type: Number, default: 0, min: 0 },
    // Server UTC calendar date (YYYY-MM-DD), never supplied by the client.
    lastActivityDate: { type: String, default: null, match: /^\d{4}-\d{2}-\d{2}$/ },
    lastActivityAt: { type: Date, default: null },
  },
  { timestamps: true }
);

module.exports = mongoose.model("UserStreak", userStreakSchema);
