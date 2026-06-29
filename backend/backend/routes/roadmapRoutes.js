const express = require("express");
const { optionalAuth } = require("../middleware/optionalAuthMiddleware");

const router = express.Router();

const {
  generateRoadmap,
} = require("../controllers/roadmapController");

router.post(
  "/generate",
  optionalAuth,
  generateRoadmap
);

module.exports = router;