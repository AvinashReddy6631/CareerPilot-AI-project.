const mongoose = require("mongoose");

const dsaProgressSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    topicId: {
      type: String,
      required: true,
      trim: true,
    },
    completed: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

dsaProgressSchema.index({ user: 1, topicId: 1 }, { unique: true });

module.exports = mongoose.model("DsaProgress", dsaProgressSchema);
