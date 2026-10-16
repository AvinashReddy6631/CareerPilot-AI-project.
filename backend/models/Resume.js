const mongoose = require("mongoose");

const resumeSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },

    fileName: String,

    resumeText: String,

    atsScore: Number,

    skills: [String],

    missingKeywords: [String],
  },
  {
    timestamps: true,
  }
);

resumeSchema.index({ user: 1, createdAt: 1 });

module.exports = mongoose.model(
  "Resume",
  resumeSchema
);
