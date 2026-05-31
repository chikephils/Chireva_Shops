const ErrorHandler = require("../utils/ErrorHandler");
const catchAsyncErrors = require("./CatchAsyncError");
const jwt = require("jsonwebtoken");
const User = require("../model/user");
const Shop = require("../model/shop");

exports.isUserAuthenticated = catchAsyncErrors(async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (authHeader && authHeader.startsWith("Bearer ")) {
      token = authHeader.split(" ")[1];
    }

    if (!token) {
      return next(new ErrorHandler("Please login to continue", 401));
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);

    if (decoded.role !== "user" && decoded.role !== "Admin") {
      return next(new ErrorHandler("Unauthorized access", 403));
    }

    req.role = decoded.role;
    req.user = await User.findById(decoded.id);

    if (!req.user) {
      return next(new ErrorHandler("User not found", 404));
    }

    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: "Invalid or expired token",
    });
  }
});

exports.isSellerAuthenticated = catchAsyncErrors(async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (authHeader && authHeader.startsWith("Bearer ")) {
      token = authHeader.split(" ")[1];
    }

    if (!token) {
      return next(new ErrorHandler("Please login to continue", 401));
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);

    if (decoded.role !== "seller") {
      return next(new ErrorHandler("Unauthorized access", 403));
    }

    req.role = decoded.role;
    req.seller = await Shop.findById(decoded.id);

    if (!req.seller) {
      return next(new ErrorHandler("Seller not found", 404));
    }

    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: "Invalid or expired token",
    });
  }
});

exports.isAuthenticated = catchAsyncErrors(async (req, res, next) => {
  try {
    let token;

    const authHeader = req.headers.authorization;

    if (authHeader && authHeader.startsWith("Bearer ")) {
      token = authHeader.split(" ")[1];
    }

    if (!token) {
      return next(new ErrorHandler("Please login to continue", 403));
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);

    req.role = decoded.role;

    // USER
    if (decoded.role === "user" || decoded.role === "Admin") {
      req.user = await User.findById(decoded.id);

      if (!req.user) {
        return next(new ErrorHandler("User not found", 404));
      }
    }

    //SELLER
    else if (decoded.role === "seller") {
      req.seller = await Shop.findById(decoded.id);

      if (!req.seller) {
        return next(new ErrorHandler("Seller not found", 404));
      }
    } else {
      return next(new ErrorHandler("Unauthorized access", 403));
    }

    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: "Invalid or expired token",
    });
  }
});

exports.authorizeRoles = (...roles) => {
  return (req, res, next) => {
    if (!req.role) {
      return next(new ErrorHandler("Unauthorized", 403));
    }

    if (!roles.includes(req.role)) {
      return next(
        new ErrorHandler(`${req.role} cannot access this resource`, 403),
      );
    }

    next();
  };
};
