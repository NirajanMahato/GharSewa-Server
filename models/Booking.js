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
      default: null,
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
      type: String,
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
    rejectedBy: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    notifiedTo: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    notifiedTechnicians: [
      { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    ], // up to 5
    currentTechnicianIndex: { type: Number, default: 0 },
    paymentStatus: {
      type: String,
      enum: ["pending", "paid"],
      default: "pending",
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Booking", bookingSchema);
