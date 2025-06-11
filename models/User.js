const mongoose = require("mongoose");

const userSchema = mongoose.Schema(
  {
    fullName: { type: String, required: true, trim: true },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    phone: { type: String, required: true, unique: true },
    password: { type: String, required: true },

    // Common to all roles
    role: {
      type: String,
      enum: ["customer", "technician", "admin"],
      default: "customer",
    },
    profilePicture: { type: String },
    location: {
      type: {
        type: String,
        enum: ["Point"],
        default: "Point",
      },
      coordinates: {
        type: [Number], // [longitude, latitude]
        default: [0, 0],
      },
    },

    // Technician-specific fields
    companyName: { type: String },
    address: { type: String }, // companyAddress
    skills: {
      type: [String],
      enum: ["plumbing", "electricity", "lockwork", "heating"],
      default: [],
    },
    experience: { type: Number },
    verified: { type: Boolean, default: false },
    licenseFile: { type: String }, // license file upload (path or URL)
    preferredContactTime: {
      date: { type: String },
      hour: { type: String },
      minutes: { type: String },
    },
    termsAgreed: { type: Boolean, default: false },
    newsletter: { type: Boolean, default: false },

    // Customer-specific
    history: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Booking",
      },
    ],
  },
  {
    timestamps: true,
  }
);

// Enable geospatial search
userSchema.index({ location: "2dsphere" });

module.exports = mongoose.model("User", userSchema);
