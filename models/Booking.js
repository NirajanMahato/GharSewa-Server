const mongoose = require("mongoose");

const bookingSchema = mongoose.Schema(
  {
    customer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    technician: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null, // can be null initially
    },
    serviceType: {
      type: String,
      required: true,
      enum: ["plumbing", "electricity", "lockwork", "heating"],
    },
    problemType: {
      type: String,
      required: true,
    },
    customProblem: {
      type: String, // only if problemType is "Other"
    },
    estimatedCost: {
      type: Number,
      required: true,
    },
    address: {
      type: String,
      required: true,
    },
    preferredDate: {
      type: String,
      required: true,
    },
    preferredTime: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      enum: ["pending", "accepted", "rejected", "completed"],
      default: "pending",
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Booking", bookingSchema);
