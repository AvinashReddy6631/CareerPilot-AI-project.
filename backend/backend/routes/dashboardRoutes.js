const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/authMiddleware");

const {
  getAnalytics,
  getActivity,
} = require("../controllers/dashboardController");

router.get(
  "/analytics",
  protect,
  getAnalytics
);

router.get(
  "/activity",
  protect,
  getActivity
);

module.exports = router;
