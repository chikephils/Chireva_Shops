const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema(
  {
    cart: {
      type: Array,
      required: true,
    },
    shippingAddress: {
      type: Object,
      required: true,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    userSnapshot: {
      firstName: String,
      lastName: String,
      email: String,
      phoneNumber: String,
      avatar: Object,
    },
    totalPrice: {
      type: Number,
      required: true,
    },
    itemsPrice: {
      type: Number,
      required: true,
    },
    shipping: {
      type: Number,
      required: true,
    },
    status: {
      type: String,
      enum: ["Processing", "Shipped", "Delivered", "Cancelled"],
      default: "Processing",
    },
    refund: {
      status: {
        type: String,
        enum: ["None", "Refund Requested", "Refunded", "Refund Rejected"],
        default: "None",
      },
      amount: Number,
      processedAt: Date,
    },
    paymentInfo: {
      id: {
        type: String,
        required: true,
      },
      status: {
        type: Boolean,
        default: false,
      },
      type: {
        type: String,
      },
      response: {
        type: Object,
      },
      transactionId: {
        type: String, // From fLutterwave
      },
      totalAmount: {
        type: Number,
        required: true,
      },
      serviceFee: {
        type: Number,
        required: true,
      },
      flutterwaveFee: {
        type: Number,
      },
      totalServiceFee: {
        type: Number,
      },
    },
    parentOrderId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      index: true,
    },
    stockDeducted: {
      type: Boolean,
      default: false,
    },
    shop: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Shop",
      required: true,
    },

    shopSnapshot: {
      shopName: String,
      shopAvatar: Object,
      shopPhoneNumber: String,
      shopAddress: String,
    },
    paidAt: {
      type: Date,
    },
    deliveredAt: {
      type: Date,
    },
    shippedAt: {
      type: Date,
    },
    autoReleaseAt: {
      type: Date,
    },
    fundsReleased: {
      type: Boolean,
      default: false,
    },
    deliveryConfirmedByBuyer: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true },
);
// TTL index: auto-delete unpaid orders after 1hr
// Only applies to documents where paymentInfo.status is false AND paidAt is not set
orderSchema.index(
  { createdAt: 1 },
  {
    expireAfterSeconds: 60 * 60, // 1 hour
    partialFilterExpression: {
      "paymentInfo.status": false, // only unpaid orders
    },
  },
);

module.exports = mongoose.model("Order", orderSchema);
