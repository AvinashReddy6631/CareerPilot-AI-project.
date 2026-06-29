const express = require(
  "express"
);

const router =
  express.Router();

const {
  registerUser,
  loginUser,
} = require(
  "../controllers/authController"
);

const {
  loginLimiter,
  registrationLimiter,
} = require(
  "../middleware/rateLimitMiddleware"
);

router.post(
  "/register",
  registrationLimiter,
  registerUser
);

router.post(
  "/login",
  loginLimiter,
  loginUser
);

module.exports = router;
