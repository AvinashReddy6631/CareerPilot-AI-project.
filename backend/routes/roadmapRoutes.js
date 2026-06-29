const express = require("express");
const { protect } = require("../middleware/authMiddleware");

const router = express.Router();

const {
  generateRoadmap,
} = require("../controllers/roadmapController");

router.post(
  "/generate",
  protect,
  generateRoadmap
);

module.exports = router;