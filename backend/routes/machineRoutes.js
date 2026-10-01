const express = require("express");

const {
  controlMachine,
  setMachinePermission,
  getMachineStatus,
  getMachineState,
  getMachineHistory,
  getMachinePowerHistory,
  getAllMachines,
  createMachine,
} = require("../controllers/machineController");

const router = express.Router();

// Get all machines
router.get("/", getAllMachines);

// Create machine
router.post("/", createMachine);

// Manual machine START / STOP control
router.post("/control", controlMachine);

// Machine permission ON / OFF
router.post(
  "/permission",
  setMachinePermission
);

// Machine status
router.get(
  "/status/:machineId",
  getMachineStatus
);

// Current machine state
router.get(
  "/state/:machineId",
  getMachineState
);

// Machine status history
router.get(
  "/history/:machineId",
  getMachineHistory
);

// Temporary compatibility endpoint
router.get(
  "/power-history/:machineId",
  getMachinePowerHistory
);

module.exports = router;