const mongoose = require("mongoose");

const jobListingSchema = new mongoose.Schema(
  {
    source: {
      type: String,
      enum: ["greenhouse", "lever"],
      required: true,
      index: true,
    },
    sourceKey: { type: String, required: true, index: true },
    externalId: { type: String, required: true },
    listingId: { type: String, required: true, unique: true, index: true },
    company: { type: String, required: true },
    role: { type: String, required: true },
    location: { type: String, default: "" },
    workplaceType: { type: String, default: "" },
    employmentType: { type: String, default: "" },
    salary: { type: String, default: "" },
    experience: { type: String, default: "" },
    type: { type: String, enum: ["job", "internship"], required: true, index: true },
    skills: { type: [String], default: [] },
    description: { type: String, default: "" },
    applyUrl: { type: String, required: true },
    publishedAt: { type: Date, default: null, index: true },
    sourceUpdatedAt: { type: Date, default: null },
    lastFetchedAt: { type: Date, required: true, index: true },
    lastSeenAt: { type: Date, required: true },
    status: { type: String, enum: ["active", "closed"], default: "active", index: true },
    closedAt: { type: Date, default: null },
  },
  { timestamps: true }
);

jobListingSchema.index({ sourceKey: 1, externalId: 1 }, { unique: true });
jobListingSchema.index({ status: 1, type: 1, publishedAt: -1, lastFetchedAt: -1 });

module.exports = mongoose.model("JobListing", jobListingSchema);
