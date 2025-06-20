const express = require("express");
const router = express.Router();
const {
  createBooking,
  getCustomerBookings,
  getTechnicianBookings,
  updateBookingStatus,
  searchTechnician,
  notifyNextTechnician,
  getBookingById,
  getTechnicianIncome,
} = require("../controller/bookingController");
const verifyToken = require("../middleware/authMiddleware");
const technicianOnly = require("../middleware/technicianOnly");

router.post("/", verifyToken, createBooking);
router.get("/customer", verifyToken, getCustomerBookings);
router.get("/technician", verifyToken, getTechnicianBookings);
router.post("/search", verifyToken, searchTechnician);
router.put("/:id/status", verifyToken, technicianOnly, updateBookingStatus);
router.put("/:bookingId/notify-next", verifyToken, notifyNextTechnician);
router.get("/:id", verifyToken, getBookingById);
router.get("/income", verifyToken, technicianOnly, getTechnicianIncome);

module.exports = router;
