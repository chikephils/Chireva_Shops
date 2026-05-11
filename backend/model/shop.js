const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const shopSchema = new mongoose.Schema(
  {
    shopName: {
      type: String,
      required: [true, "Please Enter a Shop Name"],
    },
    phoneNumber: {
      type: Number,
      required: [true, "Please Enter Shop Phone Number"],
    },
    email: {
      type: String,
      unique: [true, "Please Enter shop email"],
    },
    password: {
      type: String,
      required: [true, "Please select a Password"],
      minLength: [6, "Password must be longer than 6 Characters"],
    },
    address: {
      type: String,
      required: [true, "Please enter Shop Address"],
    },
    description: {
      type: String,
    },
    zipCode: {
      type: Number,
      required: [true, "Please enter Shop Zip Code"],
    },
    avatar: {
      public_id: {
        type: String,
        required: true,
      },
      url: {
        type: String,
        required: true,
      },
    },
    withdrawMethods: [
      {
        bankName: {
          type: String,
          required: true,
        },
        accountNumber: {
          type: String,
          required: true,
        },
        addedAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
    availableBalance: {
      type: Number,
      default: 0,
    },
    transactions: [
      {
        amount: {
          type: Number,
          required: true,
        },
        type: {
          type: String,
          enum: ["Withdrawal", "Refund", "Purchase"],
          required: true,
        },
        bank: String,
        accountNumber: String,
        status: {
          type: String,
          enum: ["Processing", "Successful", "Cancelled"],
          default: "Processing",
        },
        reference: {
          type: String, // orderId or withdrawalId
        },
        createdAt: {
          type: Date,
          default: Date.now,
        },
        updatedAt: Date,
      },
    ],
    role: {
      type: String,
      default: "seller",
    },
    resetPasswordToken: String,
    resetPasswordTime: Date,
  },
  { timestamps: true },
);

//jwt token
shopSchema.methods.getJwtToken = function () {
  return jwt.sign(
    { id: this._id, role: this.role },
    process.env.JWT_SECRET_KEY,
    { expiresIn: "1d" },
  );
};

module.exports = mongoose.model("Shop", shopSchema);
