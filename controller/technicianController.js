const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const nodemailer = require("nodemailer");

// Register Technician
const registerTechnician = async (req, res) => {
  try {
    const {
      fullName,
      email,
      phone,
      password,
      companyName,
      address,
      preferredDate,
      preferredHour,
      preferredMinutes,
      termsAgreed,
      newsletter,
    } = req.body;

    const licenseFile = req.file?.filename || "";

    // Check for existing user
    const existingUser = await User.findOne({ $or: [{ email }, { phone }] });
    if (existingUser) {
      return res.status(400).json({ message: "Email or phone already exists" });
    }

    // Validate password
    if (!password || password.length < 6) {
      return res
        .status(400)
        .json({ message: "Password must be at least 6 characters" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const technicianData = {
      fullName,
      email,
      phone,
      password: hashedPassword,
      role: "technician",
      companyName,
      address,
      licenseFile, // will save just the file name
      verified: false,
      termsAgreed: termsAgreed || false,
      newsletter: newsletter || false,
      preferredContactTime: {
        date: preferredDate,
        hour: preferredHour,
        minutes: preferredMinutes,
      },
      location: {
        type: "Point",
        coordinates: [0, 0], // Will update later
      },
    };

    const newTechnician = new User(technicianData);
    const data = await newTechnician.save();

    res.status(201).json({
      message: "Technician registered successfully",
      data,
    });
  } catch (error) {
    console.error("Register Technician Error:", error);
    res.status(500).json({ message: "Internal Server Error", error });
  }
};

const verifyTechnician = async (req, res) => {
  try {
    const technicianId = req.params.technicianId;

    // Check if current user is admin
    if (req.user.role !== "admin") {
      return res.status(403).json({ message: "Access denied. Admins only." });
    }

    const technician = await User.findById(technicianId);
    if (!technician || technician.role !== "technician") {
      return res.status(404).json({ message: "Technician not found" });
    }

    technician.verified = true;
    await technician.save();

    res
      .status(200)
      .json({ message: "Technician verified successfully", technician });
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};

const getVerifiedTechnicians = async (req, res) => {
  try {
    const technicians = await User.find({
      role: "technician",
      verified: true,
    }).select("-password");
    res.status(200).json(technicians);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch technicians", error });
  }
};

module.exports = {
  registerTechnician,
  verifyTechnician,
  getVerifiedTechnicians,
};
