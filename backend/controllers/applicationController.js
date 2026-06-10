const JobApplication = require("../models/JobApplication");
const { STATUSES } = require("../models/JobApplication");

const getApplications = async (req, res) => {
  try {
    const { clientId } = req.query;

    if (!clientId) {
      return res.status(400).json({
        success: false,
        message: "clientId is required",
      });
    }

    const applications = await JobApplication.find({ clientId }).sort({
      updatedAt: -1,
    });

    const stats = STATUSES.reduce((acc, status) => {
      acc[status] = applications.filter((a) => a.status === status).length;
      return acc;
    }, {});

    res.json({ success: true, applications, stats, statuses: STATUSES });
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, message: error.message });
  }
};

const createApplication = async (req, res) => {
  try {
    const { clientId, job, status = "applied", notes = "", isAutoTrack = false } = req.body;

    if (!clientId || !job?.company || !job?.role) {
      return res.status(400).json({
        success: false,
        message: "clientId, company, and role are required",
      });
    }

    // Check if already tracked
    const existing = job.jobId
      ? await JobApplication.findOne({ clientId, jobId: job.jobId })
      : null;

    if (existing) {
      // Update appliedAt if this is an auto-track from Apply button
      if (isAutoTrack && existing.status === "saved") {
        existing.status = status;
        existing.appliedAt = new Date();
        await existing.save();
        return res.json({ success: true, application: existing, updated: true });
      }
      return res.json({ success: true, application: existing, existing: true });
    }

    // Create new application record
    const application = await JobApplication.create({
      clientId,
      jobId: job.jobId || "",
      company: job.company,
      role: job.role,
      location: job.location || "",
      salary: job.salary || "",
      source: job.source || "",
      applyUrl: job.applyUrl || "",
      matchScore: job.matchScore ?? null,
      status,
      notes,
      appliedAt: new Date(),
    });

    res.status(201).json({ 
      success: true, 
      application,
      isAutoTrack,
      message: isAutoTrack ? "Application tracked" : undefined,
    });
  } catch (error) {
    console.error("createApplication error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

const updateApplication = async (req, res) => {
  try {
    const { clientId } = req.query;
    const { id } = req.params;
    const { status, notes } = req.body;

    const update = {};
    if (status && STATUSES.includes(status)) update.status = status;
    if (notes !== undefined) update.notes = notes;

    const application = await JobApplication.findOneAndUpdate(
      { _id: id, clientId },
      update,
      { new: true }
    );

    if (!application) {
      return res.status(404).json({
        success: false,
        message: "Application not found",
      });
    }

    res.json({ success: true, application });
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, message: error.message });
  }
};

const deleteApplication = async (req, res) => {
  try {
    const { clientId } = req.query;
    const { id } = req.params;

    await JobApplication.findOneAndDelete({ _id: id, clientId });
    res.json({ success: true });
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  getApplications,
  createApplication,
  updateApplication,
  deleteApplication,
};
