const mongoose = require("mongoose");

const qualityInspectionSchema =
  new mongoose.Schema(
    {
      // =========================
      // INSPECTION REPORT
      // =========================

      inspectionReport: {
        type: String,
        required: true,
        trim: true,
      },

      // =========================
      // ITEMS
      // =========================

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

      // =========================
      // VENDOR
      // =========================

      vendorName: {
        type: String,
        required: true,
        trim: true,
      },

      // =========================
      // QUALITY
      // =========================

      qualityResult: {
        type: String,
        enum: [
          "Passed",
          "Failed",
          "Partially Passed",
          "Pending",
        ],
        default: "Pending",
      },

      // =========================
      // INVOICE
      // =========================

      invoiceNumber: {
        type: String,
        required: true,
        trim: true,
      },

      // =========================
      // E-WAY BILL
      // =========================

      eWayBillNumber: {
        type: String,
        trim: true,
        default: "",
      },

      // =========================
      // WEIGHT
      // =========================

      weight: {
        type: Number,
        required: true,
        min: 0,
      },

      // =========================
      // NUMBER OF BAGS
      // =========================

      numberOfBags: {
        type: Number,
        required: true,
        min: 0,
      },

      // =========================
      // DELIVERY CHALLAN
      // =========================

      deliveryChallan: {
        type: String,
        required: true,
        trim: true,
      },

      // =========================
      // REMARKS
      // =========================

      remarks: {
        type: String,
        trim: true,
        default: "",
      },

      // =========================
      // CREATED BY
      // =========================

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
  "QualityInspection",
  qualityInspectionSchema
);