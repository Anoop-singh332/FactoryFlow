const mongoose = require("mongoose");

const batchCounterSchema = new mongoose.Schema(
  {
    key: {
      type: String,
      required: true,
      unique: true,
      default: "inward-batch",
    },

    sequence: {
      type: Number,
      required: true,
      default: 0,
    },
  },
  {
    timestamps: true,
  },
);

module.exports = mongoose.model(
  "BatchCounter",
  batchCounterSchema,
);