const Booking = require("../models/Booking");
const User = require("../models/User");
const Message = require("../models/Message");

module.exports = (io) => {
  io.on("connection", (socket) => {
    console.log("Socket connected:", socket.id);

    socket.on("join", (userId) => {
      socket.join(userId);
      console.log(`User ${userId} joined their personal room`);
    });

    socket.on("start_rapid_booking", async ({ bookingId }) => {
      const booking = await Booking.findById(bookingId);
      if (
        !booking ||
        !booking.notifiedTechnicians ||
        booking.notifiedTechnicians.length === 0
      )
        return;
      const techId =
        booking.notifiedTechnicians[booking.currentTechnicianIndex];
      io.to(techId.toString()).emit("booking_request", { bookingId });
      booking.notifiedTo = techId;
      await booking.save();
    });

    socket.on(
      "booking_response",
      async ({ bookingId, technicianId, response }) => {
        const booking = await Booking.findById(bookingId);
        if (!booking) return;
        if (response === "accept") {
          booking.technician = technicianId;
          booking.status = "accepted";
          await booking.save();
          io.to(booking.customer.toString()).emit("booking_update", {
            status: "accepted",
            bookingId,
            technicianId,
          });
          io.to(technicianId.toString()).emit("booking_update", {
            status: "accepted",
            bookingId,
          });
        } else if (response === "reject") {
          booking.rejectedBy = booking.rejectedBy || [];
          booking.rejectedBy.push(technicianId);
          booking.currentTechnicianIndex =
            (booking.currentTechnicianIndex || 0) + 1;
          if (
            booking.currentTechnicianIndex < booking.notifiedTechnicians.length
          ) {
            const nextTechId =
              booking.notifiedTechnicians[booking.currentTechnicianIndex];
            io.to(nextTechId.toString()).emit("booking_request", { bookingId });
            booking.notifiedTo = nextTechId;
            await booking.save();
          } else {
            booking.status = "rejected";
            await booking.save();
            io.to(booking.customer.toString()).emit("booking_update", {
              status: "rejected",
              bookingId,
            });
          }
        }
      }
    );

    socket.on("join_chat", ({ bookingId, userId }) => {
      const room = `booking_${bookingId}`;
      socket.join(room);
      console.log(`User ${userId} joined chat room ${room}`);
    });

    socket.on(
      "send_chat_message",
      async ({ bookingId, senderId, receiverId, message }) => {
        const room = `booking_${bookingId}`;
        const newMsg = new Message({
          sender: senderId,
          receiver: receiverId,
          message,
        });
        await newMsg.save();
        io.to(room).emit("receive_chat_message", {
          senderId,
          receiverId,
          message,
          timestamp: new Date(),
        });
      }
    );

    socket.on("disconnect", () => {
      console.log("Socket disconnected:", socket.id);
    });
  });
};
