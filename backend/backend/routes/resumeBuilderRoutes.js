const express = require("express");
const router = express.Router();

const {
protect,
} = require("../middleware/authMiddleware");

const {
createResume,
generateSummary,
getHistory,
getResumeById,
} = require("../controllers/resumeBuilderController");

router.post("/create", protect, createResume);

router.post(
"/generate-summary",
protect,
generateSummary
);

router.get(
"/history",
protect,
getHistory
);

router.get(
"/:id",
protect,
getResumeById
);

module.exports = router;
