const express = require("express");
const { protect } = require("../middleware/authMiddleware");

const {
  generateQuestions,
  evaluateAnswer,
  generateFinalReport,
} = require("../controllers/interviewController");

const router = express.Router();

const logRouteReached = (req, res, next) => {
  console.info("[AI Interview] STEP 1: Route reached", {
    method: req.method,
    path: req.originalUrl,
  });
  next();
};

const logJwtVerified = (req, res, next) => {
  console.info("[AI Interview] STEP 2: JWT verified", {
    userId: req.user?._id?.toString(),
  });
  next();
};

router.post(
  "/generate-questions",
  logRouteReached,
  protect,
  logJwtVerified,
  generateQuestions
);

router.use(protect);

router.post(
  "/evaluate",
  evaluateAnswer
);

router.post(
  "/final-report",
  generateFinalReport
);

module.exports = router;
