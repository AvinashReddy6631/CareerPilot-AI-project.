const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },

    email: {
      type: String,
      required: true,
      unique: true,
    },

    password: {
      type: String,
      required: true,
    },

    college: {
      type: String,
      default: "",
    },

    degree: {
      type: String,
      default: "",
    },

    branch: {
      type: String,
      default: "",
    },

    graduationYear: {
      type: String,
      default: "",
    },

    skills: {
      type: [String],
      default: [],
    },

    targetRole: {
      type: String,
      default: "",
    },

    profileCompletion: {
      type: Number,
      default: 0,
    },

    // WEEK-2
    resumeScore: {
      type: Number,
      default: 0,
    },

    atsScore: {
      type: Number,
      default: 0,
    },

    interviewReadiness: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

module.exports =
  mongoose.model(
    "User",
    userSchema
  );