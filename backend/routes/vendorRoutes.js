const express = require("express");

const {
  getVendors,
  createVendor,
  getVendor,
  updateVendor,
  deleteVendor,
} = require("../controllers/vendorController");

const router = express.Router();

router.get("/", getVendors);

router.post("/", createVendor);

router.get("/:id", getVendor);

router.put("/:id", updateVendor);

router.delete("/:id", deleteVendor);

module.exports = router;