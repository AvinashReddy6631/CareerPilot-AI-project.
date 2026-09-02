const Subscription = require("../models/Subscription");
const Usage = require("../models/Usage");
const PLANS = require("../config/plans");

const checkAIInterviewAccess = async (req, res, next) => {
  try {
    const subscription = await Subscription.findOne({
      user: req.user.id,
    });

    const planKey =
      subscription?.status === "active"
        ? subscription.plan
        : "FREE";

    const plan = PLANS[planKey];

    if (!plan) {
      return res.status(403).json({
        success: false,
        message: "Invalid subscription plan",
      });
    }

    // PRO and PREMIUM have full AI interview access
    if (plan.features.aiInterview === "full") {
      req.subscription = subscription;
      req.plan = planKey;
      req.planDetails = plan;

      return next();
    }

    // FREE and BASIC get exactly one lifetime trial
    if (plan.features.aiInterview === "trial") {
      try {
        const usage = await Usage.findOneAndUpdate(
          {
            user: req.user.id,
            aiInterviewTrialUsed: false,
          },
          {
            $set: {
              aiInterviewTrialUsed: true,
            },
          },
          {
            returnDocument: "after",
            upsert: true,
            setDefaultsOnInsert: true,
          }
        );

        // Trial successfully claimed
        if (usage) {
          req.subscription = subscription;
          req.plan = planKey;
          req.planDetails = plan;

          return next();
        }
      } catch (error) {
        // Another simultaneous request may have already
        // created the Usage document.
        if (error.code === 11000) {
          return res.status(403).json({
            success: false,
            message: "Your AI interview trial has already been used",
            plan: planKey,
            upgradeRequired: true,
          });
        }

        throw error;
      }

      return res.status(403).json({
        success: false,
        message: "Your AI interview trial has already been used",
        plan: planKey,
        upgradeRequired: true,
      });
    }

    return res.status(403).json({
      success: false,
      message: "AI interview is not available on your current plan",
      plan: planKey,
      upgradeRequired: true,
    });
  } catch (error) {
    console.error("AI interview access error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to verify AI interview access",
    });
  }
};

module.exports = {
  checkAIInterviewAccess,
};