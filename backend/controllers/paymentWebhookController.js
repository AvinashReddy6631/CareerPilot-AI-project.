const crypto = require("crypto");

const Subscription = require("../models/Subscription");
const Payment = require("../models/Payment");

const handlePaymentWebhook = async (req, res) => {
  try {
    const webhookSignature = req.headers["x-razorpay-signature"];
    const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET;

    if (!webhookSignature) {
      return res.status(400).json({
        success: false,
        message: "Webhook signature is missing",
      });
    }

    if (!webhookSecret) {
      console.error("RAZORPAY_WEBHOOK_SECRET is not configured");

      return res.status(500).json({
        success: false,
        message: "Webhook secret is not configured",
      });
    }

    // req.body must be the raw webhook body
    const expectedSignature = crypto
      .createHmac("sha256", webhookSecret)
      .update(req.body)
      .digest("hex");

    const expectedBuffer = Buffer.from(expectedSignature);
    const receivedBuffer = Buffer.from(webhookSignature);

    if (
      expectedBuffer.length !== receivedBuffer.length ||
      !crypto.timingSafeEqual(expectedBuffer, receivedBuffer)
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid webhook signature",
      });
    }

    const event = JSON.parse(req.body);

    console.log("Razorpay webhook received:", event.event);

    return res.status(200).json({
      success: true,
      message: "Webhook received successfully",
    });
  } catch (error) {
    console.error("Payment webhook error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to process webhook",
    });
  }
};

module.exports = {
  handlePaymentWebhook,
};