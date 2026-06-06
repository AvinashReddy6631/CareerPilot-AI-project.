
const mongoose = require("mongoose");

const resumeBuilderSchema =
  new mongoose.Schema(
    {
      name: {
        type: String,
        required: true,
      },

      email: {
        type: String,
        required: true,
      },

      phone: {
        type: String,
        required: true,
      },

      summary: {
        type: String,
        default: "",
      },

      education: {
        type: String,
        required: true,
      },

      experience: {
        type: String,
        required: true,
      },

      projects: {
        type: String,
        default: "",
      },

      skills: {
        type: String,
        required: true,
      },

      responsibilities: {
        type: String,
        default: "",
      },

      achievements: {
        type: String,
        default: "",
      },

      template: {
        type: String,
        default: "ATS Standard",
      },
    },
    {
      timestamps: true,
    }
  );

module.exports = mongoose.model(
  "ResumeBuilder",
  resumeBuilderSchema
);
