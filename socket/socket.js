module.exports = (io) => {
  io.on("connection", (socket) => {
    console.log("Socket connected:", socket.id);

    // Join room based on user ID
    socket.on("join", (userId) => {
      socket.join(userId);
      console.log(`User ${userId} joined their personal room`);
    });

    // Send message to another user
    socket.on("send_message", ({ senderId, receiverId, message }) => {
      console.log(`Message from ${senderId} to ${receiverId}:`, message);

      io.to(receiverId).emit("receive_message", {
        senderId,
        message,
        timestamp: new Date(),
      });
    });

    socket.on("disconnect", () => {
      console.log("Socket disconnected:", socket.id);
    });
  });
};
