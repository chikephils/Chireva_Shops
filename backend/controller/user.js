const express = require("express");
const User = require("../model/user");
const path = require("path");
const router = express.Router();
const ErrorHandler = require("../utils/ErrorHandler");
const catchAsyncErrors = require("../middleware/CatchAsyncError");
const fs = require("fs");
const jwt = require("jsonwebtoken");
const sendMail = require("../utils/sendMail");
const sendToken = require("../utils/jwtToken");

const {
  isAuthenticated,
  authorizeRoles,
  isUserAuthenticated,
} = require("../middleware/auth");
const cloudinary = require("cloudinary");
const bcrypt = require("bcryptjs");
const Products = require("../model/product");
const Order = require("../model/order");
const AdminBalance = require("../model/admin");

//Create User
router.post("/create-user", async (req, res, next) => {
  try {
    const { firstName, lastName, email, password, avatar } = req.body;

    const existingUser = await User.findOne({ email });

    if (existingUser) {
      return next(new ErrorHandler("User already exists", 400));
    }

    const user = {
      firstName,
      lastName,
      email,
      password,
      avatar,
    };

    const activationToken = createActivationToken(user);
    const activationURL = `${process.env.CLIENT_URL}/activation?token=${activationToken}`;

    //Read HTML template file
    const htmlTemplatePath = path.join(
      __dirname,
      "../html/userActivationMail.html",
    );
    const htmlTemplate = fs.readFileSync(htmlTemplatePath, "utf-8");

    //Replace place holders with dynamic values
    const htmlMail = htmlTemplate
      .replace("%FIRST_NAME%", firstName)
      .replace("%LAST_NAME%", lastName)
      .replace("%ACTIVATION_URL%", activationURL);

    try {
      await sendMail({
        email,
        subject: "Activate your Account",
        html: htmlMail,
      });
      res.status(201).json({
        success: true,
        message: `Please check your email: ${email} to activate your account`,
      });
    } catch (emailErr) {
      console.log(emailErr);
    }
  } catch (error) {
    return next(new ErrorHandler(error.message, 400));
  }
});

//create Activation Token
const createActivationToken = (user) => {
  return jwt.sign(user, process.env.ACTIVATION_SECRET, {
    expiresIn: "5m",
  });
};

//activate User
router.post(
  "/activation",
  catchAsyncErrors(async (req, res, next) => {
    const { activation_token } = req.body;

    if (!activation_token) {
      return next(new ErrorHandler("Activation token missing", 400));
    }

    let decoded;

    try {
      decoded = jwt.verify(activation_token, process.env.ACTIVATION_SECRET);
    } catch (error) {
      return next(new ErrorHandler("Invalid or expired activation token", 400));
    }

    const { firstName, lastName, email, password, avatar } = decoded;

    // Prevent duplicate accounts
    const existingUser = await User.findOne({ email });

    if (existingUser) {
      return next(new ErrorHandler("User already exists", 400));
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

    //: Hash password
    const hashedPassword = await bcrypt.hash(password, 12);

    //  Create user
    const user = await User.create({
      firstName,
      lastName,
      email,
      password: hashedPassword,
      avatar: uploadedAvatar,
      role: "user",
    });

    //  Login user (cookie)
    sendToken(user, 201, res, "Account activated successfully");

    //Send welcome email
    const htmlTemplatePath = path.join(
      __dirname,
      "../html/userCreatedSuccess.html",
    );

    const htmlTemplate = fs.readFileSync(htmlTemplatePath, "utf-8");

    const htmlMail = htmlTemplate
      .replace("%FIRST_NAME%", user.firstName)
      .replace("%LAST_NAME%", user.lastName)
      .replace("%LOGIN%", `${process.env.CLIENT_URL}/login`);

    sendMail({
      email: user.email,
      subject: "Welcome to CHIREVA",
      html: htmlMail,
    }).catch((err) => console.log("Email error:", err));
  }),
);

//Request forgot password
router.post(
  "/forgot-password",
  catchAsyncErrors(async (req, res, next) => {
    try {
      const { email } = req.body;

      if (!email) {
        return next(
          new ErrorHandler("Please Provide a registered Email address", 400),
        );
      }

      const user = await User.findOne({ email });

      if (!user) {
        return next(
          new ErrorHandler("Email not associated with any account", 400),
        );
      }

      const passwordResetToken = jwt.sign(
        { _id: user._id },
        process.env.RESET_SECRET,
        {
          expiresIn: "2m",
        },
      );
      const passwordResetURL = `${process.env.CLIENT_URL}/password-reset/reset?token=${resetToken}`;

      const htmlTemplatePath = path.join(
        __dirname,
        "../html/userPasswordReset.html",
      );
      const htmlTemplate = fs.readFileSync(htmlTemplatePath, "utf-8");

      const htmlMail = htmlTemplate
        .replace("%NAME%", user.firstName)
        .replace("%RESET_URL%", passwordResetURL);

      try {
        await sendMail({
          email: user.email,
          subject: "Password Reset",
          html: htmlMail,
        });
        res.status(201).json({
          success: true,
          message: `Please check your email: ${user.email} to reset your account password`,
        });
      } catch (emailErr) {
        console.log(emailErr);
      }
    } catch (error) {
      return next(new ErrorHandler(error.message, 500));
    }
  }),
);

//verify token
router.post(
  "/verify-token",
  catchAsyncErrors(async (req, res, next) => {
    try {
      const { reset_Token } = req.body;

      if (!reset_Token) {
        return next(new ErrorHandler("No Token Found", 400));
      }

      try {
        const decoded = jwt.verify(reset_Token, process.env.RESET_SECRET);

        const user = await User.findById(decoded._id);

        if (!user) {
          res.json({
            success: false,
            message: "Invalid User",
          });
        } else {
          res.json({
            success: true,
            message: "Token is valid",
          });
        }
      } catch (error) {
        res.json({
          success: false,
          message: "Token has expired or is invalid",
        });
      }
    } catch (error) {
      next(new ErrorHandler(error.message, 500));
    }
  }),
);

//create new password
router.post(
  "/new-password/:id",
  catchAsyncErrors(async (req, res, next) => {
    try {
      const { id } = req.params;
      const { password, confirmPassword } = req.body;

      if (!password || !confirmPassword) {
        return next(
          new ErrorHandler("Password or Confirmed Password not found"),
        );
      }

      if (password !== confirmPassword) {
        return next(new ErrorHandler("Passwords do not match", 400));
      }

      const hashedPassword = await bcrypt.hash(password, 12);

      const updatedUser = await User.findByIdAndUpdate(id, {
        password: hashedPassword,
      });

      if (!updatedUser) {
        return next(new ErrorHandler("User not found", 404));
      }

      await updatedUser.save();

      res.status(200).json({
        success: true,
        message: "Password updated successfully",
      });
    } catch (error) {
      return next(new ErrorHandler(error.message, 500));
    }
  }),
);

//login user
router.post(
  "/login-user",
  catchAsyncErrors(async (req, res, next) => {
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        return next(new ErrorHandler("Please provide all fields", 400));
      }
      const user = await User.findOne({ email: email.toLowerCase() }).select(
        "+password",
      );

      if (!user) {
        return next(new ErrorHandler("User does not exist", 400));
      }

      const isPasswordValid = await bcrypt.compare(password, user.password);

      if (!isPasswordValid) {
        return next(new ErrorHandler("Incorrect Password", 400));
      }

      const token = jwt.sign(
        { id: user._id, role: user.role || "user" },
        process.env.JWT_SECRET_KEY,
        {
          expiresIn: "1d",
        },
      );
      const cookieOptions = {
        httpOnly: true,
        secure: true,
        sameSite: "none",
        maxAge: 24 * 60 * 60 * 1000,
        path: "/",
      };

      res.cookie("user_token", token, cookieOptions);

      user.password = undefined;

      res
        .status(200)
        .json({ success: true, user, message: "Logged in sucessfully" });
    } catch (error) {
      return next(new ErrorHandler(error.message, 500));
    }
  }),
);

//load user
router.get(
  "/getuser",
  isUserAuthenticated,
  catchAsyncErrors(async (req, res, next) => {
    try {
      const user = await User.findById(req.user.id);

      if (!user) {
        return next(new ErrorHandler("User doesn't exist", 400));
      }
      res.status(200).json({
        success: true,
        user,
      });
    } catch (err) {
      return next(new ErrorHandler(err.message, 500));
    }
  }),
);

router.get(
  "/me",
  isUserAuthenticated,
  catchAsyncErrors(async (req, res, next) => {
    try {
      const user = await User.findById(req.user._id || req.user.id);

      if (!user) {
        return next(new ErrorHandler("User doesn't exist", 400));
      }

      res.status(200).json({
        success: true,
        user,
        role: req.role || "user",
      });
    } catch (error) {
      return next(new ErrorHandler(error.message, 500));
    }
  }),
);

//log out User
router.get(
  "/logout",
  isUserAuthenticated,
  catchAsyncErrors(async (req, res, next) => {
    try {
      res.clearCookie("user_token", {
        httpOnly: true,
        secure: false,
        sameSite: "lax",
        path: "/",
      });
      res.status(201).json({
        success: true,
        message: "Logged out successfully",
      });
    } catch (err) {
      return next(new ErrorHandler(err.message, 500));
    }
  }),
);

//update user info
router.put(
  "/update-user-info",
  isUserAuthenticated,
  catchAsyncErrors(async (req, res, next) => {
    try {
      const { email, password, phoneNumber, firstName, lastName } = req.body;

      const user = await User.findById(req.user._id);

      if (!user) {
        return next(new ErrorHandler("User not found", 400));
      }

      const isPasswordValid = await bcrypt.compare(password, user.password);

      if (!isPasswordValid) {
        return next(new ErrorHandler("Incorrect password", 400));
      }

      // Update user information
      user.firstName = firstName;
      user.lastName = lastName;
      user.email = email;
      user.phoneNumber = phoneNumber;

      await user.save();

      // Update user information in product reviews
      await Products.updateMany(
        { "reviews.user._id": req.user.id },
        {
          $set: {
            "reviews.$[elem].user.firstName": firstName,
            "reviews.$[elem].user.lastName": lastName,
            "reviews.$[elem].user.email": email,
            "reviews.$[elem].user.phoneNumber": phoneNumber,
          },
        },
        { arrayFilters: [{ "elem.user._id": req.user.id }] },
      );

      // Fetch and save each updated product document
      const updatedProducts = await Products.find({
        "reviews.user._id": req.user.id,
      });
      await Promise.all(
        updatedProducts.map(async (product) => {
          await product.save({ validateBeforeSave: false });
        }),
      );

      //Update user info in Orders
      await Order.updateMany(
        { "user._id": req.user._id },
        {
          $set: {
            "user.firstName": firstName,
            "user.lastName": lastName,
            "user.email": email,
            "user.phoneNumber": phoneNumber,
          },
        },
      );

      delete user.password;

      res.status(201).json({
        success: true,
        user,
      });
    } catch (error) {
      return next(new ErrorHandler(error.message, 500));
    }
  }),
);

// update user avatar
router.put(
  "/update-avatar",
  isUserAuthenticated,
  catchAsyncErrors(async (req, res, next) => {
    try {
      const user = await User.findById(req.user._id);
      const imageId = user.avatar.public_id;

      await cloudinary.v2.uploader.destroy(imageId);

      const myCloud = await cloudinary.v2.uploader.upload(req.body.avatar, {
        folder: "avatars",
      });

      // Update the user's avatar information
      user.avatar = {
        public_id: myCloud.public_id,
        url: myCloud.secure_url,
      };

      // Save the updated user information
      await user.save();

      // Update user information in product reviews
      await Products.updateMany(
        { "reviews.user._id": req.user.id },
        { $set: { "reviews.$[elem].user.avatar": user.avatar } },
        { arrayFilters: [{ "elem.user._id": req.user.id }] },
      );

      // Fetch and save each updated product document
      const updatedProducts = await Products.find({
        "reviews.user._id": req.user.id,
      });
      await Promise.all(
        updatedProducts.map(async (product) => {
          await product.save({ validateBeforeSave: false });
        }),
      );

      // Sync avatar in Orders
      await Order.updateMany(
        { "user._id": req.user._id },
        {
          $set: {
            "user.avatar": user.avatar,
          },
        },
      );

      delete user.password;

      res.status(200).json({
        success: true,
        user: user,
      });
    } catch (error) {
      return next(new ErrorHandler(error.message, 500));
    }
  }),
);

//update user addressses
router.put(
  "/update-user-addresses",
  isUserAuthenticated,
  catchAsyncErrors(async (req, res, next) => {
    try {
      const user = await User.findById(req.user.id);

      const sameTypeAddress = user.addresses.find(
        (address) => address.addressType === req.body.addressType,
      );
      if (sameTypeAddress) {
        return next(
          new ErrorHandler(
            `${req.body.addressType} Address type already exists`,
          ),
        );
      }
      const existsAddress = user.addresses.find(
        (address) => address._id === req.body._id,
      );

      if (existsAddress) {
        Object.assign(existsAddress, req.body);
      } else {
        user.addresses.push(req.body);
      }

      await user.save();

      res.status(200).json({
        success: true,
        user,
      });
    } catch (error) {
      return next(new ErrorHandler(error.message, 500));
    }
  }),
);

//delete user Address
router.delete(
  "/delete-user-address/:id",
  isUserAuthenticated,
  catchAsyncErrors(async (req, res, next) => {
    try {
      const userId = req.user._id;
      const addressId = req.params.id;

      const updatedUser = await User.findOneAndUpdate(
        { _id: userId },
        { $pull: { addresses: { _id: addressId } } },
        { new: true, runValidators: true },
      ).select("-password");

      if (!updatedUser) {
        return next(new ErrorHandler("User not found", 404));
      }

      res.status(200).json({
        success: true,
        message: "Address deleted successfully",
        user: updatedUser,
      });
    } catch (error) {
      return next(new ErrorHandler(error.message, 500));
    }
  }),
);

//Update User withdraw methods
router.put(
  "/update-user-withdrawal-methods",
  isUserAuthenticated,
  catchAsyncErrors(async (req, res, next) => {
    try {
      const { withdrawMethod } = req.body;

      if (!withdrawMethod?.bankName || !withdrawMethod?.accountNumber) {
        return next(
          new ErrorHandler("Bank name and account number required", 400),
        );
      }

      const user = await User.findById(req.user._id);

      // Check if this exact method already exists to avoid duplicates
      const exists = user.withdrawMethods.some(
        (m) =>
          m.bankName === withdrawMethod.bankName &&
          m.accountNumber === withdrawMethod.accountNumber,
      );

      if (!exists) {
        user.withdrawMethods.push(withdrawMethod);
        await user.save();
      }

      res.status(200).json({
        success: true,
        user: user,
      });
    } catch (error) {
      return next(new ErrorHandler(error.message, 500));
    }
  }),
);

//Update user withdrawal methord
router.delete(
  "/delete-user-withdraw-method",
  isUserAuthenticated,
  catchAsyncErrors(async (req, res, next) => {
    try {
      const { bankName } = req.body;

      if (!bankName) {
        return next(new ErrorHandler("Account number required", 400));
      }

      const user = await User.findById(req.user._id);

      user.withdrawMethods = user.withdrawMethods.filter(
        (m) => m.bankName !== bankName,
      );

      await user.save();

      res.status(200).json({
        success: true,
        user: user,
      });
    } catch (error) {
      return next(new ErrorHandler(error.message, 500));
    }
  }),
);

//update user Password
router.put(
  "/update-user-password",
  isUserAuthenticated,
  catchAsyncErrors(async (req, res, next) => {
    try {
      const user = await User.findById(req.user.id);

      const isPasswordMatched = await bcrypt.compare(
        req.body.oldPassword,
        user.password,
      );

      if (!isPasswordMatched) {
        return next(new ErrorHandler("Old Password is Incorrect", 400));
      }

      if (req.body.newPassword !== req.body.confirmPassword) {
        return next(new ErrorHandler("Password do not Match", 400));
      }

      const hashedPassword = await bcrypt.hash(req.body.newPassword, 12);

      user.password = hashedPassword;
      await user.save();

      res.status(200).json({
        success: true,
        message: "Password updated successfully",
      });
    } catch (error) {
      return next(new ErrorHandler(error.message, 500));
    }
  }),
);

//find user Information with userId
router.get(
  "/user-info/:id",
  catchAsyncErrors(async (req, res, next) => {
    try {
      const user = await User.findById(req.params.id);

      res.status(201).json({
        success: true,
        user,
      });
    } catch (error) {
      return next(new ErrorHandler(error.message, 500));
    }
  }),
);

//all User for admin
router.get(
  "/admin-all-users",
  isUserAuthenticated,
  authorizeRoles("Admin"),
  catchAsyncErrors(async (req, res, next) => {
    try {
      const users = await User.find().sort({
        createdAt: -1,
      });
      res.status(201).json({
        success: true,
        users,
      });
    } catch (error) {
      return next(new ErrorHandler(error.message, 500));
    }
  }),
);

//delete User for admin
router.delete(
  "/delete-user/:id",
  isUserAuthenticated,
  authorizeRoles("Admin"),
  catchAsyncErrors(async (req, res, next) => {
    try {
      const userId = req.params.id;

      if (!mongoose.isValidObjectId(userId)) {
        return next(new ErrorHandler("Invalid user ID format", 400));
      }

      const user = await User.findById(userId);

      if (!user) {
        return next(new ErrorHandler("User not found", 404));
      }

      if (user._id.toString() === req.user._id.toString()) {
        return next(new ErrorHandler("Admins cannot delete themselves", 403));
      }

      if (user.avatar?.public_id) {
        try {
          await cloudinary.v2.uploader.destroy(user.avatar.public_id);
        } catch (cloudErr) {
          console.error("Cloudinary delete failed (non-critical):", cloudErr);
          // Continue — don't fail logout over avatar delete
        }
      }

      await User.findByIdAndDelete(userId);

      //Clean up reviews
      await Products.updateMany(
        { "reviews.user._id": userId },
        { $pull: { reviews: { "user._id": userId } } },
      );

      //Clean up Orders
      await Order.updateMany({ "user._id": userId }, { $unset: { user: "" } });

      res.status(201).json({
        success: true,
        message: "User deleted successfully",
      });
    } catch (error) {
      return next(new ErrorHandler(error.message, 500));
    }
  }),
);

//get Admin Balance
router.get(
  "/admin-balance",
  isUserAuthenticated,
  authorizeRoles("Admin"),
  catchAsyncErrors(async (req, res, next) => {
    let admin = await AdminBalance.findOne();

    if (!admin) {
      admin = await AdminBalance.create({});
    }

    res.status(200).json({
      success: true,
      escrowBalance: admin.escrowBalance,
      profitBalance: admin.profitBalance,
    });
  }),
);

module.exports = router;
