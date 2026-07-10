const mongoose = require("mongoose");

const resumeVersionSchema = new mongoose.Schema(
  {
    workspace: { type: mongoose.Schema.Types.ObjectId, ref: "ResumeWorkspace", required: true, index: true },
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    version: { type: Number, required: true },
    name: { type: String, required: true },
    jobTitle: { type: String, default: "" },
    template: { type: String, default: "ATS Standard" },
    completion: { type: Number, default: 0 },
    atsScore: { type: Number, default: null },
    content: { type: mongoose.Schema.Types.Mixed, required: true },
    contentHash: { type: String, required: true },
  },
  { timestamps: true }
);

resumeVersionSchema.index({ workspace: 1, version: -1 }, { unique: true });
resumeVersionSchema.index({ user: 1, workspace: 1, createdAt: -1 });
module.exports = mongoose.model("ResumeVersion", resumeVersionSchema);
