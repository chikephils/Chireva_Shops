const express = require("express");
const router = express.Router();
const Product = require("../model/product");
const Shop = require("../model/shop");
const ErrorHandler = require("../utils/ErrorHandler");
const catchAsyncErrors = require("../middleware/CatchAsyncError");
const {
  authorizeRoles,
  isSellerAuthenticated,
  isUserAuthenticated,
} = require("../middleware/auth");
const Order = require("../model/order");
const cloudinary = require("cloudinary");

// create Product
router.post(
  "/create-product",
  isSellerAuthenticated,
  catchAsyncErrors(async (req, res, next) => {
    try {
      const shopId = req.body.shopId;
      const shop = await Shop.findById(shopId);

      if (!shop) {
        return next(new ErrorHandler("Shop Id is invalid:", 400));
      }

      let images = Array.isArray(req.body.images)
        ? req.body.images
        : typeof req.body.images === "string"
          ? [req.body.images]
          : [];

      if (images.length === 0) {
        return next(new ErrorHandler("At least one image is required", 400));
      }

      const imagesLinks = [];

      for (const image of images) {
        const result = await cloudinary.v2.uploader.upload(image, {
          folder: "products",
        });

        imagesLinks.push({
          public_id: result.public_id,
          url: result.secure_url,
        });
      }

      const productData = {
        ...req.body,
        images: imagesLinks,
        shop: shop,
        shopId: shop._id,
      };

      if (productData.isEvent === true || productData.isEvent === "true") {
        productData.isEvent = true;

        if (!productData.discountPrice || productData.discountPrice <= 0)
          return next(
            new ErrorHandler(
              "Discount Price is required and must be greater tah 0 for event products",
              400,
            ),
          );

        if (
          productData.originalPrice &&
          productData.discountPrice >= productData.originalPrice
        ) {
          return next(
            new ErrorHandler(
              "Discount price must be lower than original price for event products",
              400,
            ),
          );
        }

        const start = new Date(productData.eventStartDate);
        const end = new Date(productData.eventEndDate);

        if (isNaN(start) || isNaN(end)) {
          return next(new ErrorHandler("Invalid event date format", 400));
        }

        if (start >= end) {
          return next(
            new ErrorHandler("Event end date must be after start date", 400),
          );
        }

        // if (start < new Date()) {
        //   return next(
        //     new ErrorHandler("Event cannot start from a previous date"),
        //   );
        // }

        if (productData.eventTag) {
          productData.eventTag = productData.eventTag.trim();
        }
      } else {
        productData.isEvent = false;
        productData.eventEndDate = null;
        productData.eventEndDate = null;
        productData.eventTag = null;
        productData.discountPrice = null;
      }

      const product = await Product.create(productData);

      res.status(201).json({
        success: true,
        product,
      });
    } catch (error) {
      return next(new ErrorHandler(error.message, 400));
    }
  }),
);

//get Products for a shop
router.get(
  "/get-shop-products/:id",
  catchAsyncErrors(async (req, res, next) => {
    try {
      const products = await Product.find({ shopId: req.params.id }).sort({
        createdAt: -1,
      });

      res.status(201).json({
        success: true,
        products,
      });
    } catch (error) {
      return next(new ErrorHandler(error, 500));
    }
  }),
);

//get all shop Products
router.get(
  "/get-all-products-shop/:id",
  isSellerAuthenticated,
  catchAsyncErrors(async (req, res, next) => {
    try {
      const products = await Product.find({ shopId: req.params.id });

      res.status(201).json({
        success: true,
        products,
      });
    } catch (error) {
      return next(new ErrorHandler(error, 500));
    }
  }),
);

//get suggested products
router.get("/related-products/:id", async (req, res, next) => {
  try {
    const productId = req.params.id;

    const product = await Product.findById(productId);

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    const basePrice = product.discountPrice || product.originalPrice;

    //  dynamic price range (±30%)
    const minPrice = basePrice * 0.7;
    const maxPrice = basePrice * 1.3;

    let relatedProducts = await Product.aggregate([
      {
        $match: {
          _id: { $ne: product._id },
          category: product.category,
          discountPrice: { $gte: minPrice, $lte: maxPrice },
        },
      },
      { $sample: { size: 4 } },
    ]);

    //fallback if not enough products
    if (relatedProducts.length < 4) {
      const fallback = await Product.aggregate([
        {
          $match: {
            _id: { $ne: product._id },
            category: product.category,
          },
        },
        { $sample: { size: 4 - relatedProducts.length } },
      ]);

      relatedProducts = [...relatedProducts, ...fallback];
    }

    res.status(200).json({
      success: true,
      products: relatedProducts,
    });
  } catch (error) {
    next(error);
  }
});

//get promo products for a shop
router.get(
  "/shop-promo-products/:id",
  catchAsyncErrors(async (req, res, next) => {
    try {
      const shopId = req.params.id;

      const shop = await Shop.findById(shopId);
      if (!shop) {
        return next(new ErrorHandler("Shop not found", 404));
      }
      const query = {
        shopId: shopId,
        isEvent: true,
        eventStartDate: { $lte: new Date() },
        eventEndDate: { $gte: new Date() },
      };
      const promoProducts = await Product.find(query)
        .sort({ createdAt: 1 })
        .lean();

      res.status(200).json({
        success: true,
        promoProducts,
      });
    } catch (error) {
      return next(new ErrorHandler(error.message, 500));
    }
  }),
);

//get Shop Promo-Products
router.get(
  "/get-shop-promo-products/:id",
  isSellerAuthenticated,
  catchAsyncErrors(async (req, res, next) => {
    try {
      const shopId = req.params.id;

      const shop = await Shop.findById(shopId);
      if (!shop) {
        return next(new ErrorHandler("Shop not found", 404));
      }

      // Querya ll promo products for this shop
      const query = {
        shopId: shopId,
        isEvent: true,
      };

      const promoProducts = await Product.find(query)
        .sort({ createdAt: -1 })
        .lean();

      res.status(200).json({
        success: true,
        promoProducts,
      });
    } catch (error) {
      return next(
        new ErrorHandler(
          error.message || "Failed to fetch shop promo products",
          500,
        ),
      );
    }
  }),
);

// Delete Product from Shop
router.delete(
  "/delete-shop-product/:id",
  isSellerAuthenticated,
  catchAsyncErrors(async (req, res, next) => {
    try {
      const product = await Product.findById(req.params.id);

      if (!product) {
        return next(new ErrorHandler("Product is not found with this id", 404));
      }

      for (let i = 0; i < product.images.length; i++) {
        await cloudinary.v2.uploader.destroy(product.images[i].public_id);
      }

      await Product.findByIdAndDelete(req.params.id);

      res.status(200).json({
        success: true,
        message: "Product deleted successfully",
        product,
      });
    } catch (error) {
      return next(new ErrorHandler(error.message, 400));
    }
  }),
);

//edit Product
router.put(
  "/edit-product/:id",
  isSellerAuthenticated,
  catchAsyncErrors(async (req, res, next) => {
    try {
      const {
        name,
        description,
        category,
        originalPrice,
        discountPrice,
        stock,
        isEvent,
        eventStartDate,
        eventEndDate,
        eventTag,
      } = req.body;

      const product = await Product.findById(req.params.id);

      if (!product) {
        return next(new ErrorHandler("Product not found", 404));
      }

      // EVENT VALIDATIOn
      let parsedStart = null;
      let parsedEnd = null;

      if (isEvent === true || isEvent === "true") {
        if (!discountPrice || discountPrice <= 0) {
          return next(
            new ErrorHandler(
              "Discount price is required and must be greater than 0 for event products",
              400,
            ),
          );
        }

        if (originalPrice && discountPrice >= originalPrice) {
          return next(
            new ErrorHandler(
              "Discount price must be lower than original price",
              400,
            ),
          );
        }

        parsedStart = new Date(eventStartDate);
        parsedEnd = new Date(eventEndDate);

        if (isNaN(parsedStart) || isNaN(parsedEnd)) {
          return next(new ErrorHandler("Invalid event date format", 400));
        }

        if (parsedStart >= parsedEnd) {
          return next(
            new ErrorHandler("Event end date must be after start date", 400),
          );
        }
      }

      // ---------- UPDATE PRODUCT ----------
      product.name = name;
      product.description = description;
      product.category = category;
      product.originalPrice = originalPrice;
      product.stock = stock;

      if (isEvent === true || isEvent === "true") {
        product.isEvent = true;
        product.discountPrice = discountPrice;
        product.eventStartDate = parsedStart;
        product.eventEndDate = parsedEnd;
        product.eventTag = eventTag ? eventTag.trim() : null;
      } else {
        product.isEvent = false;
        product.discountPrice = null;
        product.eventStartDate = null;
        product.eventEndDate = null;
        product.eventTag = null;
      }

      await product.save();

      res.status(200).json({
        success: true,
        message: "Product updated successfully",
        product,
      });
    } catch (error) {
      return next(new ErrorHandler(error.message, 500));
    }
  }),
);

//best selling products
router.get(
  "/get-best-selling",
  catchAsyncErrors(async (req, res, next) => {
    try {
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 20;
      const skip = (page - 1) * limit;

      const query = {};

      // Parallel queries for efficiency
      const [products, totalProducts] = await Promise.all([
        Product.find(query)
          .sort({ sold_out: -1 })
          .skip(skip)
          .limit(limit)
          .lean(), // faster response (plain objects)

        Product.countDocuments(query),
      ]);

      const totalPages = Math.ceil(totalProducts / limit);
      const hasNextPage = page < totalPages;
      const hasPrevPage = page > 1;

      res.status(200).json({
        success: true,
        products,
        pagination: {
          currentPage: page,
          totalPages,
          totalProducts,
          limit,
          hasNextPage,
          hasPrevPage,
          nextPage: hasNextPage ? page + 1 : null,
          prevPage: hasPrevPage ? page - 1 : null,
        },
      });
    } catch (error) {
      return next(
        new ErrorHandler(
          error.message || "Failed to fetch best-selling products",
          500,
        ),
      );
    }
  }),
);

//get all  Products
router.get(
  "/get-all-products",
  catchAsyncErrors(async (req, res, next) => {
    try {
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 8;
      const skip = (page - 1) * limit;

      const query = {};

      if (req.query.category) {
        query.category = req.query.category;
      }

      const [products, totalProducts] = await Promise.all([
        Product.find(query)
          .sort({ createdAt: -1 })
          .skip(skip)
          .limit(limit)
          .lean(),

        Product.countDocuments(query),
      ]);
      const totalPages = Math.ceil(totalProducts / limit);
      const hasNextPage = page < totalPages;
      const hasPrevPage = page > 1;

      res.status(200).json({
        success: true,
        products,
        pagination: {
          currentPage: page,
          totalPages,
          limit,
          hasNextPage,
          hasPrevPage,
          nextPage: hasNextPage ? page + 1 : null,
          prevPage: hasPrevPage ? page - 1 : null,
        },
      });
    } catch (error) {
      return next(new ErrorHandler(error.message, 500));
    }
  }),
);

//Search all Products
router.get(
  "/search",
  catchAsyncErrors(async (req, res, next) => {
    try {
      const query = req.query.query;

      if (!query) {
        return res.status(200).json({
          success: true,
          products: [],
        });
      }
      const keywords = query.split(" ");

      const products = await Product.find({
        $or: [
          { name: { $regex: keywords.join("|"), $options: "i" } },
          { description: { $regex: keywords.join("|"), $options: "i" } },
        ],
      }).limit(10);

      res.status(200).json({
        success: true,
        products,
      });
    } catch (error) {
      return next(new ErrorHandler(error.message, 500));
    }
  }),
);

//get promo-sales products
router.get(
  "/get-promo-products",
  catchAsyncErrors(async (req, res, next) => {
    try {
      // Pagination
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 4;
      const skip = (page - 1) * limit;

      // Base query: only active promo/event products
      const query = {
        isEvent: true,
        eventStartDate: { $lte: new Date() },
        eventEndDate: { $gte: new Date() },
      };

      const [promoProducts, totalPromoProducts] = await Promise.all([
        Product.find(query)
          .sort({ createdAt: -1 })
          .skip(skip)
          .limit(limit)
          .lean(),

        Product.countDocuments(query),
      ]);

      const totalPages = Math.ceil(totalPromoProducts / limit);

      res.status(200).json({
        success: true,
        promoProducts,
        pagination: {
          currentPage: page,
          totalPages,
          totalPromoProducts,
          hasNextPage: page < totalPages,
          hasPrevPage: page > 1,
          limit,
        },
      });
    } catch (error) {
      return next(
        new ErrorHandler(
          error.message || "Failed to fetch promo products",
          500,
        ),
      );
    }
  }),
);
//get a Product
router.get(
  "/get-product/:id",
  catchAsyncErrors(async (req, res, next) => {
    try {
      const product = await Product.findById(req.params.id);

      if (!product) {
        return next(new ErrorHandler("Product not found"), 404);
      }

      res.status(201).json({
        success: true,
        product,
      });
    } catch (error) {
      return next(new ErrorHandler(error.message, 500));
    }
  }),
);

//create product review
router.put(
  "/create-new-review",
  isUserAuthenticated,
  catchAsyncErrors(async (req, res, next) => {
    try {
      const { user, rating, comment, productId, orderId } = req.body;

      const product = await Product.findById(productId);

      const review = {
        user,
        rating,
        comment,
        productId,
      };

      const isReviewed = product.reviews.find(
        (rev) => rev.user._id.toString() === req.user._id.toString(),
      );

      if (isReviewed) {
        product.reviews.forEach((rev) => {
          if (rev.user._id === req.user._id) {
            ((rev.rating = rating), (rev.comment = comment), (rev.user = user));
          }
        });
      } else {
        product.reviews.push(review);
      }

      let avg = 0;

      product.reviews.forEach((rev) => {
        avg += Number(rev.rating);
      });

      product.ratings = avg / product.reviews.length;

      await product.save({ validateBeforeSave: false });

      await Order.findByIdAndUpdate(
        orderId,
        {
          $set: { "cart.$[elem].isReviewed": true },
        },
        {
          arrayFilters: [{ "elem._id": productId.toString() }],
          new: true,
        },
      );

      res.status(200).json({
        success: true,
        message: "Reviewed succesfully!",
      });
    } catch (error) {
      return next(new ErrorHandler(error, 400));
    }
  }),
);

//get all Products  for admin
router.get(
  "/admin-all-products",
  isUserAuthenticated,
  authorizeRoles("Admin"),
  catchAsyncErrors(async (req, res, next) => {
    try {
      const products = await Product.find().sort({
        createdAt: -1,
      });
      res.status(201).json({
        success: true,
        products,
      });
    } catch (error) {
      return next(new ErrorHandler(error.message, 500));
    }
  }),
);

//get Admin Promo-Products  for Admin
router.get(
  "/admin-promo-products",
  isUserAuthenticated,
  authorizeRoles("Admin"),
  catchAsyncErrors(async (req, res, next) => {
    try {
      const query = {
        isEvent: true,
        eventStartDate: { $lte: new Date() },
        eventEndDate: { $gte: new Date() },
      };
      const promoProducts = await Product.find(query)
        .sort({ createdAt: 1 })
        .lean();

      res.status(200).json({
        success: true,
        promoProducts,
      });
    } catch (error) {
      return next(new ErrorHandler(error.message, 500));
    }
  }),
);

module.exports = router;
