const Message = require("../models/Message");

// Send message
const sendMessage = async (req, res) => {
  try {
    const { receiverId, message } = req.body;
    const senderId = req.user.id;

    if (!receiverId || !message) {
      return res.status(400).json({ message: "Receiver and message are required" });
    }

    const newMessage = new Message({
      sender: senderId,
      receiver: receiverId,
      message,
    });

    const saved = await newMessage.save();
    res.status(201).json({ message: "Message sent", data: saved });
  } catch (error) {
    console.error("Send message error:", error);
    res.status(500).json({ message: "Server error", error });
  }
};

// Get all messages between current user and another user
const getMessages = async (req, res) => {
  try {
    const userId = req.user.id;
    const { otherUserId } = req.params;

    const messages = await Message.find({
      $or: [
        { sender: userId, receiver: otherUserId },
        { sender: otherUserId, receiver: userId },
      ],
    })
      .sort({ createdAt: 1 })
      .populate("sender receiver", "fullName role");

    res.status(200).json(messages);
  } catch (error) {
    console.error("Get messages error:", error);
    res.status(500).json({ message: "Server error", error });
  }
};

module.exports = {
  sendMessage,
  getMessages,
};
