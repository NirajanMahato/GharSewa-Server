const express = require("express");
const router = express.Router();
const {
  createDirectBooking,
  getAllBookings,
  getCustomerBookings,
  getTechnicianBookings,
  updateBookingStatus,
  updateBookingCost,
  getBookingById,
  deleteBooking,
  getBookingStats,
} = require("../controller/bookingController");
const verifyToken = require("../middleware/authMiddleware");
const adminOnly = require("../middleware/adminOnly");

// Public routes (for customers)
router.post("/", verifyToken, createDirectBooking);

// Admin routes
router.get("/", verifyToken, adminOnly, getAllBookings);
router.get("/stats", verifyToken, adminOnly, getBookingStats);
router.delete("/:bookingId", verifyToken, adminOnly, deleteBooking);

// Customer routes
router.get("/customer/:customerId", verifyToken, getCustomerBookings);

// Technician routes
router.get("/technician/:technicianId", verifyToken, getTechnicianBookings);

// Booking management routes
router.get("/:bookingId", verifyToken, getBookingById);
router.put("/:bookingId/status", verifyToken, updateBookingStatus);
router.put("/:bookingId/cost", verifyToken, updateBookingCost);

module.exports = router;
