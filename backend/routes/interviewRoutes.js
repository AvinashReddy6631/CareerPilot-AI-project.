const express = require("express");

const {
  generateQuestions,
  evaluateAnswer,
  generateFinalReport,
} = require("../controllers/interviewController");

const router = express.Router();

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