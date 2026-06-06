const express = require("express");
const { optionalAuth } = require("../middleware/optionalAuthMiddleware");

const router = express.Router();

const {
  createResume,
  generateSummary,
  getHistory,
  getResumeById,
} = require("../controllers/resumeBuilderController");

router.post("/create", optionalAuth, createResume);
router.post("/generate-summary", generateSummary);
router.get("/history", getHistory);
router.get("/:id", getResumeById);

module.exports = router;