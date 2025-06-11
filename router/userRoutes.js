const express = require("express");
const router = express.Router();

const {
  registerCustomer,
  getAllUsers,
  login,
  saveUserLocation,
  getCurrentUser,
} = require("../controller/userController");
const {
  registerTechnician,
  verifyTechnician,
  getVerifiedTechnicians,
} = require("../controller/technicianController");
const adminOnly = require("../middleware/adminOnly");
const verifyToken = require("../middleware/authMiddleware");

router.post("/register/customer", registerCustomer);
router.post("/location", saveUserLocation);
router.post("/login", login);
router.get("/me", verifyToken, getCurrentUser);
router.get("/users", getAllUsers);

module.exports = router;
