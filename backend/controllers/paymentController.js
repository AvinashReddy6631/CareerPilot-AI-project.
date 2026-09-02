const razorpay = require("../config/razorpay");
const PLANS = require("../config/plans");
const crypto = require("crypto");

const Subscription = require("../models/Subscription");
const Payment = require("../models/Payment");

const createSubscription = async (req, res) => {
  try {
    const { plan } = req.body;

    // 1. Validate requested plan
    const selectedPlan = PLANS[plan];

    if (!selectedPlan) {
      return res.status(400).json({
        success: false,
        message: "Invalid plan",
      });
    }

    // 2. Free plan does not use Razorpay
    if (plan === "FREE") {
      return res.status(400).json({
        success: false,
        message: "Free plan does not require a subscription",
      });
    }

    // 3. Make sure Razorpay plan is configured
    if (!selectedPlan.razorpayPlanId) {
      return res.status(500).json({
        success: false,
        message: "Razorpay plan is not configured",
      });
    }

    // 4. Make sure Razorpay secret exists
    if (!process.env.RAZORPAY_KEY_SECRET) {
      console.error("RAZORPAY_KEY_SECRET is not configured");

      return res.status(500).json({
        success: false,
        message: "Payment system is not configured",
      });
    }

    // 5. Prevent duplicate active subscriptions
    const existingSubscription = await Subscription.findOne({
      user: req.user.id,
    });

    if (
      existingSubscription &&
      ["active", "created", "authenticated"].includes(
        existingSubscription.status
      )
    ) {
      return res.status(409).json({
        success: false,
        message: "You already have an active or pending subscription",
        plan: existingSubscription.plan,
        status: existingSubscription.status,
      });
    }

    // 6. Razorpay billing cycle count
    //
    // BASIC / PRO:
    // 120 monthly billing cycles = 10 years
    //
    // PREMIUM:
    // 10 yearly billing cycles = 10 years
    //
    // We can change this later if the product requires
    // a different subscription duration.
    const totalCount =
      plan === "PREMIUM"
        ? 10
        : 120;

    // 7. Create Razorpay subscription
    const razorpaySubscription =
      await razorpay.subscriptions.create({
        plan_id: selectedPlan.razorpayPlanId,
        total_count: totalCount,
        customer_notify: 1,
      });

    // 8. Save subscription in our database
    const savedSubscription =
      await Subscription.findOneAndUpdate(
        {
          user: req.user.id,
        },
        {
          user: req.user.id,
          plan,
          status: "created",
          razorpayPlanId:
            selectedPlan.razorpayPlanId,
          razorpaySubscriptionId:
            razorpaySubscription.id,
        },
        {
          new: true,
          upsert: true,
          setDefaultsOnInsert: true,
        }
      );

    // 9. Send only safe information to frontend
    return res.status(201).json({
      success: true,
      subscription: {
        id: savedSubscription.razorpaySubscriptionId,
        plan: savedSubscription.plan,
        status: savedSubscription.status,
        razorpayPlanId:
          savedSubscription.razorpayPlanId,
      },
    });
  } catch (error) {
    console.error(
      "Create subscription error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Unable to create subscription",
    });
  }
};

const verifyPayment = async (req, res) => {
  try {
    const {
      razorpay_payment_id,
      razorpay_subscription_id,
      razorpay_signature,
    } = req.body;

    // --------------------------------------------------
    // 1. Validate callback data
    // --------------------------------------------------

    if (
      !razorpay_payment_id ||
      !razorpay_subscription_id ||
      !razorpay_signature
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Payment verification details are missing",
      });
    }

    // --------------------------------------------------
    // 2. Make sure payment secret exists
    // --------------------------------------------------

    if (!process.env.RAZORPAY_KEY_SECRET) {
      console.error(
        "RAZORPAY_KEY_SECRET is not configured"
      );

      return res.status(500).json({
        success: false,
        message: "Payment system is not configured",
      });
    }

    // --------------------------------------------------
    // 3. Find local subscription
    // --------------------------------------------------

    const subscription =
      await Subscription.findOne({
        user: req.user.id,
        razorpaySubscriptionId:
          razorpay_subscription_id,
      });

    if (!subscription) {
      return res.status(404).json({
        success: false,
        message: "Subscription not found",
      });
    }

    // --------------------------------------------------
    // 4. Verify Razorpay checkout signature
    // --------------------------------------------------

    const signatureBody =
      razorpay_payment_id +
      "|" +
      razorpay_subscription_id;

    const expectedSignature = crypto
      .createHmac(
        "sha256",
        process.env.RAZORPAY_KEY_SECRET
      )
      .update(signatureBody)
      .digest("hex");

    const expectedBuffer =
      Buffer.from(expectedSignature);

    const receivedBuffer =
      Buffer.from(razorpay_signature);

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
        message: "Invalid payment signature",
      });
    }

    // --------------------------------------------------
    // 5. Fetch actual payment from Razorpay
    // --------------------------------------------------

    const payment =
      await razorpay.payments.fetch(
        razorpay_payment_id
      );

    // --------------------------------------------------
    // 6. Make sure payment belongs to this subscription
    // --------------------------------------------------

    if (
      payment.subscription_id &&
      payment.subscription_id !==
        razorpay_subscription_id
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Payment does not belong to this subscription",
      });
    }

    // --------------------------------------------------
    // 7. Fetch actual subscription from Razorpay
    // --------------------------------------------------

    const razorpaySubscription =
      await razorpay.subscriptions.fetch(
        razorpay_subscription_id
      );

    // --------------------------------------------------
    // 8. Make sure Razorpay plan matches our plan
    // --------------------------------------------------

    if (
      razorpaySubscription.plan_id !==
      subscription.razorpayPlanId
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Subscription plan does not match",
      });
    }

    // --------------------------------------------------
    // 9. Make sure payment currency is INR
    // --------------------------------------------------

    if (
      payment.currency &&
      payment.currency !== "INR"
    ) {
      return res.status(400).json({
        success: false,
        message: "Unsupported payment currency",
      });
    }

    // --------------------------------------------------
    // 10. Save payment
    // --------------------------------------------------

    const savedPayment =
      await Payment.findOneAndUpdate(
        {
          razorpayPaymentId:
            razorpay_payment_id,
        },
        {
          user: req.user.id,
          subscription: subscription._id,
          razorpayPaymentId:
            razorpay_payment_id,
          razorpaySubscriptionId:
            razorpay_subscription_id,
          amount: payment.amount,
          currency:
            payment.currency || "INR",
          status: payment.status,
          method:
            payment.method || null,
        },
        {
          new: true,
          upsert: true,
          setDefaultsOnInsert: true,
        }
      );

    // --------------------------------------------------
    // 11. Sync subscription dates from Razorpay
    // --------------------------------------------------

    if (
      razorpaySubscription.current_start
    ) {
      subscription.currentPeriodStart =
        new Date(
          razorpaySubscription.current_start *
            1000
        );
    }

    if (
      razorpaySubscription.current_end
    ) {
      subscription.currentPeriodEnd =
        new Date(
          razorpaySubscription.current_end *
            1000
        );
    }

    // --------------------------------------------------
    // 12. Activate local subscription
    //
    // Webhooks will continue to keep this status
    // synchronized after this initial verification.
    // --------------------------------------------------

    if (
      ["authenticated", "active"].includes(
        razorpaySubscription.status
      )
    ) {
      subscription.status = "active";
    }

    await subscription.save();

    // --------------------------------------------------
    // 13. Return safe response
    // --------------------------------------------------

    return res.status(200).json({
      success: true,
      message:
        "Payment verified and subscription synchronized",

      subscription: {
        id:
          subscription.razorpaySubscriptionId,
        plan: subscription.plan,
        status: subscription.status,
        currentPeriodStart:
          subscription.currentPeriodStart,
        currentPeriodEnd:
          subscription.currentPeriodEnd,
      },

      payment: {
        id:
          savedPayment.razorpayPaymentId,
        amount:
          savedPayment.amount,
        currency:
          savedPayment.currency,
        status:
          savedPayment.status,
      },
    });
  } catch (error) {
    console.error(
      "Payment verification error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Unable to verify payment",
    });
  }
};

module.exports = {
  createSubscription,
  verifyPayment,
};