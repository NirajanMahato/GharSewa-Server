const User = require("../models/User");
const Booking = require("../models/Booking");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

// All users
const getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select("-password");
    res.status(200).json(users);
  } catch (error) {
    res.status(500).json({ message: "Error fetching users", error });
  }
};

// Unverified technicians
const getUnverifiedTechnicians = async (req, res) => {
  try {
    const technicians = await User.find({
      role: "technician",
      verified: false,
    }).select("-password");
    res.status(200).json(technicians);
  } catch (error) {
    res.status(500).json({ message: "Error fetching technicians", error });
  }
};

// All bookings (optional filter)
const getAllBookings = async (req, res) => {
  try {
    const statusFilter = req.query.status;

    const filter = statusFilter ? { status: statusFilter } : {};

    const bookings = await Booking.find(filter)
      .populate("customer", "fullName email")
      .populate("technician", "fullName email")
      .sort({ createdAt: -1 });

    res.status(200).json(bookings);
  } catch (error) {
    res.status(500).json({ message: "Error fetching bookings", error });
  }
};

// Delete user (optional)
const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await User.findByIdAndDelete(id);
    if (!deleted) {
      return res.status(404).json({ message: "User not found" });
    }
    res.status(200).json({ message: "User deleted", user: deleted });
  } catch (error) {
    res.status(500).json({ message: "Error deleting user", error });
  }
};

// Admin Login
const adminLogin = async (req, res) => {
  try {
    const { email, password } = req.body;

    const admin = await User.findOne({ email, role: "admin" });
    if (!admin) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const isPasswordValid = await bcrypt.compare(password, admin.password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const token = jwt.sign(
      { userId: admin._id, role: admin.role },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.json({
      message: "Admin login successful",
      token,
      user: {
        id: admin._id,
        fullName: admin.fullName,
        email: admin.email,
        role: admin.role,
      },
    });
  } catch (error) {
    console.error("Admin login error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Add new technician (Admin only)
const addTechnician = async (req, res) => {
  try {
    const {
      fullName,
      email,
      phone,
      password,
      companyName,
      address,
      skills,
      experience,
    } = req.body;

    const existingUser = await User.findOne({
      $or: [{ email }, { phone }],
    });
    if (existingUser) {
      return res.status(400).json({
        message: "User with this email or phone already exists",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    const technician = new User({
      fullName,
      email,
      phone,
      password: hashedPassword,
      role: "technician",
      companyName,
      address,
      skills: skills || [],
      experience: experience || 0,
      verified: true,
      termsAgreed: true,
    });

    await technician.save();

    res.status(201).json({
      message: "Technician added successfully",
      technician: {
        id: technician._id,
        fullName: technician.fullName,
        email: technician.email,
        phone: technician.phone,
        companyName: technician.companyName,
        skills: technician.skills,
        verified: technician.verified,
      },
    });
  } catch (error) {
    console.error("Add technician error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Get all technicians
const getAllTechnicians = async (req, res) => {
  try {
    const technicians = await User.find({ role: "technician" })
      .select("-password")
      .sort({ createdAt: -1 });

    res.json({
      technicians,
      total: technicians.length,
    });
  } catch (error) {
    console.error("Get technicians error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Get single technician
const getTechnician = async (req, res) => {
  try {
    const { id } = req.params;
    const technician = await User.findOne({
      _id: id,
      role: "technician",
    }).select("-password");

    if (!technician) {
      return res.status(404).json({ message: "Technician not found" });
    }

    res.json({ technician });
  } catch (error) {
    console.error("Get technician error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Update technician
const updateTechnician = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    delete updateData.password;
    delete updateData.role;
    delete updateData.email;

    const technician = await User.findByIdAndUpdate(
      id,
      { $set: updateData },
      { new: true, runValidators: true }
    ).select("-password");

    if (!technician) {
      return res.status(404).json({ message: "Technician not found" });
    }

    res.json({
      message: "Technician updated successfully",
      technician,
    });
  } catch (error) {
    console.error("Update technician error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Delete technician
const deleteTechnician = async (req, res) => {
  try {
    const { id } = req.params;
    const technician = await User.findByIdAndDelete(id);

    if (!technician) {
      return res.status(404).json({ message: "Technician not found" });
    }

    res.json({ message: "Technician deleted successfully" });
  } catch (error) {
    console.error("Delete technician error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Toggle technician verification status
const toggleTechnicianVerification = async (req, res) => {
  try {
    const { id } = req.params;
    const technician = await User.findById(id);

    if (!technician) {
      return res.status(404).json({ message: "Technician not found" });
    }

    technician.verified = !technician.verified;
    await technician.save();

    res.json({
      message: `Technician ${
        technician.verified ? "verified" : "unverified"
      } successfully`,
      verified: technician.verified,
    });
  } catch (error) {
    console.error("Toggle verification error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Get dashboard statistics
const getDashboardStats = async (req, res) => {
  try {
    const totalTechnicians = await User.countDocuments({ role: "technician" });
    const verifiedTechnicians = await User.countDocuments({
      role: "technician",
      verified: true,
    });
    const pendingTechnicians = await User.countDocuments({
      role: "technician",
      verified: false,
    });

    const Booking = require("../models/Booking");
    const totalBookings = await Booking.countDocuments();
    const pendingBookings = await Booking.countDocuments({ status: "pending" });
    const completedBookings = await Booking.countDocuments({
      status: "completed",
    });
    const totalRevenue = await Booking.aggregate([
      { $match: { status: "completed" } },
      { $group: { _id: null, total: { $sum: "$estimatedCost" } } },
    ]);

    res.json({
      totalTechnicians,
      verifiedTechnicians,
      pendingTechnicians,
      totalBookings,
      pendingBookings,
      completedBookings,
      totalRevenue: totalRevenue[0]?.total || 0,
    });
  } catch (error) {
    console.error("Get dashboard stats error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

module.exports = {
  getAllUsers,
  getUnverifiedTechnicians,
  getAllBookings,
  deleteUser,
  adminLogin,
  addTechnician,
  getAllTechnicians,
  getTechnician,
  updateTechnician,
  deleteTechnician,
  toggleTechnicianVerification,
  getDashboardStats,
};
