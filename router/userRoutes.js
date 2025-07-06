const express = require("express");
const router = express.Router();

const {
  registerCustomer,
  getAllUsers,
  login,
  saveUserLocation,
  getCurrentUser,
  changePassword,
  updateProfile,
} = require("../controller/userController");
const verifyToken = require("../middleware/authMiddleware");

router.post("/register/customer", registerCustomer);
router.post("/location", saveUserLocation);
router.post("/login", login);
router.get("/me", verifyToken, getCurrentUser);
router.put("/change-password", verifyToken, changePassword);
router.put("/profile", verifyToken, updateProfile);
router.get("/users", getAllUsers);

module.exports = router;
