const JobApplication = require("../models/JobApplication");
const { STATUSES } = require("../models/JobApplication");

const getApplications = async (req, res) => {
  try {
    const { clientId } = req.query;
    const userId = req.user._id;

    if (!clientId) {
      return res.status(400).json({
        success: false,
        message: "clientId is required",
      });
    }

    // Verify clientId belongs to authenticated user
    // clientId should match the userId in this implementation
    if (clientId !== userId.toString()) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to access these applications",
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
    res.status(500).json({ success: false, message: error.message });
  }
};

const createApplication = async (req, res) => {
  try {
    const { clientId, job, status = "applied", notes = "" } = req.body;

    if (!clientId || !job?.company || !job?.role) {
      return res.status(400).json({
        success: false,
        message: "clientId, company, and role are required",
      });
    }

    const existing = job.jobId
      ? await JobApplication.findOne({ clientId, jobId: job.jobId })
      : null;

    if (existing) {
      return res.json({ success: true, application: existing, existing: true });
    }

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

    res.status(201).json({ success: true, application });
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, message: error.message });
  }
};

const updateApplication = async (req, res) => {
  try {
    const { clientId } = req.query;
    const { id } = req.params;
    const { status, notes } = req.body;
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
        message: "Not authorized to update this application",
      });
    }

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
    res.status(500).json({ success: false, message: error.message });
  }
};

const deleteApplication = async (req, res) => {
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
        message: "Not authorized to delete this application",
      });
    }

    const deleted = await JobApplication.findOneAndDelete({ _id: id, clientId });
    
    if (!deleted) {
      return res.status(404).json({
        success: false,
        message: "Application not found",
      });
    }

    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  getApplications,
  createApplication,
  updateApplication,
  deleteApplication,
};
