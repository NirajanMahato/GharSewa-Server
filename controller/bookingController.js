const Booking = require("../models/Booking");
const User = require("../models/User");

const createBooking = async (req, res) => {
  try {
    const {
      serviceType,
      problemType,
      customProblem,
      estimatedCost,
      address,
      preferredDate,
      preferredTime,
    } = req.body;

    // Get customer ID from token
    const customerId = req.user.id;

    // Optional: Validate fields
    if (
      !serviceType ||
      !problemType ||
      !estimatedCost ||
      !address ||
      !preferredDate ||
      !preferredTime
    ) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    const booking = new Booking({
      customer: customerId,
      serviceType,
      problemType,
      customProblem: problemType === "Other" ? customProblem : null,
      estimatedCost,
      address,
      preferredDate,
      preferredTime,
      status: "pending",
    });

    const savedBooking = await booking.save();

    res.status(201).json({
      message: "Booking request submitted successfully",
      data: savedBooking,
    });
  } catch (error) {
    console.error("Booking error:", error);
    res.status(500).json({ message: "Server error", error });
  }
};

const getCustomerBookings = async (req, res) => {
  try {
    const customerId = req.user.id;

    const bookings = await Booking.find({ customer: customerId })
      .populate("technician", "fullName email phone")
      .sort({ createdAt: -1 });

    res.status(200).json(bookings);
  } catch (error) {
    console.error("Fetch customer bookings error:", error);
    res.status(500).json({ message: "Server error", error });
  }
};

const getTechnicianBookings = async (req, res) => {
  try {
    const technicianId = req.user.id;

    const bookings = await Booking.find({ technician: technicianId })
      .populate("customer", "fullName email phone")
      .sort({ createdAt: -1 });

    res.status(200).json(bookings);
  } catch (error) {
    console.error("Fetch technician bookings error:", error);
    res.status(500).json({ message: "Server error", error });
  }
};

const updateBookingStatus = async (req, res) => {
  try {
    const technicianId = req.user.id;
    const { id } = req.params;
    const { status } = req.body;

    // Only these values are allowed
    const validStatuses = ["accepted", "rejected", "completed"];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ message: "Invalid status value" });
    }

    // Find the booking
    const booking = await Booking.findById(id);
    if (!booking) {
      return res.status(404).json({ message: "Booking not found" });
    }

    // Technician can only update their own bookings
    if (booking.technician?.toString() !== technicianId) {
      return res.status(403).json({ message: "Unauthorized access" });
    }

    booking.status = status;
    await booking.save();

    res.status(200).json({
      message: `Booking ${status} successfully`,
      booking,
    });
  } catch (error) {
    console.error("Update booking status error:", error);
    res.status(500).json({ message: "Server error", error });
  }
};

module.exports = {
  createBooking,
  getCustomerBookings,
  getTechnicianBookings,
  updateBookingStatus,
};
