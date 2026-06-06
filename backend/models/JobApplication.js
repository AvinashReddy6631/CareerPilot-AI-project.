const mongoose = require("mongoose");

const STATUSES = ["saved", "applied", "screening", "interview", "offer", "rejected"];

const jobApplicationSchema = new mongoose.Schema(
  {
    clientId: { type: String, required: true, index: true },
    jobId: { type: String, default: "" },
    company: { type: String, required: true },
    role: { type: String, required: true },
    location: { type: String, default: "" },
    salary: { type: String, default: "" },
    source: { type: String, default: "" },
    applyUrl: { type: String, default: "" },
    matchScore: { type: Number, default: null },
    status: {
      type: String,
      enum: STATUSES,
      default: "applied",
    },
    notes: { type: String, default: "" },
    appliedAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

module.exports = mongoose.model("JobApplication", jobApplicationSchema);
module.exports.STATUSES = STATUSES;
