const express = require("express");

const {
  saveInterview,
  getAnalytics,
} = require(
  "../controllers/interviewHistoryController"
);

const router = express.Router();

router.post(
  "/save",
  saveInterview
);

router.get(
  "/analytics",
  getAnalytics
);

module.exports = router;