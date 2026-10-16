const Subscription = require("../models/Subscription");
const Usage = require("../models/Usage");
const PLANS = require("../config/plans");

const FREE_AI_INTERVIEW_LIMIT = 2;

const checkAIInterviewAccess = async (req, res, next) => {
  try {
    const userId = req.user.id;

    const subscription = await Subscription.findOne({
      user: userId,
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

    // FREE and BASIC get 2 lifetime AI interviews
    if (plan.features.aiInterview === "trial") {
      let usage = await Usage.findOne({
        user: userId,
      });

      // First AI interview for this user
      if (!usage) {
        try {
          usage = await Usage.create({
            user: userId,
            aiInterviewUsed: 1,
          });
        } catch (error) {
          // Another request may have created the Usage document
          // at the same time. Fetch it again.
          if (error.code === 11000) {
            usage = await Usage.findOne({
              user: userId,
            });
          } else {
            throw error;
          }
        }
      } else {
        // User already has a Usage document.
        // Atomically allow another interview only if
        // they have used fewer than 2.
        usage = await Usage.findOneAndUpdate(
          {
            user: userId,
            aiInterviewUsed: {
              $lt: FREE_AI_INTERVIEW_LIMIT,
            },
          },
          {
            $inc: {
              aiInterviewUsed: 1,
            },
          },
          {
            new: true,
          }
        );
      }

      // No usage document or limit already reached
      if (!usage) {
        return res.status(403).json({
          success: false,
          message:
            "You have used all 2 AI interviews on your current plan.",
          plan: planKey,
          used: FREE_AI_INTERVIEW_LIMIT,
          limit: FREE_AI_INTERVIEW_LIMIT,
          remaining: 0,
          upgradeRequired: true,
        });
      }

      req.subscription = subscription;
      req.plan = planKey;
      req.planDetails = plan;

      return next();
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