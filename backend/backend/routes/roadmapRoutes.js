const express = require("express");
const { protect } = require("../middleware/authMiddleware");

const router = express.Router();

const {
  generateRoadmap,
  getHistory,
  getLatestRoadmap,
  updateRoadmap,
} = require("../controllers/roadmapController");

router.use(protect);

router.get(
  "/history",
  getHistory
);

router.get(
  "/latest",
  getLatestRoadmap
);

router.post(
  "/generate",
  generateRoadmap
);

router.put(
  "/:id",
  updateRoadmap
);

module.exports = router;
