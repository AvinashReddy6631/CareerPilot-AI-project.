const express = require("express");
const { protect } = require("../middleware/authMiddleware");

const {
  generateQuestions,
  evaluateAnswer,
  generateFinalReport,
} = require("../controllers/interviewController");

const router = express.Router();

router.use(protect);

router.post(
  "/generate-questions",
  generateQuestions
);

router.post(
  "/evaluate",
  evaluateAnswer
);

router.post(
  "/final-report",
  generateFinalReport
);

module.exports = router;