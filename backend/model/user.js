const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");

const userSchema = new mongoose.Schema(
  {
    firstName: {
      type: String,
      required: [true, "Please enter your First Name!"],
    },
    lastName: {
      type: String,
      required: [true, "Please enter your Last Name"],
    },
    email: {
      type: String,
      unique: [true, "Please enter your email!"],
    },
    password: {
      type: String,
      required: [true, "Please enter your password"],
      minLength: [6, "Password must be longer than 6 characters"],
    },
    phoneNumber: {
      type: Number,
    },
    availableBalance: {
      type: Number,
      default: 0,
    },
    withdrawMethods: {
      type: Array,
      default: [],
    },
    transactions: [
      {
        amount: {
          type: Number,
          required: true,
        },
        type: {
          type: String,
          enum: ["Withdrawal", "Refund", "Cancelled", "Purchase"],
          required: true,
        },
        bank: String,
        accountNumber: String,
        status: {
          type: String,
          enum: ["Processing", "Successful", "Cancelled", "Rejected"],
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
    addresses: [
      {
        country: {
          type: String,
        },
        state: {
          type: String,
        },
        city: {
          type: String,
        },
        address1: {
          type: String,
        },
        zipCode: {
          type: Number,
        },
        addressType: {
          type: String,
        },
      },
    ],
    role: {
      type: String,
      default: "user",
      enum: ["user", "Admin"],
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
    resetPasswordToken: String,
    resetPasswordTime: Date,
  },
  { timestamps: true },
);

//jwt token
userSchema.methods.getJwtToken = function () {
  return jwt.sign(
    {
      id: this._id,
      role: this.role,
    },
    process.env.JWT_SECRET_KEY,
    { expiresIn: "1d" },
  );
};

module.exports = mongoose.model("User", userSchema);
