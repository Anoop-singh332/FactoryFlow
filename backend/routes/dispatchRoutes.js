const express = require("express");

const {
  createDispatch,
  getDispatches,
  getDispatch,
  updateDispatch,
  deleteDispatch,
} = require("../controllers/dispatchController");

const protect = require("../middleware/authMiddleware");

const router = express.Router();

// =========================
// CREATE DISPATCH
// =========================

router.post(
  "/",
  protect,
  createDispatch
);

// =========================
// GET ALL DISPATCHES
// =========================

router.get(
  "/",
  protect,
  getDispatches
);

// =========================
// GET SINGLE DISPATCH
// =========================

router.get(
  "/:id",
  protect,
  getDispatch
);

// =========================
// UPDATE DISPATCH
// =========================

router.put(
  "/:id",
  protect,
  updateDispatch
);

// =========================
// DELETE DISPATCH
// =========================

router.delete(
  "/:id",
  protect,
  deleteDispatch
);

module.exports = router;