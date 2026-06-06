const express = require("express");

const {
  generateQuestions,
  evaluateAnswer,
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

module.exports = router;