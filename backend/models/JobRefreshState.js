const mongoose = require("mongoose");

const sourceStatusSchema = new mongoose.Schema(
  {
    sourceKey: { type: String, required: true },
    source: { type: String, required: true },
    label: { type: String, required: true },
    status: { type: String, enum: ["success", "failed"], required: true },
    lastAttemptAt: { type: Date, required: true },
    lastSuccessAt: { type: Date, default: null },
    listingsFetched: { type: Number, default: 0 },
    message: { type: String, default: "" },
  },
  { _id: false }
);

const jobRefreshStateSchema = new mongoose.Schema(
  {
    _id: { type: String, required: true },
    lockUntil: { type: Date, default: null },
    lastAttemptAt: { type: Date, default: null },
    lastSuccessfulRefreshAt: { type: Date, default: null },
    sourceStatuses: { type: [sourceStatusSchema], default: [] },
  },
  { timestamps: true }
);

module.exports = mongoose.model("JobRefreshState", jobRefreshStateSchema);
