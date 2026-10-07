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
  updateMachineProduction,
  getMachineProductionHistory,
} = require("../controllers/machineController");

const router = express.Router();

router.get("/", getAllMachines);

router.post("/", createMachine);

router.post("/control", controlMachine);

router.post("/permission", setMachinePermission);

router.post("/production", updateMachineProduction);

router.get("/status/:machineId", getMachineStatus);

router.get("/state/:machineId", getMachineState);

router.get("/history/:machineId", getMachineHistory);

router.get("/power-history/:machineId", getMachinePowerHistory);

router.get("/production/:machineId", getMachineProductionHistory);

module.exports = router;