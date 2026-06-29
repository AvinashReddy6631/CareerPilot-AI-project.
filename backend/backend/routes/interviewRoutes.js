const express = require("express");

const router = express.Router();

const {
protect,
} = require("../middleware/authMiddleware");

const {
generateQuestions,
evaluateAnswer,
generateFinalReport,
} = require("../controllers/interviewController");

router.post(
"/generate-questions",
protect,
generateQuestions
);

router.post(
"/evaluate",
protect,
evaluateAnswer
);

router.post(
"/final-report",
protect,
generateFinalReport
);

module.exports = router;
