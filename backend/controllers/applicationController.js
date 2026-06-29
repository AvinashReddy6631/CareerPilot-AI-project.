const JobApplication = require("../models/JobApplication");
const { STATUSES } = require("../models/JobApplication");

const getApplications = async (req, res) => {
  try {
    const applications = await JobApplication.find({ user: req.user.id }).sort({
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
    const { job, status = "applied", notes = "" } = req.body;

    if (!job?.company || !job?.role) {
      return res.status(400).json({
        success: false,
        message: "company and role are required",
      });
    }

    const existing = job.jobId
      ? await JobApplication.findOne({ user: req.user.id, jobId: job.jobId })
      : null;

    if (existing) {
      return res.json({ success: true, application: existing, existing: true });
    }

    const application = await JobApplication.create({
      user: req.user.id,
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
    const { id } = req.params;
    const { status, notes } = req.body;

    const update = {};
    if (status && STATUSES.includes(status)) update.status = status;
    if (notes !== undefined) update.notes = notes;

    const application = await JobApplication.findOneAndUpdate(
      { _id: id, user: req.user.id },
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
