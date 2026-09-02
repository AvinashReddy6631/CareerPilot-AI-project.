const crypto = require("crypto");

const Subscription = require("../models/Subscription");
const Payment = require("../models/Payment");
const WebhookEvent = require("../models/WebhookEvent");

const handlePaymentWebhook = async (req, res) => {
  try {
    const webhookSignature =
      req.headers["x-razorpay-signature"];

    const webhookEventId =
      req.headers["x-razorpay-event-id"];

    const webhookSecret =
      process.env.RAZORPAY_WEBHOOK_SECRET;

    // 1. Check webhook signature
    if (!webhookSignature) {
      return res.status(400).json({
        success: false,
        message: "Webhook signature is missing",
      });
    }

    // 2. Check webhook secret
    if (!webhookSecret) {
      console.error(
        "RAZORPAY_WEBHOOK_SECRET is not configured"
      );

      return res.status(500).json({
        success: false,
        message: "Webhook secret is not configured",
      });
    }

    // 3. Check event ID
    if (!webhookEventId) {
      return res.status(400).json({
        success: false,
        message: "Webhook event ID is missing",
      });
    }

    // 4. Raw request body
    const rawBody = req.body;

    if (!Buffer.isBuffer(rawBody)) {
      return res.status(400).json({
        success: false,
        message: "Webhook body is not raw",
      });
    }

    // 5. Verify Razorpay webhook signature
    const expectedSignature = crypto
      .createHmac("sha256", webhookSecret)
      .update(rawBody)
      .digest("hex");

    const expectedBuffer =
      Buffer.from(expectedSignature);

    const receivedBuffer =
      Buffer.from(webhookSignature);

    if (
      expectedBuffer.length !==
        receivedBuffer.length ||
      !crypto.timingSafeEqual(
        expectedBuffer,
        receivedBuffer
      )
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid webhook signature",
      });
    }

    // 6. Convert raw body to JSON
    const event = JSON.parse(
      rawBody.toString("utf8")
    );

    console.log(
      "Razorpay webhook received:",
      event.event
    );

    // 7. Prevent duplicate webhook processing
    try {
      await WebhookEvent.create({
        eventId: webhookEventId,
        event: event.event,
      });
    } catch (error) {
      // Duplicate event
      if (error.code === 11000) {
        console.log(
          "Duplicate Razorpay webhook ignored:",
          webhookEventId
        );

        return res.status(200).json({
          success: true,
          message: "Duplicate webhook ignored",
        });
      }

      throw error;
    }

    // 8. Extract subscription information
    const subscriptionEntity =
      event.payload?.subscription?.entity;

    const razorpaySubscriptionId =
      subscriptionEntity?.id;

    if (!razorpaySubscriptionId) {
      console.log(
        "Webhook does not contain a subscription ID:",
        event.event
      );

      return res.status(200).json({
        success: true,
        message: "Webhook received",
      });
    }

    // 9. Find our local subscription
    const subscription =
      await Subscription.findOne({
        razorpaySubscriptionId,
      });

    if (!subscription) {
      console.log(
        "Local subscription not found:",
        razorpaySubscriptionId
      );

      return res.status(200).json({
        success: true,
        message: "Webhook received",
      });
    }

    // 10. Update subscription information
    if (subscriptionEntity.plan_id) {
      subscription.razorpayPlanId =
        subscriptionEntity.plan_id;
    }

    if (subscriptionEntity.current_start) {
      subscription.currentPeriodStart =
        new Date(
          subscriptionEntity.current_start * 1000
        );
    }

    if (subscriptionEntity.current_end) {
      subscription.currentPeriodEnd =
        new Date(
          subscriptionEntity.current_end * 1000
        );
    }

    if (
      subscriptionEntity.end_at
    ) {
      subscription.currentPeriodEnd =
        new Date(
          subscriptionEntity.end_at * 1000
        );
    }

    if (
      subscriptionEntity.cancel_at_cycle_end !==
      undefined
    ) {
      subscription.cancelAtPeriodEnd =
        Boolean(
          subscriptionEntity.cancel_at_cycle_end
        );
    }

    // 11. Handle subscription lifecycle events
    switch (event.event) {
      case "subscription.authenticated":
        subscription.status =
          "authenticated";
        break;

      case "subscription.activated":
        subscription.status =
          "active";
        break;

      case "subscription.charged":
        subscription.status =
          "active";
        break;

      case "subscription.pending":
        subscription.status =
          "pending";
        break;

      case "subscription.halted":
        subscription.status =
          "halted";
        break;

      case "subscription.paused":
        subscription.status =
          "paused";
        break;

      case "subscription.resumed":
        subscription.status =
          "active";
        break;

      case "subscription.cancelled":
        subscription.status =
          "cancelled";
        break;

      case "subscription.completed":
        subscription.status =
          "completed";
        break;

      case "subscription.updated":
        if (
          subscriptionEntity.status ===
          "active"
        ) {
          subscription.status =
            "active";
        }
        break;

      default:
        console.log(
          "Unhandled Razorpay webhook event:",
          event.event
        );
    }

    await subscription.save();

    // 12. Handle payment information from charged event
    if (
      event.event ===
      "subscription.charged"
    ) {
      const paymentEntity =
        event.payload?.payment?.entity;

      if (paymentEntity?.id) {
        await Payment.findOneAndUpdate(
          {
            razorpayPaymentId:
              paymentEntity.id,
          },
          {
            user: subscription.user,
            subscription:
              subscription._id,
            razorpayPaymentId:
              paymentEntity.id,
            razorpaySubscriptionId:
              razorpaySubscriptionId,
            amount:
              paymentEntity.amount,
            currency:
              paymentEntity.currency ||
              "INR",
            status:
              paymentEntity.status,
            method:
              paymentEntity.method ||
              null,
          },
          {
            upsert: true,
            new: true,
            setDefaultsOnInsert: true,
          }
        );
      }
    }

    console.log(
      "Subscription updated:",
      {
        subscriptionId:
          razorpaySubscriptionId,
        event: event.event,
        status:
          subscription.status,
      }
    );

    return res.status(200).json({
      success: true,
      message:
        "Webhook processed successfully",
    });
  } catch (error) {
    console.error(
      "Payment webhook error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Unable to process webhook",
    });
  }
};

module.exports = {
  handlePaymentWebhook,
};