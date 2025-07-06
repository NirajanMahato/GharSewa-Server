const express = require("express");
const router = express.Router();
const {
  createDirectBooking,
  getAllBookings,
  getCustomerBookings,
  getTechnicianBookings,
  updateBookingStatus,
  getBookingById,
  deleteBooking,
  getBookingStats,
} = require("../controller/bookingController");
const verifyToken = require("../middleware/authMiddleware");
const adminOnly = require("../middleware/adminOnly");

// Public routes (for customers)
router.post("/", verifyToken, createDirectBooking);
router.get("/customer/:customerId", getCustomerBookings);
router.get("/technician/:technicianId", getTechnicianBookings);
router.get("/:bookingId", getBookingById);

// Protected routes
router.put("/:bookingId/status", verifyToken, updateBookingStatus);

// Admin routes
router.get("/admin/all", verifyToken, adminOnly, getAllBookings);
router.delete("/admin/:bookingId", verifyToken, adminOnly, deleteBooking);
router.get("/admin/stats", verifyToken, adminOnly, getBookingStats);

module.exports = router;
