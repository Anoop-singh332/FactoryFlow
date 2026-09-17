const express = require("express");
const multer = require("multer");
const path = require("path");

const {
  createInwardSupply,
  getInwardSupplies,
  getInwardSupply,
  updateInwardSupply,
  deleteInwardSupply,
} = require("../controllers/inwardController");

const protect = require("../middleware/authMiddleware");

const router = express.Router();

// =========================
// MULTER CONFIGURATION
// =========================

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/");
  },

  filename: (req, file, cb) => {
    const uniqueName =
      `${Date.now()}-${Math.round(
        Math.random() * 1e9
      )}${path.extname(file.originalname)}`;

    cb(null, uniqueName);
  },
});

const upload = multer({
  storage,
});

// =========================
// CREATE INWARD SUPPLY
// =========================

router.post(
  "/",
  protect,
  upload.single("document"),
  createInwardSupply
);

// =========================
// GET ALL INWARD SUPPLIES
// =========================

router.get(
  "/",
  protect,
  getInwardSupplies
);

// =========================
// GET SINGLE INWARD SUPPLY
// =========================

router.get(
  "/:id",
  protect,
  getInwardSupply
);

// =========================
// UPDATE INWARD SUPPLY
// =========================

router.put(
  "/:id",
  protect,
  upload.single("document"),
  updateInwardSupply
);

// =========================
// DELETE INWARD SUPPLY
// =========================

router.delete(
  "/:id",
  protect,
  deleteInwardSupply
);

module.exports = router;