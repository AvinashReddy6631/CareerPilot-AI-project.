const UserStreak = require("../models/UserStreak");
const { recordDailyActivity } = require("../utils/streak");

const serializeStreak = (streak) => ({
  currentStreak: Number(streak?.currentStreak || 0),
  longestStreak: Number(streak?.longestStreak || 0),
  lastActivityDate: streak?.lastActivityDate || null,
});

const getStreak = async (req, res) => {
  try {
    const streak = await UserStreak.findOne({ user: req.user._id }).lean();
    return res.json({
      success: true,
      timezone: "UTC",
      streak: serializeStreak(streak),
    });
  } catch (error) {
    console.error("Unable to load user streak:", error.message);
    return res.status(500).json({
      success: false,
      message: "Unable to load your streak. Please try again.",
    });
  }
};

const recordStreakActivity = async (req, res) => {
  try {
    const streak = await recordDailyActivity(req.user._id);
    return res.json({
      success: true,
      timezone: "UTC",
      streak: serializeStreak(streak),
    });
  } catch (error) {
    console.error("Unable to record user streak activity:", error.message);
    return res.status(500).json({
      success: false,
      message: "Unable to record today's activity. Please try again.",
    });
  }
};

module.exports = {
  getStreak,
  recordStreakActivity,
};
