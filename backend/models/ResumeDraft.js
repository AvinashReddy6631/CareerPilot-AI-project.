const mongoose = require("mongoose");

const resumeDraftSchema = new mongoose.Schema(
  {
    workspace: { type: mongoose.Schema.Types.ObjectId, ref: "ResumeWorkspace", required: true, unique: true },
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    content: { type: mongoose.Schema.Types.Mixed, required: true },
    contentHash: { type: String, required: true },
  },
  { timestamps: true }
);

resumeDraftSchema.index({ user: 1, workspace: 1 });
module.exports = mongoose.model("ResumeDraft", resumeDraftSchema);
