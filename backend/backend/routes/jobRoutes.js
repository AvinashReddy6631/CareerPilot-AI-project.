const express = require("express");
const {
  search,
  matchJob,
  saveJob,
  getSavedJobs,
  removeSavedJob,
} = require("../controllers/jobController");
const {
  protect,
} = require(
  "../middleware/authMiddleware"
);
const {
  apiLimiter,
} = require(
  "../middleware/rateLimitMiddleware"
);

const router = express.Router();

// Public search endpoint - limited rate
router.get("/search", apiLimiter, search);
router.post("/search", apiLimiter, search);

// Protected endpoints - require authentication
router.post(
  "/match",
  protect,
  apiLimiter,
  matchJob
);
router.post(
  "/saved",
  protect,
  apiLimiter,
  saveJob
);
router.get(
  "/saved",
  protect,
  apiLimiter,
  getSavedJobs
);
router.delete(
  "/saved/:id",
  protect,
  apiLimiter,
  removeSavedJob
);

module.exports = router;
