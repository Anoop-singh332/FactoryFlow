const express = require("express");

const {
  createInwardSupply,
  getInwardSupplies,
  getInwardSupply,
  updateInwardSupply,
  deleteInwardSupply,
} = require("../controllers/inwardController");

const protect = require("../middleware/authMiddleware");
const upload = require("../middleware/uploadMiddleware");

const router = express.Router();

// =====================================================
// CREATE INWARD SUPPLY
// DOCUMENT IS OPTIONAL
// =====================================================

router.post("/", protect, upload.single("document"), createInwardSupply);

// =====================================================
// GET ALL INWARD SUPPLIES
// =====================================================

router.get("/", protect, getInwardSupplies);

// =====================================================
// GET SINGLE INWARD SUPPLY
// =====================================================

router.get("/:id", protect, getInwardSupply);

// =====================================================
// UPDATE INWARD SUPPLY
// DOCUMENT IS OPTIONAL
// =====================================================

router.put("/:id", protect, upload.single("document"), updateInwardSupply);

// =====================================================
// DELETE INWARD SUPPLY
// =====================================================

router.delete("/:id", protect, deleteInwardSupply);

module.exports = router;
