const express = require("express");

const { protect } = require("../middleware/authMiddleware");
const { jobRefreshLimiter } = require("../middleware/rateLimit");

const {
  search,
  matchJob,
  saveJob,
  getSavedJobs,
  removeSavedJob,
  refreshListings,
} = require("../controllers/jobController");

const router = express.Router();

// Job discovery requires login
router.get("/search", protect, search);
router.post("/search", protect, search);
router.post("/match", protect, matchJob);
router.post("/refresh", protect, jobRefreshLimiter, refreshListings);

// Saved jobs
router.post("/saved", protect, saveJob);
router.get("/saved", protect, getSavedJobs);
router.delete("/saved/:id", protect, removeSavedJob);

module.exports = router;
