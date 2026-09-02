const express = require("express");

const router = express.Router();

const {
  registerUser,
  loginUser,
  forgotPassword,
  resetPassword,
} = require("../controllers/authController");

const { authLimiter } = require("../middleware/rateLimit");

router.post(
  "/register",
  authLimiter,
  registerUser
);

router.post(
  "/login",
  authLimiter,
  loginUser
);

router.post(
  "/forgot-password",
  authLimiter,
  forgotPassword
);

router.post(
  "/reset-password",
  authLimiter,
  resetPassword
);

module.exports = router;