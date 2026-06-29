const express = require("express");
const { protect } = require("../middleware/authMiddleware");

const router = express.Router();

const {
  createResume,
  generateSummary,
  getHistory,
  getLatestResume,
  getResumeById,
  updateResume,
  deleteResume,
} = require("../controllers/resumeBuilderController");

router.use(protect);

router.post("/create", createResume);
router.post("/generate-summary", generateSummary);
router.get("/history", getHistory);
router.get("/latest", getLatestResume);
router.put("/:id", updateResume);
router.delete("/:id", deleteResume);
router.get("/:id", getResumeById);

module.exports = router;
