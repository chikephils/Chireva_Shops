const express = require("express");
const router = express.Router();
const ErrorHandler = require("../utils/ErrorHandler");
const catchAsyncErrors = require("../middleware/CatchAsyncError");
const Order = require("../model/order");
const Shop = require("../model/shop");
const User = require("../model/user");
const Product = require("../model/product");
const AdminBalance = require("../model/admin");
const {
  authorizeRoles,
  isUserAuthenticated,
  isSellerAuthenticated,
} = require("../middleware/auth");
const mongoose = require("mongoose");
const SHIPPING_PER_SHOP = Number(process.env.SHIPPING_PER_SHOP);
const BASE_FEE = Number(process.env.BASE_FEE);
const PER_VENDOR_FEE = Number(process.env.PER_VENDOR_FEE);
const PERCENTAGE_FEE = Number(process.env.PERCENTAGE_FEE);
const FLUTTERWAVE_PERCENT = Number(process.env.FLUTTERWAVE_PERCENT);
const { releaseFundsToSeller } = require("../services/payment.service");

router.post(
  "/create-order",
  isUserAuthenticated,
  catchAsyncErrors(async (req, res, next) => {
    try {
      const { cart, shippingAddress, user } = req.body;

      if (!user || !user._id)
        return next(new ErrorHandler("User info is required", 400));

      const paymentId = new mongoose.Types.ObjectId();
      const parentOrderId = new mongoose.Types.ObjectId();

      // Group items by shop
      const shopItemsMap = new Map();

      for (const item of cart) {
        const shopId = item.shopId;

        const isEventActive =
          item?.isEvent &&
          item?.eventStartDate &&
          item?.eventEndDate &&
          new Date() >= new Date(item.eventStartDate) &&
          new Date() <= new Date(item.eventEndDate);

        const priceAtPurchase = isEventActive
          ? item.discountPrice
          : item.originalPrice;
        const itemWithLockedPrice = { ...item, priceAtPurchase };

        if (!shopItemsMap.has(shopId)) shopItemsMap.set(shopId, []);
        shopItemsMap.get(shopId).push(itemWithLockedPrice);
      }

      let productTotal = 0;
      let shippingTotal = 0;

      for (const [, items] of shopItemsMap) {
        const itemsTotal = items.reduce(
          (acc, item) => acc + item.priceAtPurchase * item.quantity,
          0,
        );

        productTotal += itemsTotal;
        shippingTotal += SHIPPING_PER_SHOP;
      }

      const numberOfShops = shopItemsMap.size;

      const serviceFee = Math.ceil(
        BASE_FEE +
          PER_VENDOR_FEE * numberOfShops +
          PERCENTAGE_FEE * productTotal,
      );

      const subtotalBeforeFlutterwave =
        productTotal + shippingTotal + serviceFee;

      const totalPayable =
        subtotalBeforeFlutterwave / (1 - FLUTTERWAVE_PERCENT);

      const finalTotal = Math.ceil(totalPayable);

      const flutterwaveFee = Math.ceil(
        totalPayable - subtotalBeforeFlutterwave,
      );

      const displayedServiceFee = serviceFee + flutterwaveFee;
      const shipping = SHIPPING_PER_SHOP;
      const totalPrice = productTotal + shipping;

      const orders = [];

      for (const [shopId, items] of shopItemsMap) {
        const shop = await Shop.findById(shopId).select(
          "shopName avatar phoneNumber address",
        );

        const itemsTotal = items.reduce(
          (acc, item) => acc + item.priceAtPurchase * item.quantity,
          0,
        );

        const orderTotalPrice = itemsTotal + shipping;

        const order = await Order.create({
          cart: items,
          shippingAddress,
          user: user._id,
          userSnapshot: {
            firstName: user.firstName,
            lastName: user.lastName,
            phoneNumber: user.phoneNumber,
            avatar: user.avatar,
            email: user.email,
          },
          itemsPrice: itemsTotal,
          shipping,
          totalPrice: orderTotalPrice,
          shop: shopId,
          shopSnapshot: {
            shopName: shop.shopName,
            shopAvatar: shop.avatar,
            shopPhoneNumber: shop.phoneNumber,
            shopAddress: shop.address,
            shopEmail: shop.email,
          },
          parentOrderId,
          paymentInfo: {
            id: paymentId,
            status: false,
            totalAmount: finalTotal,
            serviceFee: serviceFee,
            flutterwaveFee: flutterwaveFee,
            totalServiceFee: displayedServiceFee,
          },
        });

        orders.push(order);
      }

      res.status(201).json({
        success: true,
        orders,
        paymentId,
        parentOrderId,
        totalPrice,
        shipping: shippingTotal,
        totalAmount: finalTotal,
        serviceFee: displayedServiceFee,
        actualServiceFee: serviceFee,
        shipping: shippingTotal,
      });
    } catch (err) {
      console.error(err);
      return next(new ErrorHandler("Failed to create order", 500));
    }
  }),
);

//get all user orders
router.get(
  "/get-all-orders/:id",
  isUserAuthenticated,
  catchAsyncErrors(async (req, res, next) => {
    try {
      if (req.user._id.toString() !== req.params.id) {
        return next(new ErrorHandler("Unauthorized", 403));
      }

      const orders = await Order.find({
        user: req.params.id,
        "paymentInfo.status": true,
      }).sort({ createdAt: -1 });

      res.status(200).json({
        success: true,
        orders,
      });
    } catch (error) {
      return next(new ErrorHandler(error.message, 500));
    }
  }),
);

// get user order details using parentOrderId.
router.get(
  "/get-order/:parentId",
  isUserAuthenticated,
  catchAsyncErrors(async (req, res, next) => {
    const parentId = req.params.parentId;

    const orders = await Order.find({ parentOrderId: parentId });

    if (!orders || orders.length === 0) {
      return next(new ErrorHandler("Order not found", 404));
    }

    // Calculate grand total
    const totalAmount = orders.reduce((acc, o) => acc + o.totalPrice, 0);

    res.status(200).json({
      success: true,
      parentOrderId: parentId,
      totalAmount,
      shippingAddress: orders[0].shippingAddress,
      orders,
    });
  }),
);

// Get all orders for a seller
router.get(
  "/get-seller-all-orders/:id",
  isSellerAuthenticated,
  catchAsyncErrors(async (req, res, next) => {
    try {
      const shopId = req.params.id;

      if (req.seller._id.toString() !== shopId) {
        return next(new ErrorHandler("Unauthorized", 403));
      }

      const orders = await Order.find({
        shop: shopId,
        "paymentInfo.status": true,
      }).sort({ createdAt: -1 });

      res.status(200).json({
        success: true,
        orders,
      });
    } catch (error) {
      return next(new ErrorHandler(error.message, 500));
    }
  }),
);

//get order details for seller
router.get(
  "/get-seller-order/:id",
  isSellerAuthenticated,
  catchAsyncErrors(async (req, res, next) => {
    try {
      const order = await Order.findById(req.params.id);

      if (!order) {
        return next(new ErrorHandler("Order not Found", 404));
      }

      if (order.shop.toString() !== req.seller._id.toString()) {
        return next(new ErrorHandler("Unauthorized access", 403));
      }

      res.status(200).json({
        success: true,
        order,
      });
    } catch (error) {
      return next(new ErrorHandler(error.message, 500));
    }
  }),
);

//update order status for seller
router.put(
  "/shop-update-order-status/:id",
  isSellerAuthenticated,
  catchAsyncErrors(async (req, res, next) => {
    const { status } = req.body;

    if (!status) {
      return next(new ErrorHandler("Status is required", 400));
    }

    const order = await Order.findById(req.params.id);

    if (!order) {
      return next(new ErrorHandler("Order not Found", 404));
    }

    const previousStatus = order.status;
    const seller = req.seller;

    const isSeller =
      seller &&
      order.shop.toString() === seller._id.toString();

    // Not authorized
    if (!isSeller) {
      return next(new ErrorHandler("Unauthorized", 403));
    }

    // CANCEL ORDER LOGIC
    if (status === "Cancelled") {
      if (previousStatus !== "Processing") {
        return next(
          new ErrorHandler("Order can only be cancelled while processing", 400),
        );
      }

      // Restore stock
      if (order.stockDeducted) {
        for (const item of order.cart) {
          await Product.findByIdAndUpdate(item._id, {
            $inc: {
              stock: item.quantity,
              sold_out: -item.quantity,
            },
          });
        }

        order.stockDeducted = false;
      }

      // Refund logic
      if (order.paymentInfo?.status === true) {
        const refundAmount = order.totalPrice;

        const adminBalance = await AdminBalance.findOne();

        if (adminBalance) {
          adminBalance.escrowBalance -= refundAmount;
          await adminBalance.save();
        }

        await User.findByIdAndUpdate(order.user, {
          $inc: { availableBalance: refundAmount },
          $push: {
            transactions: {
              amount: refundAmount,
              type: "Refund",
              status: "Successful",
              reference: order._id,
            },
          },
        });

        order.refund = {
          status: "Refunded",
          amount: refundAmount,
          processedAt: new Date(),
        };
      }

      order.status = "Cancelled";

      await order.save({ validateBeforeSave: false });

      return res.status(200).json({
        success: true,
        order,
      });
    }

    // SELLER LOGIC
    if (isSeller) {
      if (status === "Delivered") {
        return next(
          new ErrorHandler("Seller cannot mark order as delivered", 403),
        );
      }

      if (status === "Shipped") {
        if (previousStatus !== "Processing") {
          return next(
            new ErrorHandler("Order must be processing to ship", 400),
          );
        }

        order.shippedAt = new Date();
      }
    }

    // FINAL STATUS UPDATE
    order.status = status;

    await order.save({ validateBeforeSave: false });

    res.status(200).json({
      success: true,
      order,
    });
  }),
);

//update order status for user/Admin
router.put(
  "/update-order-status/:id",
  isUserAuthenticated,
  catchAsyncErrors(async (req, res, next) => {
    const { status } = req.body;

    if (!status) {
      return next(new ErrorHandler("Status is required", 400));
    }

    const order = await Order.findById(req.params.id);

    if (!order) {
      return next(new ErrorHandler("Order not Found", 404));
    }

    const previousStatus = order.status;
    const user = req.user;
    const role = req.role;

    const isAdmin = role === "Admin";

    const isBuyer =
      role === "user" && user && order.user.toString() === user._id.toString();

    // Not authorized
    if (!isBuyer && !isAdmin) {
      return next(new ErrorHandler("Unauthorized", 403));
    }

    // CANCEL ORDER LOGIC
    if (status === "Cancelled") {
      if (previousStatus !== "Processing") {
        return next(
          new ErrorHandler("Order can only be cancelled while processing", 400),
        );
      }

      // Restore stock
      if (order.stockDeducted) {
        for (const item of order.cart) {
          await Product.findByIdAndUpdate(item._id, {
            $inc: {
              stock: item.quantity,
              sold_out: -item.quantity,
            },
          });
        }

        order.stockDeducted = false;
      }

      // Refund logic
      if (order.paymentInfo?.status === true) {
        const refundAmount = order.totalPrice;

        const adminBalance = await AdminBalance.findOne();

        if (adminBalance) {
          adminBalance.escrowBalance -= refundAmount;
          await adminBalance.save();
        }

        await User.findByIdAndUpdate(order.user, {
          $inc: { availableBalance: refundAmount },
          $push: {
            transactions: {
              amount: refundAmount,
              type: "Refund",
              status: "Successful",
              reference: order._id,
            },
          },
        });

        order.refund = {
          status: "Refunded",
          amount: refundAmount,
          processedAt: new Date(),
        };
      }

      order.status = "Cancelled";

      await order.save({ validateBeforeSave: false });

      return res.status(200).json({
        success: true,
        order,
      });
    }

    // BUYER LOGIC
    if (isBuyer) {
      if (status === "Delivered") {
        order.deliveryConfirmedByBuyer = true;
        order.deliveredAt = new Date();

        await releaseFundsToSeller(order);
      }
    }

    // ADMIN LOGIC
    if (isAdmin) {
      if (status === "Shipped") {
        return next(
          new ErrorHandler("Admin cannot mark order as shipped", 403),
        );
      }

      if (status === "Cancelled") {
        return next(new ErrorHandler("Admin cannot cancel orders", 403));
      }

      if (status === "Delivered") {
        if (!["Processing", "Shipped"].includes(previousStatus)) {
          return next(new ErrorHandler("Invalid delivery transition", 400));
        }

        order.deliveredAt = new Date();
        await releaseFundsToSeller(order);
      }
    }

    // FINAL STATUS UPDATE
    order.status = status;

    await order.save({ validateBeforeSave: false });

    res.status(200).json({
      success: true,
      order,
    });
  }),
);

// Request for a refund user
router.put(
  "/order-refund/:id",
  isUserAuthenticated,
  catchAsyncErrors(async (req, res, next) => {
    const order = await Order.findById(req.params.id);

    if (!order) {
      return next(new ErrorHandler("Order not found", 404));
    }

    //Must belong to user
    if (order.user.toString() !== req.user.id) {
      return next(new ErrorHandler("Unauthorized", 403));
    }

    // Only after delivery
    if (order.status !== "Delivered") {
      return next(
        new ErrorHandler("You can only request refund after delivery", 400),
      );
    }

    //72 hours restrictions
    const deliveredAt = new Date(order.deliveredAt);
    const now = new Date();
    const diffHours = (now - deliveredAt) / (1000 * 60 * 60);

    const FORTY_EIGHT_HOURS = 48 * 60 * 60 * 1000;

    if (diffHours > FORTY_EIGHT_HOURS) {
      return next(new ErrorHandler("Refund window has expired (48 hours)"));
    }

    // Prevent duplicate request
    if (order.refund && order.refund.status !== "None") {
      return next(
        new ErrorHandler("Refund already requested or processed", 400),
      );
    }

    order.refund = {
      status: "Refund Requested",
      requestedAt: new Date(),
      amount: order.itemsPrice,
    };

    await order.save();

    res.status(200).json({
      success: true,
      message: "Refund request submitted",
      order,
    });
  }),
);

//accept the Refund by Admin
router.put(
  "/order-refund-action/:id",
  isUserAuthenticated,
  authorizeRoles("Admin"),
  catchAsyncErrors(async (req, res, next) => {
    const { status } = req.body; // "Approve" | "Reject"
    console.log("BODY:", req.body);

    const order = await Order.findById(req.params.id);

    if (!order) {
      return next(new ErrorHandler("Order not found", 404));
    }

    if (order.refund?.status !== "Refund Requested") {
      return next(new ErrorHandler("No refund request found", 400));
    }

    //  REJECT
    if (status === "Reject") {
      order.refund.status = "Refund Rejected";
      await order.save();

      return res.status(200).json({
        success: true,
        message: "Refund rejected",
      });
    }

    // APPROVE
    if (status === "Approve") {
      const refundAmount = order.itemsPrice;

      //Restore stock
      if (order.stockDeducted) {
        for (const item of order.cart) {
          await Product.findOneAndUpdate(
            { _id: item._id },
            {
              $inc: {
                stock: item.quantity,
                sold_out: -item.quantity,
              },
            },
          );
        }

        order.stockDeducted = false;
      }

      //Who to Pay refund?
      if (order.fundsReleased) {
        // Seller pays
        const shop = await Shop.findById(order.shop);

        if (!shop) {
          return next(new ErrorHandler("Shop not found", 404));
        }

        shop.availableBalance -= refundAmount;

        shop.transactions.push({
          amount: refundAmount,
          type: "Refund",
          status: "Successful",
          reference: order._id,
        });

        await shop.save();
      } else {
        // Escrow pays cus admin holds money
        const admin = await AdminBalance.findOne();

        if (admin) {
          admin.escrowBalance -= refundAmount;
          await admin.save();
        }
      }

      // CREDIT USER
      await User.findByIdAndUpdate(order.user, {
        $inc: { availableBalance: refundAmount },
        $push: {
          transactions: {
            amount: refundAmount,
            type: "Refund",
            status: "Successful",
            reference: order._id,
          },
        },
      });

      // FINALIZE REFUND
      order.refund = {
        status: "Refunded",
        amount: refundAmount,
        processedAt: new Date(),
      };

      await order.save();

      return res.status(200).json({
        success: true,
        message: "Refund processed successfully",
      });
    }

    return next(new ErrorHandler("Invalid action", 400));
  }),
);

//delete order when payment is cancelled
router.delete(
  "/delete-order",
  catchAsyncErrors(async (req, res, next) => {
    try {
      const { transaction_Id } = req.body;
      console.log(transaction_Id);
      const orders = await Order.deleteMany({
        "paymentInfo.transactionId": transaction_Id,
      });
      res.status(201).json({
        success: true,
        deletedCount: orders.deletedCount,
      });
    } catch (error) {
      return next(new ErrorHandler(error.message, 500));
    }
  }),
);

//all orders for Admin
router.get(
  "/admin-all-orders/",
  isUserAuthenticated,
  authorizeRoles("Admin"),
  catchAsyncErrors(async (req, res, next) => {
    try {
      const orders = await Order.find().sort({
        createdAt: -1,
      });
      res.status(201).json({
        success: true,
        orders,
      });
    } catch (error) {
      return next(new ErrorHandler(error.message, 500));
    }
  }),
);

//Get Order
router.get(
  "/admin-order-details/:id",
  isUserAuthenticated,
  authorizeRoles("Admin"),
  catchAsyncErrors(async (req, res, next) => {
    try {
      const order = await Order.findById(req.params.id);

      if (!order) {
        return next(new ErrorHandler("Order not found", 404));
      }
      await order.populate("shop");
      res.status(201).json({
        success: true,
        order,
      });
    } catch (error) {
      return next(new ErrorHandler(error.message, 500));
    }
  }),
);

module.exports = router;
