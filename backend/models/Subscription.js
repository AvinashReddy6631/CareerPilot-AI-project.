const mongoose = require("mongoose");

const subscriptionSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
      index: true,
    },

    plan: {
      type: String,
      enum: ["FREE", "BASIC", "PRO", "PREMIUM"],
      default: "FREE",
      required: true,
    },

    status: {
      type: String,
      enum: [
        "active",
        "authenticated",
        "created",
        "pending",
        "halted",
        "paused",
        "resumed",
        "cancelled",
        "completed",
        "expired",
        "past_due",
      ],
      default: "active",
    },

    razorpayPlanId: {
      type: String,
      default: null,
    },

    razorpaySubscriptionId: {
      type: String,
      default: null,
      index: true,
    },

    currentPeriodStart: {
      type: Date,
      default: null,
    },

    currentPeriodEnd: {
      type: Date,
      default: null,
    },

    cancelAtPeriodEnd: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model(
  "Subscription",
  subscriptionSchema
);