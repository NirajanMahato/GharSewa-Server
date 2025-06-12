const express = require("express");
const router = express.Router();
const {
  registerTechnician,
  verifyTechnician,
  getVerifiedTechnicians,
  getAllTechnicians,
} = require("../controller/technicianController");
const uploadLicense = require("../middleware/multer");

const verifyToken = require("../middleware/authMiddleware");
const adminOnly = require("../middleware/adminOnly");

router.post(
  "/register",
  uploadLicense.single("licenseFile"),
  registerTechnician
);
router.get("/all", verifyToken, adminOnly, getAllTechnicians);
router.put("/verify/:technicianId", verifyToken, adminOnly, verifyTechnician);
router.get("/", getVerifiedTechnicians);

module.exports = router;
