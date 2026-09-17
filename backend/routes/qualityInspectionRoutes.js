const express = require("express");

const {
  createQualityInspection,
  getQualityInspections,
  getQualityInspection,
  updateQualityInspection,
  deleteQualityInspection,
} = require("../controllers/qualityInspectionController");

const protect = require("../middleware/authMiddleware");

const router = express.Router();

// =========================
// CREATE
// =========================

router.post(
  "/",
  protect,
  createQualityInspection
);

// =========================
// GET ALL
// =========================

router.get(
  "/",
  protect,
  getQualityInspections
);

// =========================
// GET SINGLE
// =========================

router.get(
  "/:id",
  protect,
  getQualityInspection
);

// =========================
// UPDATE
// =========================

router.put(
  "/:id",
  protect,
  updateQualityInspection
);

// =========================
// DELETE
// =========================

router.delete(
  "/:id",
  protect,
  deleteQualityInspection
);

module.exports = router;