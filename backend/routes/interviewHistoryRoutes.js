const express = require("express");
const { protect } = require("../middleware/authMiddleware");


const {
  saveInterview,
  getAnalytics,
} = require(
  "../controllers/interviewHistoryController"
);

const router = express.Router();

router.post(
  "/save",
  protect,
  saveInterview
);


router.get(
  "/analytics",
  getAnalytics
);

module.exports = router;