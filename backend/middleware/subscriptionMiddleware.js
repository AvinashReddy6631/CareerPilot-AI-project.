const Subscription = require("../models/Subscription");
const PLANS = require("../config/plans");

const requireFeature = (feature) => {
  return async (req, res, next) => {
    try {
      const subscription = await Subscription.findOne({
        user: req.user.id,
      });

      // Users without a subscription record are FREE
      const planKey = subscription?.status === "active"
        ? subscription.plan
        : "FREE";

      const plan = PLANS[planKey];

      if (!plan) {
        return res.status(403).json({
          success: false,
          message: "Invalid subscription plan",
        });
      }

      const featureValue = plan.features[feature];

      if (
        featureValue === undefined ||
        featureValue === "none" ||
        featureValue === false ||
        featureValue === 0
      ) {
        return res.status(403).json({
          success: false,
          message: "This feature is not available on your current plan",
          plan: planKey,
          feature,
          upgradeRequired: true,
        });
      }

      // Make subscription information available to controllers
      req.subscription = subscription;
      req.plan = planKey;
      req.planDetails = plan;

      next();
    } catch (error) {
      console.error("Subscription middleware error:", error);

      return res.status(500).json({
        success: false,
        message: "Unable to verify subscription",
      });
    }
  };
};

module.exports = {
  requireFeature,
};