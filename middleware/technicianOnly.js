const technicianOnly = (req, res, next) => {
  if (req.user.role !== "technician") {
    return res.status(403).json({ message: "Technician access only" });
  }
  next();
};

module.exports = technicianOnly;
