const express = require("express");
const { protect } = require("../middleware/authMiddleware");
const {
  getStreak,
  recordStreakActivity,
} = require("../controllers/streakController");

const router = express.Router();

router.use(protect);
router.get("/", getStreak);
router.post("/activity", recordStreakActivity);

module.exports = router;
