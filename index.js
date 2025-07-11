require("dotenv").config();
const express = require("express");
const http = require("http");
const cors = require("cors");
const { Server } = require("socket.io");

const connectDB = require("./config/db");
const userRoutes = require("./router/userRoutes");
const technicianRoutes = require("./router/technicianRoutes");
const bookingRoutes = require("./router/bookingRoutes");
const messageRoutes = require("./router/messageRoutes");
const adminRoutes = require("./router/adminRoutes");
const socketHandler = require("./socket/socket");

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
});

connectDB();
const PORT = process.env.PORT || 5000;

app.set("io", io);

app.use(cors());
app.use(express.json());
app.use("/uploads", express.static("uploads"));

app.use("/api/user", userRoutes);
app.use("/api/technician", technicianRoutes);
app.use("/api/bookings", bookingRoutes);
app.use("/api/messages", messageRoutes);
app.use("/api/admin", adminRoutes);

socketHandler(io);

server.listen(PORT, () => {
  console.log(`Server running on PORT ${PORT}`);
});
