const mongoose = require("mongoose");

const dispatchSchema = new mongoose.Schema(
  {
    inspectionReport: {
      type: String,
      required: true,
      trim: true,
    },

    items: [
      {
        itemName: {
          type: String,
          required: true,
          trim: true,
        },

        quantity: {
          type: Number,
          required: true,
          min: 1,
        },
      },
    ],

    vendorName: {
      type: String,
      required: true,
      trim: true,
    },

    qualityResult: {
      type: String,
      required: true,
      trim: true,
    },

    invoiceNumber: {
      type: String,
      required: true,
      trim: true,
    },

    eWayBillNumber: {
      type: String,
      trim: true,
      default: "",
    },

    weight: {
      type: Number,
      required: true,
      min: 0,
    },

    numberOfBags: {
      type: Number,
      required: true,
      min: 0,
    },

    deliveryChallan: {
      type: String,
      required: true,
      trim: true,
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
  "Dispatch",
  dispatchSchema
);