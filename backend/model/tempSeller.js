const mongoose = require("mongoose");

const tempSellerSchema = new mongoose.Schema(
  {
    email: String,
    shopName: String,
    phoneNumber: Number,
    address: String,
    zipCode: Number,
    password: String,
    avatar: {
      public_id: String,
      url: String,
    },
  },
  { timestamps: true },
);

tempSellerSchema.index({ createdAt: 1 }, { expireAfterSeconds: 300 });

module.exports = mongoose.model("TempSeller", tempSellerSchema);
