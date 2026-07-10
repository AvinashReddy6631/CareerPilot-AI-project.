const mongoose = require("mongoose");

const resumeWorkspaceSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    name: { type: String, required: true, trim: true, default: "Untitled Resume" },
    jobTitle: { type: String, default: "" },
    template: { type: String, default: "ATS Standard" },
    latestVersion: { type: Number, default: 0 },
    favorite: { type: Boolean, default: false },
    legacyResumeId: { type: mongoose.Schema.Types.ObjectId, ref: "ResumeBuilder", unique: true, sparse: true },
  },
  { timestamps: true }
);

resumeWorkspaceSchema.index({ user: 1, updatedAt: -1 });
resumeWorkspaceSchema.index({ user: 1, name: 1 });

module.exports = mongoose.model("ResumeWorkspace", resumeWorkspaceSchema);
