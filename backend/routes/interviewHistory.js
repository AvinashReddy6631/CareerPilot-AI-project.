const mongoose = require("mongoose");

const interviewHistorySchema =
  new mongoose.Schema(
    {
      role: {
        type: String,
        required: true,
      },

      averageScore: {
        type: Number,
        required: true,
      },

      strengths: {
        type: [String],
        default: [],
      },

      weaknesses: {
        type: [String],
        default: [],
      },

      recommendation: {
        type: String,
        default: "",
      },
    },
    {
      timestamps: true,
    }
  );

module.exports = mongoose.model(
  "InterviewHistory",
  interviewHistorySchema
);