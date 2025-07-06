const express = require("express");
const router = express.Router();
const verifyToken = require("../middleware/authMiddleware");
const adminOnly = require("../middleware/adminOnly");

const {
  getAllUsers,
  getUnverifiedTechnicians,
  getAllBookings,
  deleteUser,
  adminLogin,
  addTechnician,
  getAllTechnicians,
  getTechnician,
  updateTechnician,
  deleteTechnician,
  toggleTechnicianVerification,
  getDashboardStats,
} = require("../controller/adminController");

// Admin authentication
router.post("/login", adminLogin);

// Dashboard stats
router.get("/stats", verifyToken, adminOnly, getDashboardStats);

// User management
router.get("/users", verifyToken, adminOnly, getAllUsers);
router.get("/unverified", verifyToken, adminOnly, getUnverifiedTechnicians);
router.get("/bookings", verifyToken, adminOnly, getAllBookings);
router.delete("/users/:id", verifyToken, adminOnly, deleteUser);

// Technician management (Admin only)
router.post("/technicians", addTechnician);
router.get("/technicians", verifyToken, adminOnly, getAllTechnicians);
router.get("/technicians/:id", verifyToken, adminOnly, getTechnician);
router.put("/technicians/:id", verifyToken, adminOnly, updateTechnician);
router.delete("/technicians/:id", verifyToken, adminOnly, deleteTechnician);
router.patch(
  "/technicians/:id/verify",
  verifyToken,
  adminOnly,
  toggleTechnicianVerification
);

module.exports = router;
