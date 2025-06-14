const express = require("express");
const router = express.Router();
const verifyToken = require("../middleware/authMiddleware");
const { sendMessage, getMessages } = require("../controller/messageController");

router.post("/", verifyToken, sendMessage);
router.get("/:otherUserId", verifyToken, getMessages);

module.exports = router;
