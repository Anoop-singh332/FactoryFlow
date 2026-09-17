const express = require("express");

const {
  createProduction,
  getProductions,
  getProduction,
  updateProduction,
  deleteProduction,
} = require("../controllers/productionController");

const protect = require("../middleware/authMiddleware");

const router = express.Router();

// =========================
// CREATE PRODUCTION
// =========================

router.post(
  "/",
  protect,
  createProduction
);

// =========================
// GET ALL PRODUCTION
// =========================

router.get(
  "/",
  protect,
  getProductions
);

// =========================
// GET SINGLE PRODUCTION
// =========================

router.get(
  "/:id",
  protect,
  getProduction
);

// =========================
// UPDATE PRODUCTION
// =========================

router.put(
  "/:id",
  protect,
  updateProduction
);

// =========================
// DELETE PRODUCTION
// =========================

router.delete(
  "/:id",
  protect,
  deleteProduction
);

module.exports = router;