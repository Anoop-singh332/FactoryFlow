const mongoose = require("mongoose");

const productionSchema = new mongoose.Schema(
  {
    machineNumber: {
      type: String,
      required: true,
      trim: true,
    },

    itemName: {
      type: String,
      required: true,
      trim: true,
    },

    productionCount: {
      type: Number,
      required: true,
      min: 0,
    },

    weight: {
      type: Number,
      required: true,
      min: 0,
    },

    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
  },
  {
    timestamps: true,
  },
);

module.exports = mongoose.model(
  "Production",
  productionSchema,
);