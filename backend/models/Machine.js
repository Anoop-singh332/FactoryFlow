const mongoose = require("mongoose");

const machineSchema = new mongoose.Schema(
  {
    _id: {
      type: String,
      required: true,
    },

    machineName: {
      type: String,
      required: true,
      trim: true,
    },

    mqttMachineId: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },

    // ==========================================
    // MACHINE CONNECTION STATUS
    // ==========================================
    // true  = machine is online
    // false = machine is offline
    machineOnline: {
      type: Boolean,
      default: false,
    },

    // Last time we received a message from machine
    lastSeenAt: {
      type: Date,
      default: null,
    },

    // ==========================================
    // MACHINE PERMISSION
    // ==========================================
    // true  = machine is allowed to operate
    // false = machine is locked and cannot operate
    machinePermission: {
      type: Boolean,
      default: false,
    },

    // ==========================================
    // MACHINE WORKING STATUS
    // ==========================================
    // RUNNING = machine is working
    // IDLE    = machine is available but not working
    // STOPPED = machine is stopped
    machineStatus: {
      type: String,
      enum: ["STOPPED", "IDLE", "RUNNING"],
      default: "STOPPED",
    },

    // ==========================================
    // MACHINE STATUS COLOR
    // ==========================================
    // RED    = STOPPED
    // YELLOW = IDLE
    // GREEN  = RUNNING
    machineColor: {
      type: String,
      enum: ["RED", "YELLOW", "GREEN"],
      default: "RED",
    },

    // ==========================================
    // PRODUCTION
    // ==========================================

    productionCount: {
      type: Number,
      default: 0,
    },

    powerConsumption: {
      type: Number,
      default: 0,
    },

    powerUnit: {
      type: String,
      default: "kW",
    },

    capacity: {
      type: Number,
      default: 0,
    },

    capacityUnit: {
      type: String,
      default: "units",
    },

    dailyProductionAverage: {
      type: Number,
      default: 0,
    },

    // ==========================================
    // CURRENT STATUS START TIME
    // ==========================================

    statusStartedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  },
);

module.exports = mongoose.model("Machine", machineSchema);
