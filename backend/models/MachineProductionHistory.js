const mongoose = require("mongoose");

const machineProductionHistorySchema = new mongoose.Schema(
  {
    machineId: {
      type: String,
      required: true,
      index: true,
    },

    productionCount: {
      type: Number,
      required: true,
      min: 0,
    },

    previousCount: {
      type: Number,
      required: true,
      min: 0,
    },

    producedQuantity: {
      type: Number,
      required: true,
      min: 0,
    },

    recordedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model(
  "MachineProductionHistory",
  machineProductionHistorySchema
);