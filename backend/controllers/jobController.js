const SavedJob = require("../models/SavedJob");
const Subscription = require("../models/Subscription");

const PLANS = require("../config/plans");

const {
  searchJobs,
  getJobById,
  SOURCES,
} = require("../utils/jobCatalog");

const {
  computeMatchScore,
} = require("../utils/jobMatcher");

const search = async (req, res) => {
  try {
    const {
      query = "",
      location = "",
      type = "",
      sources = "",
      page = 1,
      limit = 20,
      resumeText = "",
    } = req.body?.query !== undefined ? req.body : req.query;

    const sourceList = sources
      ? (Array.isArray(sources)
          ? sources
          : sources.split(",")
        ).filter(Boolean)
      : [];

    const result = searchJobs({
      query,
      location,
      type,
      sources: sourceList,
      page: Number(page),
      limit: Number(limit),
    });

    // -----------------------------------------
    // PLAN ACCESS
    // -----------------------------------------

    const access = await getUserJobAccess(req.user.id);
    console.log("JOB ACCESS DEBUG:", access);

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

    res.json({
      success: true,
      ...result,
      availableSources: SOURCES,
    });
  } catch (error) {
    console.log(error);

    res.status(500).json({
      success: false,
      message: error.message,
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

    const job = getJobById(jobId);
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
};
