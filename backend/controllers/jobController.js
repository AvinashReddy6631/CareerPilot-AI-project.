const SavedJob = require("../models/SavedJob");
const Subscription = require("../models/Subscription");

const PLANS = require("../config/plans");

const {
  searchJobs,
  getJobById,
} = require("../utils/jobCatalog");
const { isSafeExternalUrl } = require("../services/jobSourceAdapters");
const { getRefreshMetadata, refreshJobListings } = require("../services/jobRefreshService");

const {
  computeMatchScore,
} = require("../utils/jobMatcher");

const search = async (req, res) => {
  try {
    const searchParams = req.method === "GET" ? req.query : req.body;
    const {
      query = "",
      location = "",
      type = "",
      sources = "",
      page = 1,
      limit = 20,
      resumeText = "",
    } = searchParams || {};

    const sourceList = Array.isArray(sources)
      ? sources.filter((source) => typeof source === "string" && source.trim())
      : typeof sources === "string"
        ? sources.split(",").filter(Boolean)
        : [];

    const refreshMetadata = await getRefreshMetadata();
    const result = await searchJobs({
      query,
      location,
      type,
      sources: sourceList,
      sourceKeys: refreshMetadata.configuredSourceKeys,
      page: Number(page),
      limit: Number(limit),
    });

    // -----------------------------------------
    // PLAN ACCESS
    // -----------------------------------------

    const access = await getUserJobAccess(req.user.id);
    // -----------------------------------------
    // FREE / BASIC
    // Only show selected jobs
    // -----------------------------------------

    if (access.jobsAccess === "limited") {
      const previewLimit = 4;

      result.jobs = result.jobs.slice(0, previewLimit);

      result.locked = true;
      result.lockedCount = Math.max(
        0,
        result.total - result.jobs.length
      );

      result.access = {
        plan: access.planKey,
        level: "limited",
        upgradeRequired: true,
      };
    }

    // -----------------------------------------
    // PRO / PREMIUM
    // Full job access
    // -----------------------------------------

    if (access.jobsAccess === "full") {
      result.locked = false;

      result.access = {
        plan: access.planKey,
        level: "full",
        upgradeRequired: false,
      };
    }

    // -----------------------------------------
    // Resume match scoring
    // -----------------------------------------

    if (resumeText?.trim()) {
      result.jobs = result.jobs.map((job) => {
        const match = computeMatchScore(
          resumeText,
          job
        );

        return {
          ...job,
          ...match,
        };
      });

      result.jobs.sort(
        (a, b) =>
          (b.matchScore || 0) -
          (a.matchScore || 0)
      );
    }

    const { configuredSourceKeys, ...refresh } = refreshMetadata;

    res.json({
      success: true,
      ...result,
      availableSources: refresh.configuredSources,
      refresh,
    });
  } catch (error) {
    console.error("Job search failed:", error.message);

    res.status(500).json({
      success: false,
      message: "Unable to load job listings. Please try again.",
    });
  }
};
const matchJob = async (req, res) => {
  try {
    const { jobId, resumeText } = req.body;

    if (!jobId || !resumeText?.trim()) {
      return res.status(400).json({
        success: false,
        message: "jobId and resumeText are required",
      });
    }

    const job = await getJobById(jobId);
    if (!job) {
      return res.status(404).json({ success: false, message: "Job not found" });
    }

    const match = computeMatchScore(resumeText, job);
    res.json({ success: true, job: { ...job, ...match } });
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, message: error.message });
  }
};

const saveJob = async (req, res) => {
  try {
    const { job } = req.body;

    if (!job?.jobId) {
      return res.status(400).json({
        success: false,
        message: "Job details with jobId are required",
      });
    }

    if (!isSafeExternalUrl(job.applyUrl)) {
      return res.status(400).json({
        success: false,
        message: "A valid job application URL is required",
      });
    }

    const saved = await SavedJob.findOneAndUpdate(
      { user: req.user.id, jobId: job.jobId },
      {
        user: req.user.id,
        jobId: job.jobId,
        source: job.source,
        company: job.company,
        role: job.role,
        location: job.location,
        salary: job.salary,
        type: job.type,
        applyUrl: job.applyUrl,
        matchScore: job.matchScore ?? null,
        description: job.description,
        skills: job.skills || [],
      },
      { upsert: true, new: true }
    );

    res.status(201).json({ success: true, savedJob: saved });
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, message: error.message });
  }
};

const refreshListings = async (req, res) => {
  const configuredAdmin = String(process.env.JOB_REFRESH_ADMIN_EMAIL || "").trim().toLowerCase();

  if (!configuredAdmin || req.user.email?.toLowerCase() !== configuredAdmin) {
    return res.status(403).json({
      success: false,
      message: "Not authorized to refresh job listings",
    });
  }

  try {
    const result = await refreshJobListings();
    if (!result.started) {
      return res.status(409).json({
        success: false,
        message: "A job refresh is already in progress",
      });
    }

    return res.json({ success: result.success, refresh: result });
  } catch (error) {
    console.error("Manual job refresh failed:", error.message);
    return res.status(500).json({
      success: false,
      message: "Unable to refresh job listings. Existing listings were kept.",
    });
  }
};

const getSavedJobs = async (req, res) => {
  try {
    const saved = await SavedJob.find({ user: req.user.id }).sort({ createdAt: -1 });
    res.json({ success: true, savedJobs: saved });
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, message: error.message });
  }
};

const removeSavedJob = async (req, res) => {
  try {
    const { id } = req.params;

    await SavedJob.findOneAndDelete({
      _id: id,
      user: req.user.id,
    });

    res.json({ success: true });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};


// ADD THIS
const getUserJobAccess = async (userId) => {
  const subscription = await Subscription.findOne({
    user: userId,
  });

  const planKey =
    subscription?.status === "active"
      ? subscription.plan
      : "FREE";

  const plan = PLANS[planKey] || PLANS.FREE;

  const jobsAccess = plan.features?.jobs || "limited";

  return {
    planKey,
    jobsAccess,
    jobLimit: jobsAccess === "full" ? null : 4,
  };
};

module.exports = {
  search,
  matchJob,
  saveJob,
  getSavedJobs,
  removeSavedJob,
  refreshListings,
};
