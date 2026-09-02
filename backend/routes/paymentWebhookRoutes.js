const express = require("express");

const {
  handlePaymentWebhook,
} = require("../controllers/paymentWebhookController");

const router = express.Router();

router.post(
  "/",
  express.raw({
    type: "application/json",
  }),
  handlePaymentWebhook
);

module.exports = router;