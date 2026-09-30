const mongoose = require("mongoose");

const inwardSupplySchema = new mongoose.Schema(
  {
    batchNo: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },

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

    numberOfItems: {
      type: Number,
      required: true,
      min: 1,
    },

    materialWeight: {
      type: String,
      required: true,
      trim: true,
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
  },
);

module.exports = mongoose.model(
  "InwardSupply",
  inwardSupplySchema,
);