const mongoose = require("mongoose");

const withdrawSchema = new mongoose.Schema(
  {
    withdrawalType: {
      type: String,
      enum: ["seller", "user"],
      required: true,
    },

    seller: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Shop",
    },

    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },

    amount: {
      type: Number,
      required: true,
    },

    bank: {
      type: String,
      required: true,
    },

    accountNumber: {
      type: String,
      required: true,
      trim: true,
    },
    reference: {
      type: String,
    },

    status: {
      type: String,
      enum: ["Processing", "Successful", "Rejected"],
      default: "Processing",
    },
    processedAt: Date,

    failureReason: String,

    escrowHandled: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true },
);

withdrawSchema.index({ withdrawalType: 1, status: 1 });
withdrawSchema.index({ seller: 1 });
withdrawSchema.index({ user: 1 });
withdrawSchema.index({ createdAt: -1 });

module.exports = mongoose.model("Withdraw", withdrawSchema);
