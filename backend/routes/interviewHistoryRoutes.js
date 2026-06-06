const express = require("express");
const { optionalAuth } = require("../middleware/optionalAuthMiddleware");

const {
  saveInterview,
  getAnalytics,
} = require(
  "../controllers/interviewHistoryController"
);

const router = express.Router();

router.post(
  "/save",
  optionalAuth,
  saveInterview
);

router.get(
  "/analytics",
  getAnalytics
);

module.exports = router;