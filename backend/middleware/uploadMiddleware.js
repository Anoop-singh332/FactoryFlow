const multer = require("multer");
const path = require("path");
const fs = require("fs");

// =====================================================
// UPLOAD DIRECTORY
// =====================================================

const uploadDirectory = path.join(
  __dirname,
  "..",
  "uploads",
);

// Create uploads folder automatically if it doesn't exist
if (!fs.existsSync(uploadDirectory)) {
  fs.mkdirSync(uploadDirectory, {
    recursive: true,
  });
}

// =====================================================
// MULTER STORAGE
// =====================================================

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDirectory);
  },

  filename: (req, file, cb) => {
    const uniqueName =
      `${Date.now()}-${Math.round(
        Math.random() * 1e9,
      )}${path.extname(file.originalname)}`;

    cb(null, uniqueName);
  },
});

// =====================================================
// MULTER
// =====================================================

const upload = multer({
  storage,
});

module.exports = upload;