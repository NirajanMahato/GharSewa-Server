const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const User = require("../models/User");
require("dotenv").config();

const createAdmin = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("Connected to MongoDB");

    // Check if admin already exists
    const existingAdmin = await User.findOne({ email: "admin@gharsewa.com" });
    if (existingAdmin) {
      console.log("Admin user already exists");
      process.exit(0);
    }

    // Hash password
    const hashedPassword = await bcrypt.hash("admin123", 12);

    // Create admin user
    const admin = new User({
      fullName: "Admin User",
      email: "admin@gharsewa.com",
      phone: "1234567890",
      password: hashedPassword,
      role: "admin",
      verified: true,
    });

    await admin.save();
    console.log("Admin user created successfully!");
    console.log("Email: admin@gharsewa.com");
    console.log("Password: admin123");
  } catch (error) {
    console.error("Error creating admin:", error);
  } finally {
    await mongoose.disconnect();
    process.exit(0);
  }
};

createAdmin();
