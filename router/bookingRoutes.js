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

router.post("/", verifyToken, createBooking);
router.get("/customer", verifyToken, getCustomerBookings);
router.get("/technician", verifyToken, getTechnicianBookings);
router.put("/:id/status", verifyToken, technicianOnly ,updateBookingStatus);

module.exports = router;
