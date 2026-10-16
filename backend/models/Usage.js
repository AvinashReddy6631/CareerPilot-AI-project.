const mongoose = require("mongoose");

const usageSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
      index: true,
    },

    // Lifetime AI interview trial
    // Lifetime AI interview usage
        aiInterviewUsed: {
          type: Number,
          default: 0,
          min: 0,
        },

    // Application quota usage for the current billing period
    applicationUsage: {
      count: {
        type: Number,
        default: 0,
      },

      periodStart: {
        type: Date,
        default: null,
      },

      periodEnd: {
        type: Date,
        default: null,
      },
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Usage", usageSchema);