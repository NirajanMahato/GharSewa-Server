const express = require("express");
const router = express.Router();
const {
  createBooking,
  getCustomerBookings,
  getTechnicianBookings,
  updateBookingStatus,
} = require("../controller/bookingController");
const verifyToken = require("../middleware/authMiddleware");
const technicianOnly = require("../middleware/technicianOnly");

router.post("/", verifyToken, createBooking); // Customer creates a booking
router.get("/customer", verifyToken, getCustomerBookings); // Fetch bookings for logged-in customer
router.get("/technician", verifyToken, getTechnicianBookings); // Technician gets assigned bookings
router.put("/:id/status", verifyToken, technicianOnly ,updateBookingStatus); // Technician updates booking status

module.exports = router;
