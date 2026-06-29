const express = require("express");
const {
  getApplications,
  createApplication,
  updateApplication,
  deleteApplication,
} = require("../controllers/applicationController");
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

// All endpoints require authentication
router.get(
  "/",
  protect,
  apiLimiter,
  getApplications
);
router.post(
  "/",
  protect,
  apiLimiter,
  createApplication
);
router.patch(
  "/:id",
  protect,
  apiLimiter,
  updateApplication
);
router.delete(
  "/:id",
  protect,
  apiLimiter,
  deleteApplication
);

module.exports = router;
