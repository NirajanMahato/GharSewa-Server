require("dotenv").config();
const express = require("express");
const app = express();
const cors = require("cors");
const connectDB = require("./config/db");
const userRoutes = require("./router/userRoutes");
const technicianRoutes = require("./router/technicianRoutes");
const bookingRoutes = require("./router/bookingRoutes");
const messageRoutes = require("./router/messageRoutes");

connectDB();
const PORT = process.env.PORT ? process.env.PORT : 5000;

app.use(cors());
app.use(express.json());

app.use("/uploads", express.static("uploads")); // Multer middleware for file uploads

app.use("/api/user", userRoutes);
app.use("/api/technician", technicianRoutes);
app.use("/api/bookings", bookingRoutes);
app.use("/api/messages", messageRoutes);

app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
