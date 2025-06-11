const mongoose = require("mongoose");

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_DB_URI, { dbName: "db_gharsewa" });
    console.log("Database Connected");
  } catch (error) {
    console.log("Error connecting to the database:", error);
  }
};

module.exports = connectDB;
