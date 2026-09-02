const JobApplication = require("../models/JobApplication");
const Usage = require("../models/Usage");
const { STATUSES } = require("../models/JobApplication");

const Subscription = require("../models/Subscription");
const PLANS = require("../config/plans");

const buildStats = (applications) => {
  const stats = Object.fromEntries(STATUSES.map((status) => [status, 0]));

  applications.forEach((application) => {
    if (stats[application.status] !== undefined) {
      stats[application.status] += 1;
    }
  });

  return stats;
};

const getJobId = (job) => {
  const suppliedId = String(job.jobId || "").trim();

  if (suppliedId) {
    return suppliedId;
  }

  return [job.source, job.company, job.role, job.applyUrl]
    .map((value) => String(value || "").trim().toLowerCase())
    .join("|");
};

const sendDatabaseError = (res, error) => {
  if (error.name === "CastError") {
    return res.status(400).json({
      success: false,
      message: "Invalid application id",
    });
  }

  console.error("Application Tracker database error:", error);

  return res.status(500).json({
    success: false,
    message:
      "Unable to complete the application request. Please try again.",
  });
};

/*
 * Get the user's active plan.
 *
 * Users without a subscription are FREE.
 */
const getUserPlan = async (userId) => {
  const subscription = await Subscription.findOne({
    user: userId,
  });

  const planKey =
    subscription?.status === "active"
      ? subscription.plan
      : "FREE";

  const plan = PLANS[planKey];

  if (!plan) {
    throw new Error("Invalid subscription plan");
  }

  return {
    subscription,
    planKey,
    plan,
  };
};

/*
 * Check whether the user can make a NEW application.
 *
 * saved jobs do not consume application quota.
 *
 * FREE:
 *   0 applications
 *
 * BASIC:
 *   maximum 2 applications in current billing period
 *
 * PRO:
 *   unlimited
 *
 * PREMIUM:
 *   unlimited
 */
const checkApplicationQuota = async (
  userId,
  planKey
) => {
  const plan = PLANS[planKey];

  if (!plan) {
    throw new Error("Invalid subscription plan");
  }

  const applicationLimit =
    plan.features?.applications;

  // PRO / PREMIUM / unlimited plans
  if (
    applicationLimit === "unlimited" ||
    applicationLimit === null ||
    applicationLimit === undefined
  ) {
    return {
      allowed: true,
      limit: null,
      used: 0,
      remaining: null,
    };
  }

  // FREE users cannot apply
  if (applicationLimit === 0) {
    return {
      allowed: false,
      limit: 0,
      used: 0,
      remaining: 0,
      reason: "upgrade_required",
    };
  }

  const subscription = await Subscription.findOne({
    user: userId,
    status: "active",
  });

  if (!subscription) {
    return {
      allowed: false,
      limit: 0,
      used: 0,
      remaining: 0,
      reason: "upgrade_required",
    };
  }

  const usage = await Usage.findOne({
    user: userId,
  });

  let usedApplications = 0;

  if (
    usage?.applicationUsage?.periodStart &&
    usage?.applicationUsage?.periodEnd &&
    usage.applicationUsage.periodStart.getTime() ===
      subscription.currentPeriodStart.getTime() &&
    usage.applicationUsage.periodEnd.getTime() ===
      subscription.currentPeriodEnd.getTime()
  ) {
    usedApplications =
      usage.applicationUsage.count || 0;
  }

  const remaining = Math.max(
    applicationLimit - usedApplications,
    0
  );

  return {
    allowed: remaining > 0,
    limit: applicationLimit,
    used: usedApplications,
    remaining,
    reason:
      remaining > 0
        ? null
        : "quota_exceeded",
  };
};
const recordApplicationUsage = async (
  userId,
  periodStart,
  periodEnd
) => {
  const usage = await Usage.findOneAndUpdate(
    {
      user: userId,
      "applicationUsage.periodStart": periodStart,
      "applicationUsage.periodEnd": periodEnd,
    },
    {
      $inc: {
        "applicationUsage.count": 1,
      },
    },
    {
      returnDocument: "after",
    }
  );

  if (usage) {
    return usage;
  }

  return Usage.findOneAndUpdate(
    {
      user: userId,
    },
    {
      $set: {
        "applicationUsage.count": 1,
        "applicationUsage.periodStart": periodStart,
        "applicationUsage.periodEnd": periodEnd,
      },
    },
    {
      upsert: true,
      returnDocument: "after",
    }
  );
};



const getApplications = async (req, res) => {
  try {
    const applications = await JobApplication.find({
      user: req.user.id,
    })
      .sort({ updatedAt: -1 })
      .lean();

    const stats = buildStats(applications);

    res.json({
      success: true,
      applications,
      stats,
      statuses: STATUSES,
    });
  } catch (error) {
    return sendDatabaseError(res, error);
  }
};

const createApplication = async (req, res) => {
  try {
    const {
      job,
      status = "applied",
      notes = "",
    } = req.body;

    if (!job?.company || !job?.role) {
      return res.status(400).json({
        success: false,
        message: "company and role are required",
      });
    }

    if (!STATUSES.includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Invalid application status",
      });
    }

    const jobId = getJobId(job);

    /*
     * Check whether this job is already tracked.
     * Duplicate jobs must not consume application quota.
     */
    const existingApplication =
      await JobApplication.findOne({
        user: req.user.id,
        jobId,
      });

    if (existingApplication) {
      return res.status(200).json({
        success: true,
        application: existingApplication,
        existing: true,
      });
    }

    /*
     * Only status = "applied" consumes application quota.
     * "saved" does not consume quota.
     */
    let appliedAt = null;

    if (status === "applied") {
      const {
        planKey,
        subscription,
      } = await getUserPlan(req.user.id);

      const quota =
        await checkApplicationQuota(
          req.user.id,
          planKey
        );

      if (!quota.allowed) {
        if (quota.reason === "upgrade_required") {
          return res.status(403).json({
            success: false,
            message:
              planKey === "FREE"
                ? "Upgrade your plan to apply for jobs."
                : "Your plan does not allow more applications.",
            plan: planKey,
            used: quota.used ?? 0,
            limit: quota.limit ?? 0,
            remaining: quota.remaining ?? 0,
            upgradeRequired: true,
          });
        }

        if (quota.reason === "quota_exceeded") {
          return res.status(403).json({
            success: false,
            message:
              "You have reached your application limit for this billing period.",
            plan: planKey,
            used: quota.used ?? 0,
            limit: quota.limit ?? 0,
            remaining: quota.remaining ?? 0,
            upgradeRequired: true,
          });
        }

        return res.status(403).json({
          success: false,
          message: "Application not allowed.",
          plan: planKey,
          used: quota.used ?? 0,
          limit: quota.limit ?? 0,
          remaining: quota.remaining ?? 0,
          upgradeRequired: true,
        });
      }

      appliedAt = new Date();
    }

    const result =
      await JobApplication.findOneAndUpdate(
        {
          user: req.user.id,
          jobId,
        },
        {
          $setOnInsert: {
            user: req.user.id,
            jobId,
            company: job.company.trim(),
            role: job.role.trim(),
            location: job.location || "",
            salary: job.salary || "",
            source: job.source || "",
            applyUrl: job.applyUrl || "",
            matchScore:
              job.matchScore ?? null,
            status,
            notes,
            appliedAt,
          },
        },
        {
          returnDocument: "after",
          upsert: true,
          runValidators: true,
          setDefaultsOnInsert: true,
          includeResultMetadata: true,
        }
      );

    const existing = Boolean(
      result.lastErrorObject?.updatedExisting
    );

    /*
     * Record application usage only when
     * a NEW application was actually created.
     */
    if (!existing && status === "applied") {
      const {
        subscription,
      } = await getUserPlan(req.user.id);

      if (
        subscription?.currentPeriodStart &&
        subscription?.currentPeriodEnd
      ) {
        await recordApplicationUsage(
          req.user.id,
          subscription.currentPeriodStart,
          subscription.currentPeriodEnd
        );
      }
    }

    return res.status(existing ? 200 : 201).json({
      success: true,
      application: result.value,
      existing,
    });
  } catch (error) {
    if (error.code === 11000) {
      const application =
        await JobApplication.findOne({
          user: req.user.id,
          jobId: getJobId(
            req.body.job || {}
          ),
        });

      return res.json({
        success: true,
        application,
        existing: true,
      });
    }

    return sendDatabaseError(res, error);
  }
};

const updateApplication = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, notes } = req.body;

    const existingApplication =
      await JobApplication.findOne({
        _id: id,
        user: req.user.id,
      });

    if (!existingApplication) {
      return res.status(404).json({
        success: false,
        message: "Application not found",
      });
    }

    const update = {};

    // Keep this outside the if block because
    // we need it later after the database update.
    let becomingApplied = false;

    if (status !== undefined) {
      if (!STATUSES.includes(status)) {
        return res.status(400).json({
          success: false,
          message: "Invalid application status",
        });
      }

      /*
       * A saved application becomes a real application.
       * This is the only transition that consumes quota.
       */
      becomingApplied =
        existingApplication.appliedAt === null &&
        status === "applied";

      if (becomingApplied) {
        const {
          planKey,
          subscription,
        } = await getUserPlan(req.user.id);

        const quota =
          await checkApplicationQuota(
            req.user.id,
            planKey
          );

        if (!quota.allowed) {
          if (quota.reason === "upgrade_required") {
            return res.status(403).json({
              success: false,
              message:
                planKey === "FREE"
                  ? "Upgrade your plan to apply for jobs."
                  : "Your plan does not allow more applications.",
              plan: planKey,
              used: quota.used ?? 0,
              limit: quota.limit ?? 0,
              remaining: quota.remaining ?? 0,
              upgradeRequired: true,
            });
          }

          if (quota.reason === "quota_exceeded") {
            return res.status(403).json({
              success: false,
              message:
                "You have reached your application limit for this billing period.",
              plan: planKey,
              used: quota.used ?? 0,
              limit: quota.limit ?? 0,
              remaining: quota.remaining ?? 0,
              upgradeRequired: true,
            });
          }

          return res.status(403).json({
            success: false,
            message: "Application not allowed.",
            plan: planKey,
            used: quota.used ?? 0,
            limit: quota.limit ?? 0,
            remaining: quota.remaining ?? 0,
            upgradeRequired: true,
          });
        }

        /*
         * Once an application has been applied,
         * appliedAt is permanent.
         */
        update.appliedAt = new Date();
      }

      update.status = status;
    }

    if (notes !== undefined) {
      update.notes = notes;
    }

    if (Object.keys(update).length === 0) {
      return res.status(400).json({
        success: false,
        message: "No application changes supplied",
      });
    }

    const application =
      await JobApplication.findOneAndUpdate(
        {
          _id: id,
          user: req.user.id,
        },
        update,
        {
          returnDocument: "after",
          runValidators: true,
        }
      );

    if (!application) {
      return res.status(404).json({
        success: false,
        message: "Application not found",
      });
    }

    /*
     * Record quota usage only when a saved job
     * becomes a real application.
     */
    if (becomingApplied) {
      const {
        subscription,
      } = await getUserPlan(req.user.id);

      if (
        subscription?.currentPeriodStart &&
        subscription?.currentPeriodEnd
      ) {
        await recordApplicationUsage(
          req.user.id,
          subscription.currentPeriodStart,
          subscription.currentPeriodEnd
        );
      }
    }

    return res.json({
      success: true,
      application,
    });
  } catch (error) {
    return sendDatabaseError(res, error);
  }
};

const deleteApplication = async (req, res) => {
  try {
    const { id } = req.params;

    const application =
      await JobApplication.findOneAndDelete({
        _id: id,
        user: req.user.id,
      });

    if (!application) {
      return res.status(404).json({
        success: false,
        message: "Application not found",
      });
    }

    res.json({ success: true });
  } catch (error) {
    return sendDatabaseError(res, error);
  }
};

module.exports = {
  getApplications,
  createApplication,
  updateApplication,
  deleteApplication,
};