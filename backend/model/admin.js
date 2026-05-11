const mongoose = require("mongoose");

const adminSchema = new mongoose.Schema(
  {
    escrowBalance: {
      type: Number,
      default: 0,
    },
    profitBalance: {
      type: Number,
      default: 0,
    },
    isSingleton: {
      type: Boolean,
      default: true,
      unique: true,
    },
  },
  { timestamps: true },
);

module.exports = mongoose.model("AdminBalance", adminSchema);
