const express = require("express");
const router = express.Router();
const verifyToken = require("../middleware/authMiddleware");
const { sendMessage, getMessages } = require("../controller/messageController");

// Send a message
router.post("/", verifyToken, sendMessage);

// Get messages between user and another person
router.get("/:otherUserId", verifyToken, getMessages);

module.exports = router;
