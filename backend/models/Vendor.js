const mongoose = require("mongoose");

const vendorSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },

    email: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
    },

    phone: {
      type: String,
      required: true,
      trim: true,
    },

    gstNo: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      uppercase: true,
    },

    address: {
      type: String,
      required: true,
      trim: true,
    },
  },
  {
    timestamps: true,
  },
);

module.exports = mongoose.model("Vendor", vendorSchema);