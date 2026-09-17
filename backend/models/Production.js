const mongoose = require("mongoose");

const productionSchema = new mongoose.Schema(
  {
    itemName: {
      type: String,
      required: true,
      trim: true,
    },

    productionProcess: {
      type: String,
      required: true,
      trim: true,
    },

    numberOfPieces: {
      type: Number,
      required: true,
      min: 1,
    },

    operator: {
      type: String,
      required: true,
      trim: true,
    },

    machine: {
      type: String,
      trim: true,
      default: "",
    },

    productionDate: {
      type: Date,
      required: true,
    },

    shift: {
      type: String,
      enum: [
        "Morning",
        "Evening",
        "Night",
        "",
      ],
      default: "",
    },

    status: {
      type: String,
      enum: [
        "Pending",
        "In Progress",
        "Completed",
        "On Hold",
      ],
      default: "In Progress",
    },

    notes: {
      type: String,
      trim: true,
      default: "",
    },

    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model(
  "Production",
  productionSchema
);