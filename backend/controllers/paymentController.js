const razorpay = require("../config/razorpay");
const PLANS = require("../config/plans");
const crypto = require("crypto");
const Subscription = require("../models/Subscription");
const Payment = require("../models/Payment");

const createSubscription = async (req, res) => {
  try {
    const { plan } = req.body;

    // Check that the requested plan exists
    const selectedPlan = PLANS[plan];

    if (!selectedPlan) {
      return res.status(400).json({
        success: false,
        message: "Invalid plan",
      });
    }

    // Free plan does not use Razorpay
    if (plan === "FREE") {
      return res.status(400).json({
        success: false,
        message: "Free plan does not require a subscription",
      });
    }

    // Make sure the paid plan has a Razorpay plan ID
    if (!selectedPlan.razorpayPlanId) {
      return res.status(500).json({
        success: false,
        message: "Razorpay plan is not configured",
      });
    }

    // Create Razorpay subscription
    const subscription = await razorpay.subscriptions.create({
      plan_id: selectedPlan.razorpayPlanId,
      total_count: 120,
      customer_notify: 1,
    });
    const savedSubscription = await Subscription.findOneAndUpdate(
  {
    user: req.user.id,
  },
  {
    user: req.user.id,
    plan,
    status: "created",
    razorpayPlanId: selectedPlan.razorpayPlanId,
    razorpaySubscriptionId: subscription.id,
  },
  {
    new: true,
    upsert: true,
    setDefaultsOnInsert: true,
  }
);

    return res.status(201).json({
  success: true,
  subscription: {
    id: savedSubscription.razorpaySubscriptionId,
    plan: savedSubscription.plan,
    status: savedSubscription.status,
    razorpayPlanId: savedSubscription.razorpayPlanId,
  },
});
  } catch (error) {
    console.error("Create subscription error:", error);

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

    if (
      !razorpay_payment_id ||
      !razorpay_subscription_id ||
      !razorpay_signature
    ) {
      return res.status(400).json({
        success: false,
        message: "Payment verification details are missing",
      });
    }

    // 1. Find the subscription created for this user
    const subscription = await Subscription.findOne({
      user: req.user.id,
      razorpaySubscriptionId: razorpay_subscription_id,
    });

    if (!subscription) {
      return res.status(404).json({
        success: false,
        message: "Subscription not found",
      });
    }

    // 2. Verify Razorpay payment signature
    const body =
      razorpay_payment_id + "|" + razorpay_subscription_id;

    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(body)
      .digest("hex");

    const expectedBuffer = Buffer.from(expectedSignature);
    const receivedBuffer = Buffer.from(razorpay_signature);

    if (
      expectedBuffer.length !== receivedBuffer.length ||
      !crypto.timingSafeEqual(expectedBuffer, receivedBuffer)
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid payment signature",
      });
    }

    // 3. Fetch the payment from Razorpay
    const payment = await razorpay.payments.fetch(
      razorpay_payment_id
    );

    // 4. Save the payment in our database
    const savedPayment = await Payment.findOneAndUpdate(
      {
        razorpayPaymentId: razorpay_payment_id,
      },
      {
        user: req.user.id,
        subscription: subscription._id,
        razorpayPaymentId: razorpay_payment_id,
        razorpaySubscriptionId: razorpay_subscription_id,
        amount: payment.amount,
        currency: payment.currency || "INR",
        status: payment.status,
        method: payment.method || null,
      },
      {
        new: true,
        upsert: true,
        setDefaultsOnInsert: true,
      }
    );

    // 5. Activate the subscription
    subscription.status = "active";
    await subscription.save();

    return res.status(200).json({
      success: true,
      message: "Payment verified and subscription activated",
      subscription: {
        id: subscription.razorpaySubscriptionId,
        plan: subscription.plan,
        status: subscription.status,
      },
      payment: {
        id: savedPayment.razorpayPaymentId,
        amount: savedPayment.amount,
        currency: savedPayment.currency,
        status: savedPayment.status,
      },
    });
  } catch (error) {
    console.error("Payment verification error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to verify payment",
    });
  }
};
module.exports = {
  createSubscription,
  verifyPayment,
};