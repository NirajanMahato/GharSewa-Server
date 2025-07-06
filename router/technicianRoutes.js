const express = require("express");
const router = express.Router();
const {
  verifyTechnician,
  getVerifiedTechnicians,
  getAllTechnicians,
} = require("../controller/technicianController");

const verifyToken = require("../middleware/authMiddleware");
const adminOnly = require("../middleware/adminOnly");
router.get("/all", verifyToken, adminOnly, getAllTechnicians);
router.put("/verify/:technicianId", verifyToken, adminOnly, verifyTechnician);
router.get("/", getVerifiedTechnicians);

module.exports = router;
