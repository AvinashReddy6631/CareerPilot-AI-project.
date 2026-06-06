const mongoose = require("mongoose");

const savedJobSchema = new mongoose.Schema(
  {
    clientId: { type: String, required: true, index: true },
    jobId: { type: String, required: true },
    source: String,
    company: String,
    role: String,
    location: String,
    salary: String,
    type: { type: String, enum: ["job", "internship"] },
    applyUrl: String,
    matchScore: Number,
    description: String,
    skills: [String],
  },
  { timestamps: true }
);

savedJobSchema.index({ clientId: 1, jobId: 1 }, { unique: true });

module.exports = mongoose.model("SavedJob", savedJobSchema);
