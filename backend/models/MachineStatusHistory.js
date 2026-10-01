const mongoose = require("mongoose");

const machineStatusHistorySchema = new mongoose.Schema(
  {
    machineId: {
      type: String,
      required: true,
      index: true,
    },

    date: {
      type: String,
      required: true,
      index: true,
    },

    // ==========================================
    // MACHINE WORKING STATUS
    // ==========================================
    // IDLE    = machine is online but not running
    // RUNNING = machine is actively running
    status: {
      type: String,
      enum: ["IDLE", "RUNNING"],
      required: true,
    },

    // ==========================================
    // STATUS COLOR
    // ==========================================
    // YELLOW = IDLE
    // GREEN  = RUNNING
    color: {
      type: String,
      enum: ["YELLOW", "GREEN"],
      required: true,
    },

    startTime: {
      type: Date,
      required: true,
    },

    endTime: {
      type: Date,
      default: null,
    },

    durationSeconds: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model(
  "MachineStatusHistory",
  machineStatusHistorySchema
);