const express = require("express");
const { protect } = require("../middleware/authMiddleware");
const {
  createSubscription,
  verifyPayment,
} = require("../controllers/paymentController");
const router = express.Router();

router.post("/create-subscription", protect, createSubscription);
router.post("/verify-payment", protect, verifyPayment);

module.exports = router;