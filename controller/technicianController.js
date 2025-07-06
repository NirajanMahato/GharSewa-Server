const User = require("../models/User");

const getAllTechnicians = async (req, res) => {
  try {
    const technicians = await User.find({ role: "technician" }).select(
      "-password"
    );
    res.status(200).json(technicians);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch all technicians", error });
  }
};

const verifyTechnician = async (req, res) => {
  try {
    const technicianId = req.params.technicianId;

    // Check if current user is admin
    if (req.user.role !== "admin") {
      return res.status(403).json({ message: "Access denied. Admins only." });
    }

    const technician = await User.findById(technicianId);
    if (!technician || technician.role !== "technician") {
      return res.status(404).json({ message: "Technician not found" });
    }

    technician.verified = true;
    await technician.save();

    res
      .status(200)
      .json({ message: "Technician verified successfully", technician });
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};

const getVerifiedTechnicians = async (req, res) => {
  try {
    const technicians = await User.find({
      role: "technician",
      verified: true,
    }).select("-password -__v");

    // Add availability status (for now, all verified technicians are available)
    const techniciansWithAvailability = technicians.map((tech) => ({
      ...tech.toObject(),
      isAvailable: true,
      rating: Math.floor(Math.random() * 2) + 4, // Random rating between 4-5
      completedJobs: Math.floor(Math.random() * 50) + 10, // Random completed jobs
    }));

    res.status(200).json(techniciansWithAvailability);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch technicians", error });
  }
};

module.exports = {
  getAllTechnicians,
  verifyTechnician,
  getVerifiedTechnicians,
};
