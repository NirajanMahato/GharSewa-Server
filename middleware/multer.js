// middleware/multer.js
const multer = require("multer");
const path = require("path");
const fs = require("fs");

// Ensure the uploads/licenses folder exists
const licenseUploadPath = path.join(__dirname, "../uploads/licenses");
if (!fs.existsSync(licenseUploadPath)) {
  fs.mkdirSync(licenseUploadPath, { recursive: true });
}

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, licenseUploadPath);
  },
  filename: function (req, file, cb) {
    const ext = path.extname(file.originalname);
    const uniqueName = Date.now() + "-" + Math.round(Math.random() * 1e9) + ext;
    cb(null, uniqueName);
  },
});

const uploadLicense = multer({ storage });

module.exports = uploadLicense;
