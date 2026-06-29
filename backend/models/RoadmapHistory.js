const mongoose = require("mongoose");

const roadmapHistorySchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    role: {
      type: String,
      required: true,
    },
    stagesCount: {
      type: Number,
      default: 0,
    },
    estimatedMonths: {
      type: Number,
      default: 0,
    },
    jobReadinessMonth: {
      type: Number,
      default: 0,
    },
    milestones: {
      type: [String],
      default: [],
    },
    roadmap: {
      type: [String],
      default: [],
    },
    stages: {
      type: [mongoose.Schema.Types.Mixed],
      default: [],
    },
    meta: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("RoadmapHistory", roadmapHistorySchema);
