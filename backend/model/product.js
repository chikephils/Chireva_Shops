const mongoose = require("mongoose");

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Please enter your product name"],
    },
    description: {
      type: String,
      required: [true, "Please enter your product description"],
    },
    category: {
      type: String,
      required: [true, "Please enter your product category"],
    },
    originalPrice: {
      type: Number,
      required: [true, "Please enter your product original price"],
    },
    discountPrice: {
      type: Number,
    },
    stock: {
      type: Number,
      required: [true, "Please enter your product stock"],
    },
    images: [
      {
        public_id: {
          type: String,
          required: true,
        },
        url: {
          type: String,
          required: true,
        },
      },
    ],
    reviews: [
      {
        user: {
          type: Object,
        },
        rating: {
          type: Number,
        },
        comment: {
          type: String,
          trim: true,
        },
        createdAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
    ratings: {
      type: Number,
    },
    shopId: {
      type: String,
      required: true,
    },
    shop: {
      type: Object,
      required: true,
    },
    sold_out: {
      type: Number,
      default: 0,
    },
    isEvent: {
      type: Boolean,
      default: false,
    },
    eventStartDate: {
      type: Date,
      default: null,
    },
    eventEndDate: {
      type: Date,
      default: null,
    },
    eventTag: {
      type: String,
      trim: true,
    },
  },
  {
    timestamps: true,
  },
);
productSchema.index({
  name: "text",
  description: "text",
});

module.exports = mongoose.model("Product", productSchema);
