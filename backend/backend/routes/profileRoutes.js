const express = require("express");
const { protect } = require("../middleware/authMiddleware");
const {
  getProfile,
  updateProfile,
  getProfileStats,
  getProfileHistory,
} = require("../controllers/profileController");
const {
  apiLimiter,
} = require("../middleware/rateLimitMiddleware");

const router = express.Router();

router.get("/", protect, apiLimiter, getProfile);
router.put("/", protect, apiLimiter, updateProfile);
router.get("/stats", protect, apiLimiter, getProfileStats);
router.get("/history", protect, apiLimiter, getProfileHistory);

module.exports = router;
