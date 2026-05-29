const express = require("express");
const path = require("path");
const router = express.Router();
const fs = require("fs");
const jwt = require("jsonwebtoken");
const { sendMail } = require("../utils/sendMail");
const {
  isAuthenticated,
  authorizeRoles,
  isSellerAuthenticated,
  isUserAuthenticated,
} = require("../middleware/auth");
const Shop = require("../model/shop");
const ErrorHandler = require("../utils/ErrorHandler");
const catchAsyncError = require("../middleware/CatchAsyncError");
const sendShopToken = require("../utils/shopToken");
const cloudinary = require("cloudinary");
const bcrypt = require("bcryptjs");
const Products = require("../model/product");
const Withdraw = require("../model/withdraw");
const Order = require("../model/order");

//Create Activation token
const createActivationToken = (seller) => {
  return jwt.sign(seller, process.env.ACTIVATION_SECRET, {
    expiresIn: "5m",
  });
};

//create Shop
router.post("/create-shop", async (req, res, next) => {
  try {
    const { email, shopName, phoneNumber, address, zipCode, password, avatar } =
      req.body;

    const existingSeller = await Shop.findOne({ email });

    if (existingSeller) {
      return next(new ErrorHandler("User already exists", 400));
    }

    const seller = {
      email,
      shopName,
      phoneNumber,
      address,
      zipCode,
      avatar,
      password,
    };

    const activationToken = createActivationToken(seller);

    const activationURL = `https://chireva.vercel.app/seller/activation?token=${activationToken}`;

    //Read HTML template
    const htmlTemplatePath = path.join(
      __dirname,
      "../html/shopActivaitionMail.html",
    );
    const htmlTemplate = fs.readFileSync(htmlTemplatePath, "utf-8");

    //Replace place holders with dynamic values
    const htmlMail = htmlTemplate
      .replace("%SHOPNAME%", shopName)
      .replace("%ACTIVATION_URL%", activationURL);

    sendMail({
      to: email,
      subject: "Activate your Shop",
      html: htmlMail,
    }).catch((emailErr) => {
      console.error("Email send failed:", emailErr);
    });
    return res.status(201).json({
      success: true,
      message: `Please check your email: ${email} to activate your account`,
    });
  } catch (error) {
    return next(new ErrorHandler(error.message, 400));
  }
});


//activate Seller
router.post(
  "/shop-activation",
  catchAsyncError(async (req, res, next) => {
    try {
      const { activation_token } = req.body;

      if (!activation_token) {
        return next(new ErrorHandler("Activation token missing", 400));
      }

      let decoded;

      try {
        decoded = jwt.verify(activation_token, process.env.ACTIVATION_SECRET);
      } catch (error) {
        return next(
          new ErrorHandler("Invalid or expired activation token", 400),
        );
      }

      const {
        shopName,
        email,
        phoneNumber,
        address,
        zipCode,
        avatar,
        password,
      } = decoded;

      const existingSeller = await Shop.findOne({ email });
      if (existingSeller) {
        return next(new ErrorHandler("Seller already exists", 400));
      }

      //  Upload avatar
      let uploadedAvatar = {
        public_id: "",
        url: "",
      };

      if (avatar) {
        const myCloud = await cloudinary.v2.uploader.upload(avatar, {
          folder: "avatars",
        });

        uploadedAvatar = {
          public_id: myCloud.public_id,
          url: myCloud.secure_url,
        };
      }

      const hashedPassword = await bcrypt.hash(password, 12);

      const seller = await Shop.create({
        shopName,
        email,
        phoneNumber,
        address,
        zipCode,
        avatar: uploadedAvatar,
        password: hashedPassword,
        role: "seller",
      });

      sendShopToken(seller, 201, res, "Shop Activated successfully");

      //Read HTML template
      const htmlTemplatePath = path.join(
        __dirname,
        "../html/shopCreatedSuccess.html",
      );
      const htmlTemplate = await fs.readFileSync(htmlTemplatePath, "utf-8");

      //Replace place holders with dynamic values
      const htmlMail = htmlTemplate
        .replace("%SHOPNAME%", seller.shopName)
        .replace("%LOGIN%", `${process.env.CLIENT_URL}/shop-login`);

      sendMail({
        to: seller.email,
        subject: "Welcome to CHIREVA Vendors",
        html: htmlMail,
      }).catch((emailErr) => {
        console.error("Email send failed:", emailErr);
      });
      res.status(201).json({
        success: true,
        message: `Shop Created successfully`,
      });
    } catch (error) {
      return next(new ErrorHandler(error.message, 400));
    }
  }),
);

//Request forgot password
router.post(
  "/forgot-shop-password",
  catchAsyncError(async (req, res, next) => {
    try {
      const { email } = req.body;

      if (!email) {
        return next(
          new ErrorHandler("Please provide a registered email address", 400),
        );
      }

      const shop = await Shop.findOne({ email });

      if (!shop) {
        return next(
          new ErrorHandler("Email not associated with any shop", 400),
        );
      }

      const passwordResetToken = jwt.sign(
        { _id: shop._id },
        process.env.RESET_SECRET,
        { expiresIn: "5m" },
      );

      const passwordResetURL = `https://chireva.vercel.app/shop-password-reset/reset?token=${resetToken}`;

      const htmlTemplatePath = path.join(
        __dirname,
        "../html/userPasswordReset.html",
      );
      const htmlTemplate = await fs.readFile(htmlTemplatePath, "utf-8");

      const htmlMail = htmlTemplate
        .replace("%NAME%", shop.shopName)
        .replace("%RESET_URL%", passwordResetURL);

      try {
        await sendMail({
          to: shop.email,
          subject: "Password Reset",
          html: htmlMail,
        });
        res.status(201).json({
          success: true,
          message: `Please check your email: ${shop.email} to reset your account password`,
        });
      } catch (error) {
        console.log(error);
        return next(new ErrorHandler(error.message, 500));
      }
    } catch (error) {
      return next(new ErrorHandler(error.message, 500));
    }
  }),
);

//verify token
router.post(
  "/verify-token-shop",
  catchAsyncError(async (req, res, next) => {
    try {
      const { reset_Token } = req.body;

      if (!reset_Token) {
        return next(new ErrorHandler("No Token found", 400));
      }
      try {
        const decoded = jwt.verify(reset_Token, process.env.RESET_SECRET);

        const shop = await Shop.findById(decoded._id);

        if (!shop) {
          res.json({
            success: false,
            message: "Invalid Shop",
          });
        } else {
          res.json({
            success: true,
            message: "Token is Valid",
          });
        }
      } catch (error) {
        res.json({
          success: false,
          message: "Token has expired or is Invalid",
        });
      }
    } catch (error) {
      return next(new ErrorHandler(error.message, 500));
    }
  }),
);

//Create new password
router.post(
  "/new-shop-password/:id",
  catchAsyncError(async (req, res, next) => {
    try {
      const { id } = req.params;
      const { password, confirmPassword } = req.body;

      if (password !== confirmPassword) {
        return next(new ErrorHandler("Passwords do not match", 400));
      }

      const hashedPassword = await bcrypt.hash(password, 12);

      const updatedShop = await Shop.findByIdAndUpdate(id, {
        password: hashedPassword,
      });

      if (!updatedShop) {
        return next(new ErrorHandler("Shop not Found", 400));
      }

      await updatedShop.save();

      res.status(200).json({
        success: true,
        message: "Password updated successfully",
      });
    } catch (error) {
      return next(new ErrorHandler(error.message, 500));
    }
  }),
);

//login Seller
router.post(
  "/shop-login",
  catchAsyncError(async (req, res, next) => {
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        return next(new ErrorHandler("Please provide all fields", 400));
      }
      const seller = await Shop.findOne({ email: email.toLowerCase() }).select(
        "+password",
      );

      if (!seller) {
        return next(new ErrorHandler("Seller does not exist", 400));
      }

      const isPasswordValid = await bcrypt.compare(password, seller.password);

      if (!isPasswordValid) {
        return next(new ErrorHandler("Incorrect Password", 400));
      }
      const token = jwt.sign(
        { id: seller._id, role: "seller" },
        process.env.JWT_SECRET_KEY,
        { expiresIn: "1d" },
      );

      seller.password = undefined;

      res.status(200).json({
        success: true,
        seller,
        token,
        message: "Logged in successfully",
      });
    } catch (error) {
      return next(new ErrorHandler(error.message, 500));
    }
  }),
);

//load shop
router.get(
  "/getSeller",
  isSellerAuthenticated,
  catchAsyncError(async (req, res, next) => {
    try {
      const seller = await Shop.findById(req.seller._id);

      if (!seller) {
        return next(new ErrorHandler("Seller doesn't exist", 400));
      }
      res.status(200).json({
        success: true,
        seller,
        role: "seller",
      });
    } catch (error) {
      return next(new ErrorHandler(err.message, 500));
    }
  }),
);

//logout Seller
router.get(
  "/logout",
  catchAsyncError(async (req, res, next) => {
    res.status(201).json({
      success: true,
      message: "Logged out successfully",
    });
  }),
);

//get shop info
router.get(
  "/get-shop-info/:id",
  catchAsyncError(async (req, res, next) => {
    try {
      const shop = await Shop.findById(req.params.id);
      res.status(201).json({
        success: true,
        shop,
      });
    } catch (error) {
      console.log(error);
      return next(new ErrorHandler(error.message, 500));
    }
  }),
);

//Update shop avatar
router.put(
  "/update-shop-avatar",
  isSellerAuthenticated,
  catchAsyncError(async (req, res, next) => {
    try {
      const shop = await Shop.findById(req.seller._id);
      const imageId = shop.avatar.public_id;
      await cloudinary.v2.uploader.destroy(imageId);

      const myCloud = await cloudinary.v2.uploader.upload(req.body.avatar, {
        folder: "avatars",
      });

      // Update shop avatar
      shop.avatar = {
        public_id: myCloud.public_id,
        url: myCloud.secure_url,
      };
      await shop.save();

      // Update all products
      await Products.updateMany(
        { "shop._id": shop._id },
        { $set: { "shop.avatar": shop.avatar } },
      );

      // Update all withdrawals
      await Withdraw.updateMany(
        { "seller._id": shop._id },
        { $set: { "seller.avatar": shop.avatar } },
      );

      // Update all orders
      await Order.updateMany(
        { "shop._id": shop._id },
        { $set: { "shop.avatar": shop.avatar } },
      );

      res.status(200).json({
        success: true,
        mseesage: "Avatar updated successfully",
        shop,
      });
    } catch (error) {
      return next(new ErrorHandler(error.message, 500));
    }
  }),
);

//update Seller Info
router.put(
  "/update-seller-info",
  isSellerAuthenticated,
  catchAsyncError(async (req, res, next) => {
    try {
      const { shopName, description, address, phoneNumber, zipCode } = req.body;

      const shop = await Shop.findById(req.seller._id);

      if (!shop) {
        return next(new ErrorHandler("Shop not found", 400));
      }

      // Update shop information
      shop.shopName = shopName;
      shop.address = address;
      shop.phoneNumber = phoneNumber;
      shop.zipCode = zipCode;
      shop.description = description;

      await shop.save();

      // Update seller information in associated products
      await Products.updateMany(
        { shopId: req.seller._id },
        {
          $set: {
            "shop.shopName": shopName,
            "shop.address": address,
            "shop.phoneNumber": phoneNumber,
            "shop.zipCode": zipCode,
            "shop.description": description,
          },
        },
      );

      // Fetch and save each updated product document
      const updatedProducts = await Products.find({ shopId: req.seller._id });
      await Promise.all(
        updatedProducts.map(async (product) => {
          await product.save({ validateBeforeSave: false });
        }),
      );

      res.status(201).json({
        success: true,
        shop,
      });
    } catch (error) {
      return next(new ErrorHandler(error.message, 500));
    }
  }),
);

//get All seller for Admin
router.get(
  "/admin-all-sellers",
  isUserAuthenticated,
  authorizeRoles("Admin"),
  catchAsyncError(async (req, res, next) => {
    try {
      const sellers = await Shop.find().sort({
        createdAt: -1,
      });
      res.status(201).json({
        success: true,
        sellers,
      });
    } catch (error) {
      return next(new ErrorHandler(error.message, 500));
    }
  }),
);

//delete Seller for Admin
router.delete(
  "/delete-seller/:id",
  isUserAuthenticated,
  authorizeRoles("Admin"),
  catchAsyncError(async (req, res, next) => {
    try {
      const sellerId = req.params.id;
      const seller = await Shop.findById(sellerId);

      if (!seller) {
        return next(new ErrorHandler("Seller not found with this Id", 400));
      }
      seller.avatar((imageUrls) => {
        const fileName = imageUrls;
        const filePath = `uploads/${fileName}`;

        fs.unlink(filePath, (error) => {
          if (error) {
            return next(new ErrorHandler("Error trying to delete shop Avatar"));
          }
        });
      });
      await Shop.findByIdAndDelete(sellerId);

      res.status(201).json({
        success: true,
        message: "Shop deleted successfully",
      });
    } catch (error) {
      return next(new ErrorHandler(error.message, 500));
    }
  }),
);

//Update seller withdraw methods
router.put(
  "/update-payment-methods",
  isSellerAuthenticated,
  catchAsyncError(async (req, res, next) => {
    try {
      const { withdrawMethod } = req.body;

      if (!withdrawMethod?.bankName || !withdrawMethod?.accountNumber) {
        return next(
          new ErrorHandler("Bank name and account number required", 400),
        );
      }

      const shop = await Shop.findById(req.seller._id);

      // Check if this exact method already exists (avoid duplicates)
      const exists = shop.withdrawMethods.some(
        (m) =>
          m.bankName === withdrawMethod.bankName &&
          m.accountNumber === withdrawMethod.accountNumber,
      );

      if (!exists) {
        shop.withdrawMethods.push(withdrawMethod);
        await shop.save();
      }

      res.status(200).json({
        success: true,
        seller: shop,
      });
    } catch (error) {
      return next(new ErrorHandler(error.message, 500));
    }
  }),
);

//Delete seller withdraw method forseller
router.delete(
  "/delete-withdraw-method",
  isSellerAuthenticated,
  catchAsyncError(async (req, res, next) => {
    try {
      const { bankName } = req.body;

      if (!bankName) {
        return next(new ErrorHandler("Account number required", 400));
      }

      const shop = await Shop.findById(req.seller._id);

      shop.withdrawMethods = shop.withdrawMethods.filter(
        (m) => m.bankName !== bankName,
      );

      await shop.save();

      res.status(200).json({
        success: true,
        seller: shop,
      });
    } catch (error) {
      return next(new ErrorHandler(error.message, 500));
    }
  }),
);

module.exports = router;
