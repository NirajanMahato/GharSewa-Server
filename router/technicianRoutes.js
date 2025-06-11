const express = require("express");
const router = express.Router();
const {
  registerTechnician,
  verifyTechnician,
  getVerifiedTechnicians,
} = require("../controller/technicianController");

const verifyToken = require("../middleware/authMiddleware");
const adminOnly = require("../middleware/adminOnly");

router.post("/register", registerTechnician);
router.put("/verify/:technicianId", verifyToken, adminOnly, verifyTechnician);
router.get("/", getVerifiedTechnicians);

module.exports = router;
