const mongoose = require("mongoose");

const interviewHistorySchema =
  new mongoose.Schema(
    {
      user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },

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

      recommendations: {
        type: [String],
        default: [],
      },

      averageCommunication: {
        type: Number,
        default: 0,
      },

      averageConfidence: {
        type: Number,
        default: 0,
      },

      grade: {
        type: String,
        default: "",
      },

      summary: {
        type: String,
        default: "",
      },

      recommendation: {
        type: String,
        default: "",
      },

      interviewDate: {
        type: Date,
        default: Date.now,
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