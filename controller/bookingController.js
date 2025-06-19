const Booking = require("../models/Booking");
const User = require("../models/User");

const searchTechnician = async (req, res) => {
  const { type, sub, location, searchType, coordinates } = req.body;

  try {
    if (
      !coordinates ||
      !Array.isArray(coordinates) ||
      coordinates.length !== 2 ||
      typeof coordinates[0] !== "number" ||
      typeof coordinates[1] !== "number"
    ) {
      return res.status(400).json({ message: "Invalid coordinates" });
    }

    const query = {
      role: "technician",
      verified: true,
      skills: type,
      location: {
        $near: {
          $geometry: {
            type: "Point",
            coordinates, // [lng, lat]
          },
          $maxDistance: searchType === "rapid" ? 5000 : 15000,
        },
      },
    };

    const technicians = await User.find(query);

    if (!technicians.length) {
      return res.json({
        success: false,
        message: "No technician found nearby.",
      });
    }

    const selected =
      technicians[Math.floor(Math.random() * technicians.length)];

    const newBooking = new Booking({
      customer: req.user.id,
      technician: selected._id,
      serviceType: type,
      subProblem: sub,
      location,
      searchType,
      status: "pending",
      createdAt: new Date(),
    });

    await newBooking.save();

    return res.json({ success: true, bookingId: newBooking._id });
  } catch (err) {
    console.error("Search error:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

const notifyNextTechnician = async (req, res) => {
  const { bookingId } = req.params;

  try {
    const booking = await Booking.findById(bookingId);
    if (!booking) return res.status(404).json({ message: "Booking not found" });

    const technicians = await User.find({
      role: "technician",
      verified: true,
      skills: booking.serviceType,
      location: {
        $near: {
          $geometry: {
            type: "Point",
            coordinates: booking.location.coordinates,
          },
          $maxDistance: 10000, // 10 km
        },
      },
      _id: { $nin: booking.rejectedBy || [] },
    });

    if (!technicians.length) {
      return res
        .status(200)
        .json({ success: false, message: "No more technicians available" });
    }

    const nextTech = technicians[0]; // prioritize closest
    booking.notifiedTo = nextTech._id;
    await booking.save();

    // Mock sending notification
    console.log(`Notification sent to technician: ${nextTech.email}`);

    return res.status(200).json({ success: true, technician: nextTech });
  } catch (error) {
    console.error("notifyNextTechnician error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

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
      latitude,
      longitude, // from frontend if available
    } = req.body;

    const customerId = req.user.id;

    // Step 1: Find nearest verified technician matching serviceType
    const nearbyTechnician = await User.findOne({
      role: "technician",
      verified: true,
      skills: serviceType, // checks if serviceType is in skills[]
      location: {
        $near: {
          $geometry: {
            type: "Point",
            coordinates: [longitude, latitude],
          },
          $maxDistance: 10000, // 10 km range, adjust as needed
        },
      },
    });

    const booking = new Booking({
      customer: customerId,
      technician: nearbyTechnician?._id || null,
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
      message: nearbyTechnician
        ? "Booking submitted and assigned to a technician"
        : "Booking submitted (technician will be assigned soon)",
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
  searchTechnician,
  createBooking,
  getCustomerBookings,
  getTechnicianBookings,
  updateBookingStatus,
  notifyNextTechnician,
};
