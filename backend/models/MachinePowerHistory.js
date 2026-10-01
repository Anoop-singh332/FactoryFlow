const mongoose = require("mongoose");

const machinePowerHistorySchema = new mongoose.Schema(
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

    status: {
      type: String,
      enum: ["ONLINE", "OFFLINE"],
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
  "MachinePowerHistory",
  machinePowerHistorySchema
);