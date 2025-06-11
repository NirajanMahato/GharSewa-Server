const User = require("../models/User");
const Booking = require("../models/Booking");

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

module.exports = {
  getAllUsers,
  getUnverifiedTechnicians,
  getAllBookings,
  deleteUser,
};
