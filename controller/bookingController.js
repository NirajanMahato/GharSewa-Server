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
        },
      },
    };

    const technicians = await User.find(query).limit(5);

    if (!technicians.length) {
      return res.json({
        success: false,
        message: "No technician found nearby.",
      });
    }

    if (searchType === "rapid") {
      const notifiedTechnicians = technicians.map((t) => t._id);
      const newBooking = new Booking({
        customer: req.user.id,
        serviceType: type,
        subProblem: sub,
        location,
        searchType,
        status: "pending",
        notifiedTechnicians,
        currentTechnicianIndex: 0,
        rejectedBy: [],
        createdAt: new Date(),
      });
      await newBooking.save();
      return res.json({
        success: true,
        bookingId: newBooking._id,
        notifiedTechnicians,
      });
    } else {
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
    }
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

// Direct booking from home page
const createDirectBooking = async (req, res) => {
  try {
    const {
      technicianId,
      scheduledDate,
      scheduledTime,
      address,
      description,
      serviceType,
    } = req.body;

    if (!technicianId || !scheduledDate || !scheduledTime || !address) {
      return res.status(400).json({
        message: "Missing required fields",
      });
    }

    const technician = await User.findById(technicianId);
    if (!technician || technician.role !== "technician") {
      return res.status(404).json({
        message: "Technician not found",
      });
    }

    if (!technician.verified) {
      return res.status(400).json({
        message: "Technician is not verified",
      });
    }

    const booking = new Booking({
      customer: req.user.id,
      technician: technicianId,
      serviceType: serviceType || technician.skills[0] || "plumbing",
      problemType: description || "General Service",
      customProblem: description,
      estimatedCost: 0, // Default cost, can be updated later
      address,
      preferredDate: scheduledDate,
      preferredTime: scheduledTime,
      status: "pending",
      paymentStatus: "pending",
    });

    await booking.save();

    const customer = await User.findById(req.user.id);
    if (customer) {
      customer.history.push(booking._id);
      await customer.save();
    }

    const io = req.app.get("io");
    if (io) {
      io.to(technicianId.toString()).emit("new_booking", {
        type: "new_booking",
        booking: {
          id: booking._id,
          customer: {
            id: req.user.id,
            fullName: req.user.fullName,
            email: req.user.email,
          },
          serviceType: booking.serviceType,
          scheduledDate: booking.scheduledDate,
          scheduledTime: booking.scheduledTime,
          address: booking.address,
          description: booking.description,
        },
        message: "You have a new booking request!",
      });
    }

    console.log(
      `New booking notification sent to technician: ${technician.email}`
    );

    res.status(201).json({
      message: "Booking created successfully",
      booking: {
        id: booking._id,
        customer: {
          id: req.user.id,
          fullName: req.user.fullName,
          email: req.user.email,
        },
        technician: {
          id: technician._id,
          fullName: technician.fullName,
          email: technician.email,
        },
        serviceType: booking.serviceType,
        status: booking.status,
        estimatedCost: booking.estimatedCost,
        address: booking.address,
        createdAt: booking.createdAt,
      },
    });
  } catch (error) {
    console.error("Create booking error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

const getAllBookings = async (req, res) => {
  try {
    const bookings = await Booking.find()
      .populate("customer", "fullName email phone")
      .populate("technician", "fullName email phone companyName")
      .sort({ createdAt: -1 });

    res.json({
      bookings,
      total: bookings.length,
    });
  } catch (error) {
    console.error("Get bookings error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

const getCustomerBookings = async (req, res) => {
  try {
    const { customerId } = req.params;

    const bookings = await Booking.find({ customer: customerId })
      .populate("technician", "fullName email phone companyName")
      .sort({ createdAt: -1 });

    res.json({
      bookings,
      total: bookings.length,
    });
  } catch (error) {
    console.error("Get customer bookings error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

const getTechnicianBookings = async (req, res) => {
  try {
    const { technicianId } = req.params;

    const bookings = await Booking.find({ technician: technicianId })
      .populate("customer", "fullName email phone")
      .sort({ createdAt: -1 });

    res.json({
      bookings,
      total: bookings.length,
    });
  } catch (error) {
    console.error("Get technician bookings error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

const updateBookingStatus = async (req, res) => {
  try {
    const { bookingId } = req.params;
    const { status } = req.body;

    const validStatuses = ["pending", "accepted", "rejected", "completed"];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        message: "Invalid status",
      });
    }

    const booking = await Booking.findByIdAndUpdate(
      bookingId,
      { status },
      { new: true }
    ).populate("customer technician");

    if (!booking) {
      return res.status(404).json({
        message: "Booking not found",
      });
    }

    res.json({
      message: "Booking status updated successfully",
      booking,
    });
  } catch (error) {
    console.error("Update booking status error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

const getBookingById = async (req, res) => {
  try {
    const { bookingId } = req.params;

    const booking = await Booking.findById(bookingId)
      .populate("customer", "fullName email phone")
      .populate("technician", "fullName email phone companyName skills");

    if (!booking) {
      return res.status(404).json({
        message: "Booking not found",
      });
    }

    res.json({ booking });
  } catch (error) {
    console.error("Get booking error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

const deleteBooking = async (req, res) => {
  try {
    const { bookingId } = req.params;

    const booking = await Booking.findByIdAndDelete(bookingId);

    if (!booking) {
      return res.status(404).json({
        message: "Booking not found",
      });
    }

    res.json({
      message: "Booking deleted successfully",
    });
  } catch (error) {
    console.error("Delete booking error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

const getBookingStats = async (req, res) => {
  try {
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
      totalBookings,
      pendingBookings,
      completedBookings,
      totalRevenue: totalRevenue[0]?.total || 0,
    });
  } catch (error) {
    console.error("Get booking stats error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

const updateBookingCost = async (req, res) => {
  try {
    const { bookingId } = req.params;
    const { estimatedCost } = req.body;

    if (!estimatedCost || estimatedCost <= 0) {
      return res.status(400).json({
        message: "Invalid cost amount",
      });
    }

    const booking = await Booking.findByIdAndUpdate(
      bookingId,
      { estimatedCost },
      { new: true }
    ).populate("customer technician");

    if (!booking) {
      return res.status(404).json({
        message: "Booking not found",
      });
    }

    res.json({
      message: "Booking cost updated successfully",
      booking,
    });
  } catch (error) {
    console.error("Update booking cost error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

module.exports = {
  searchTechnician,
  createDirectBooking,
  getAllBookings,
  getCustomerBookings,
  getTechnicianBookings,
  updateBookingStatus,
  updateBookingCost,
  notifyNextTechnician,
  getBookingById,
  deleteBooking,
  getBookingStats,
};
