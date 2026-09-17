const mongoose = require("mongoose");

const inwardSupplySchema = new mongoose.Schema(
  {
    vendorName: {
      type: String,
      required: true,
      trim: true,
    },

    invoiceNumber: {
      type: String,
      required: true,
      trim: true,
    },

    materialWeight: {
      type: Number,
      required: true,
    },

    materialSize: {
      type: String,
      required: true,
      trim: true,
    },

    materialType: {
      type: String,
      required: true,
      trim: true,
    },

    materialItemName: {
      type: String,
      required: true,
      trim: true,
    },

    receivedBy: {
      type: String,
      required: true,
      trim: true,
    },

    document: {
      type: String,
      default: null,
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
  "InwardSupply",
  inwardSupplySchema
);