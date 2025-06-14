const express = require("express");
const router = express.Router();
const verifyToken = require("../middleware/authMiddleware");
const adminOnly = require("../middleware/adminOnly");

const {
  getAllUsers,
  getUnverifiedTechnicians,
  getAllBookings,
  deleteUser,
} = require("../controller/adminController");

router.get("/users", verifyToken, adminOnly, getAllUsers);
router.get("/unverified", verifyToken, adminOnly, getUnverifiedTechnicians);
router.get("/bookings", verifyToken, adminOnly, getAllBookings);
router.delete("/users/:id", verifyToken, adminOnly, deleteUser);

module.exports = router;
