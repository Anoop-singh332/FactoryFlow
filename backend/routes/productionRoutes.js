const express = require("express");

const {
  createProduction,
  getProductions,
  getProduction,
  updateProduction,
  deleteProduction,
} = require("../controllers/productionController");

const router = express.Router();

router.post("/", createProduction);

router.get("/", getProductions);

router.get("/:id", getProduction);

router.put("/:id", updateProduction);

router.delete("/:id", deleteProduction);

module.exports = router;