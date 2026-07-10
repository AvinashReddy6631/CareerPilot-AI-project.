const mongoose = require("mongoose");

const STATUSES = ["saved", "applied", "screening", "interview", "offer", "rejected"];

const jobApplicationSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    clientId: { type: String, default: "" },
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

// A job can be tracked once per user. The partial index keeps legacy records
// without a job id out of the uniqueness constraint.
jobApplicationSchema.index(
  { user: 1, jobId: 1 },
  {
    unique: true,
    partialFilterExpression: { jobId: { $type: "string", $gt: "" } },
  }
);

module.exports = mongoose.model("JobApplication", jobApplicationSchema);
module.exports.STATUSES = STATUSES;
