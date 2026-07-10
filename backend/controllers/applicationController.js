const JobApplication = require("../models/JobApplication");
const { STATUSES } = require("../models/JobApplication");

const buildStats = (applications) => {
  const stats = Object.fromEntries(STATUSES.map((status) => [status, 0]));
  applications.forEach((application) => {
    if (stats[application.status] !== undefined) stats[application.status] += 1;
  });
  return stats;
};

const getJobId = (job) => {
  const suppliedId = String(job.jobId || "").trim();
  if (suppliedId) return suppliedId;

  return [job.source, job.company, job.role, job.applyUrl]
    .map((value) => String(value || "").trim().toLowerCase())
    .join("|");
};

const sendDatabaseError = (res, error) => {
  if (error.name === "CastError") {
    return res.status(400).json({ success: false, message: "Invalid application id" });
  }

  console.error("Application Tracker database error:", error);
  return res.status(500).json({
    success: false,
    message: "Unable to complete the application request. Please try again.",
  });
};

const getApplications = async (req, res) => {
  try {
    const applications = await JobApplication.find({ user: req.user.id })
      .sort({ updatedAt: -1 })
      .lean();

    const stats = buildStats(applications);

    res.json({ success: true, applications, stats, statuses: STATUSES });
  } catch (error) {
    return sendDatabaseError(res, error);
  }
};

const createApplication = async (req, res) => {
  try {
    const { job, status = "applied", notes = "" } = req.body;

    if (!job?.company || !job?.role) {
      return res.status(400).json({
        success: false,
        message: "company and role are required",
      });
    }

    if (!STATUSES.includes(status)) {
      return res.status(400).json({ success: false, message: "Invalid application status" });
    }

    const jobId = getJobId(job);
    const result = await JobApplication.findOneAndUpdate(
      { user: req.user.id, jobId },
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
          matchScore: job.matchScore ?? null,
          status,
          notes,
          appliedAt: new Date(),
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

    const existing = Boolean(result.lastErrorObject?.updatedExisting);
    return res.status(existing ? 200 : 201).json({
      success: true,
      application: result.value,
      existing,
    });
  } catch (error) {
    if (error.code === 11000) {
      const application = await JobApplication.findOne({
        user: req.user.id,
        jobId: getJobId(req.body.job || {}),
      });
      return res.json({ success: true, application, existing: true });
    }
    return sendDatabaseError(res, error);
  }
};

const updateApplication = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, notes } = req.body;

    const update = {};
    if (status !== undefined) {
      if (!STATUSES.includes(status)) {
        return res.status(400).json({ success: false, message: "Invalid application status" });
      }
      update.status = status;
    }
    if (notes !== undefined) update.notes = notes;

    if (Object.keys(update).length === 0) {
      return res.status(400).json({ success: false, message: "No application changes supplied" });
    }

    const application = await JobApplication.findOneAndUpdate(
      { _id: id, user: req.user.id },
      update,
      { returnDocument: "after", runValidators: true }
    );

    if (!application) {
      return res.status(404).json({
        success: false,
        message: "Application not found",
      });
    }

    res.json({ success: true, application });
  } catch (error) {
    return sendDatabaseError(res, error);
  }
};

const deleteApplication = async (req, res) => {
  try {
    const { id } = req.params;

    const application = await JobApplication.findOneAndDelete({ _id: id, user: req.user.id });
    
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
