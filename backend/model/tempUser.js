const mongoose = require("mongoose");

const tempUserSchema = new mongoose.Schema(
  {
    firstName: String,
    lastName: String,
    email: String,
    password: String,
    avatar: {
      public_id: String,
      url: String,
    },
  },
  { timestamps: true },
);

tempUserSchema.index({ createdAt: 1 }, { expireAfterSeconds: 300 });

module.exports = mongoose.model("TempUser", tempUserSchema);
