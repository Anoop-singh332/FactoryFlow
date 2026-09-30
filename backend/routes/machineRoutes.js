const express = require("express");

const {
  controlMachine,
  getMachineStatus,
} = require("../controllers/machineController");

const router = express.Router();

// Start / Stop machine
router.post("/control", controlMachine);

// Get latest MQTT status of machine
router.get("/status/:machineId", getMachineStatus);

module.exports = router;