const Booking = require("../models/Booking");
const User = require("../models/User");
const Message = require("../models/Message");

module.exports = (io) => {
  io.on("connection", (socket) => {
    console.log("Socket connected:", socket.id);

    // Join room based on user ID
    socket.on("join", (userId) => {
      socket.join(userId);
      console.log(`User ${userId} joined their personal room`);
    });

    // --- RAPID BOOKING LOGIC ---
    // Start rapid booking process
    socket.on("start_rapid_booking", async ({ bookingId }) => {
      const booking = await Booking.findById(bookingId);
      if (
        !booking ||
        !booking.notifiedTechnicians ||
        booking.notifiedTechnicians.length === 0
      )
        return;
      // Notify the first technician
      const techId =
        booking.notifiedTechnicians[booking.currentTechnicianIndex];
      io.to(techId.toString()).emit("booking_request", { bookingId });
      booking.notifiedTo = techId;
      await booking.save();
    });

    // Technician responds to booking
    socket.on(
      "booking_response",
      async ({ bookingId, technicianId, response }) => {
        const booking = await Booking.findById(bookingId);
        if (!booking) return;
        if (response === "accept") {
          // Assign technician, update status, notify customer
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
          // Add to rejectedBy, move to next technician
          booking.rejectedBy = booking.rejectedBy || [];
          booking.rejectedBy.push(technicianId);
          booking.currentTechnicianIndex =
            (booking.currentTechnicianIndex || 0) + 1;
          if (
            booking.currentTechnicianIndex < booking.notifiedTechnicians.length
          ) {
            // Notify next technician
            const nextTechId =
              booking.notifiedTechnicians[booking.currentTechnicianIndex];
            io.to(nextTechId.toString()).emit("booking_request", { bookingId });
            booking.notifiedTo = nextTechId;
            await booking.save();
          } else {
            // All rejected, notify customer
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

    // --- CHAT LOGIC ---
    // Join chat room for a booking
    socket.on("join_chat", ({ bookingId, userId }) => {
      const room = `booking_${bookingId}`;
      socket.join(room);
      console.log(`User ${userId} joined chat room ${room}`);
    });

    // Send chat message
    socket.on(
      "send_chat_message",
      async ({ bookingId, senderId, receiverId, message }) => {
        const room = `booking_${bookingId}`;
        // Save message to DB
        const newMsg = new Message({
          sender: senderId,
          receiver: receiverId,
          message,
        });
        await newMsg.save();
        // Emit to both users in the room
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
