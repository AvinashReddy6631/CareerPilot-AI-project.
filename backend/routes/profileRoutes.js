const express = require("express");
const { protect } = require("../middleware/authMiddleware");
const {
  getProfile,
  updateProfile,
  getProfileStats,
  getProfileHistory,
} = require("../controllers/profileController");

const router = express.Router();

router.get("/", protect, getProfile);
router.put("/", protect, updateProfile);
router.get("/stats", protect, getProfileStats);
router.get("/history", protect, getProfileHistory);

module.exports = router;
