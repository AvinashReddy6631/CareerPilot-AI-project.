const SavedJob = require("../models/SavedJob");
const { searchJobs, getJobById, SOURCES } = require("../utils/jobCatalog");
const { computeMatchScore } = require("../utils/jobMatcher");
const { isValidUrl, isExpired, enrichJobWithValidation } = require("../utils/jobValidator");

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
      ? (Array.isArray(sources) ? sources : sources.split(",")).filter(Boolean)
      : [];

    const result = searchJobs({
      query,
      location,
      type,
      sources: sourceList,
      page: Number(page),
      limit: Number(limit),
    });

    // Enrich jobs with validation metadata
    result.jobs = result.jobs.map((job) => {
      const enriched = enrichJobWithValidation(job);
      
      // Add match score if resume provided
      if (resumeText?.trim()) {
        const match = computeMatchScore(resumeText, enriched);
        return { ...enriched, ...match };
      }
      return enriched;
    });

    // Sort by match score if available
    if (resumeText?.trim()) {
      result.jobs.sort((a, b) => (b.matchScore || 0) - (a.matchScore || 0));
    }

    res.json({ 
      success: true, 
      ...result, 
      availableSources: SOURCES,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, message: error.message });
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

    // Check job validity
    if (!isValidUrl(job.applyUrl)) {
      return res.status(410).json({
        success: false,
        message: "Job posting is no longer available",
        job: enrichJobWithValidation(job),
      });
    }

    if (isExpired(job.postedDaysAgo)) {
      return res.status(410).json({
        success: false,
        message: "Job posting has expired",
        job: enrichJobWithValidation(job),
      });
    }

    const match = computeMatchScore(resumeText, job);
    res.json({ success: true, job: { ...enrichJobWithValidation(job), ...match } });
  } catch (error) {
    console.error("matchJob error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

const saveJob = async (req, res) => {
  try {
    const { clientId, job } = req.body;

    if (!clientId || !job?.jobId) {
      return res.status(400).json({
        success: false,
        message: "clientId and job details are required",
      });
    }

    const saved = await SavedJob.findOneAndUpdate(
      { clientId, jobId: job.jobId },
      {
        clientId,
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
    const { clientId } = req.query;

    if (!clientId) {
      return res.status(400).json({
        success: false,
        message: "clientId is required",
      });
    }

    const saved = await SavedJob.find({ clientId }).sort({ createdAt: -1 });
    res.json({ success: true, savedJobs: saved });
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, message: error.message });
  }
};

const removeSavedJob = async (req, res) => {
  try {
    const { clientId } = req.query;
    const { id } = req.params;

    await SavedJob.findOneAndDelete({ _id: id, clientId });
    res.json({ success: true });
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  search,
  matchJob,
  saveJob,
  getSavedJobs,
  removeSavedJob,
};
