const mongoose = require("mongoose");

const savedJobSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    clientId: { type: String, default: "" },
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

savedJobSchema.index({ user: 1, jobId: 1 }, { unique: true });

module.exports = mongoose.model("SavedJob", savedJobSchema);
