const mongoose = require("mongoose");

const serviceSchema = mongoose.Schema(
  {
    customer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    technician: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    serviceType: {
      type: String,
      required: true,
    },
    description: {
      type: String,
    },
    status: {
      type: String,
      enum: ["pending", "accepted", "in_progress", "completed", "cancelled"],
      default: "pending",
    },
    scheduledDate: {
      type: Date,
    },
    completedDate: {
      type: Date,
    },
    price: {
      type: Number,
      required: true,
    },
    customerRating: {
      type: Number,
      min: 1,
      max: 5,
    },
    customerReview: {
      type: String,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Service", serviceSchema);
