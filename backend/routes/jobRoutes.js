const express = require("express");

const { protect } = require("../middleware/authMiddleware");

const {
  search,
  matchJob,
  saveJob,
  getSavedJobs,
  removeSavedJob,
} = require("../controllers/jobController");

const router = express.Router();

// Job discovery requires login
router.get("/search", protect, search);
router.post("/search", protect, search);
router.post("/match", protect, matchJob);

// Saved jobs
router.post("/saved", protect, saveJob);
router.get("/saved", protect, getSavedJobs);
router.delete("/saved/:id", protect, removeSavedJob);

module.exports = router;