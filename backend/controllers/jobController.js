const SavedJob = require("../models/SavedJob");
const { searchJobs, getJobById, SOURCES } = require("../utils/jobCatalog");
const { computeMatchScore } = require("../utils/jobMatcher");

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

    // Sanitize and validate inputs
    const sanitize = (str) => {
      return String(str).slice(0, 500).trim();
    };

    const sanitizedQuery = sanitize(query);
    const sanitizedLocation = sanitize(location);
    const sanitizedType = sanitize(type);
    const pageNum = Math.max(1, Math.min(Number(page) || 1, 1000));
    const limitNum = Math.max(1, Math.min(Number(limit) || 20, 100));

    const sourceList = sources
      ? (Array.isArray(sources) ? sources : String(sources).split(","))
          .map((s) => String(s).trim())
          .filter(Boolean)
          .slice(0, 20)
      : [];

    const result = searchJobs({
      query: sanitizedQuery,
      location: sanitizedLocation,
      type: sanitizedType,
      sources: sourceList,
      page: pageNum,
      limit: limitNum,
    });

    if (resumeText?.trim()) {
      result.jobs = result.jobs.map((job) => {
        const match = computeMatchScore(resumeText, job);
        return { ...job, ...match };
      });
      result.jobs.sort((a, b) => (b.matchScore || 0) - (a.matchScore || 0));
    }

    res.json({ success: true, ...result, availableSources: SOURCES });
  } catch (error) {
    res.status(500).json({ success: false, message: "Search failed" });
  }
};

const matchJob = async (req, res) => {
  try {
    const { jobId, resumeText } = req.body;

    // Validate inputs
    const sanitizedJobId = String(jobId || "").trim().slice(0, 100);
    const sanitizedResumeText = String(resumeText || "").trim().slice(0, 50000);

    if (!sanitizedJobId || !sanitizedResumeText) {
      return res.status(400).json({
        success: false,
        message: "jobId and resumeText are required",
      });
    }

    const job = getJobById(sanitizedJobId);
    if (!job) {
      return res.status(404).json({ success: false, message: "Job not found" });
    }

    const match = computeMatchScore(sanitizedResumeText, job);
    res.json({ success: true, job: { ...job, ...match } });
  } catch (error) {
    res.status(500).json({ success: false, message: "Job matching failed" });
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
    const userId = req.user._id;

    if (!clientId) {
      return res.status(400).json({
        success: false,
        message: "clientId is required",
      });
    }

    // Verify ownership
    if (clientId !== userId.toString()) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to access these saved jobs",
      });
    }

    const saved = await SavedJob.find({ clientId }).sort({ createdAt: -1 });
    res.json({ success: true, savedJobs: saved });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const removeSavedJob = async (req, res) => {
  try {
    const { clientId } = req.query;
    const { id } = req.params;
    const userId = req.user._id;

    if (!clientId) {
      return res.status(400).json({
        success: false,
        message: "clientId is required",
      });
    }

    // Verify ownership
    if (clientId !== userId.toString()) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to delete this saved job",
      });
    }

    const deleted = await SavedJob.findOneAndDelete({ _id: id, clientId });
    
    if (!deleted) {
      return res.status(404).json({
        success: false,
        message: "Saved job not found",
      });
    }

    res.json({ success: true });
  } catch (error) {
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
