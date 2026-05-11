const express = require("express");
const router = express.Router();
const Flutterwave = require("flutterwave-node-v3");
const ErrorHandler = require("../utils/ErrorHandler");
const catchAsyncErrors = require("../middleware/CatchAsyncError");
const Order = require("../model/order");
const request = require("request");
const User = require("../model/user");
const Product = require("../model/product");
const AdminBalance = require("../model/admin");
const { isUserAuthenticated } = require("../middleware/auth");

// Endpoint to verify payment
router.get(
  "/verify-payment",
  catchAsyncErrors(async (req, res, next) => {
    const { tx_ref, transaction_id } = req.query;

    if (!tx_ref) {
      return next(new ErrorHandler("tx_ref is required", 400));
    }

    // Find all orders with this paymentId
    const orders = await Order.find({ "paymentInfo.id": tx_ref });

    if (!orders || orders.length === 0) {
      return next(new ErrorHandler("No orders found for this payment", 404));
    }

    const alreadyPaid = orders.every(
      (order) => order.paymentInfo.status === true,
    );
    if (alreadyPaid) {
      return res.status(200).json({
        success: true,
        status: "success",
        message: "Payment already verified",
      });
    }

    // Initialize Flutterwave
    const flw = new Flutterwave(
      process.env.FLUTTERWAVE_PUBLIC_KEY,
      process.env.FLUTTERWAVE_SECRET_KEY,
    );

    let response;
    try {
      response = await flw.Transaction.verify({ id: transaction_id });
    } catch (err) {
      console.error("Flutterwave verify error:", err);
      return next(new ErrorHandler("Payment verification failed", 500));
    }

    const flwData = response?.data;

    if (!flwData || flwData.status !== "successful") {
      return res.status(400).json({
        success: false,
        status: "failed",
        message: "Payment was not successful on Flutterwave",
      });
    }

    // Calculate expected total
    const expectedAmount = orders[0]?.paymentInfo?.totalAmount;
    const expectedCurrency = "NGN";

    // Validate payment details
    const isValidPayment =
      flwData.tx_ref === tx_ref &&
      Number(flwData.amount) >= Number(expectedAmount) &&
      flwData.currency === expectedCurrency;

    if (!isValidPayment) {
      return res.status(400).json({
        success: false,
        status: "failed",
        message: "Payment amount or details mismatch",
      });
    }

    let admin = await AdminBalance.findOne();

    if (!admin) {
      admin = await AdminBalance.create({});
    }

    const totalAmount = orders[0]?.paymentInfo?.totalAmount;

    const serviceFee = orders[0]?.paymentInfo?.totalServiceFee;

    if (admin.escrowBalance == null) admin.escrowBalance = 0;
    if (admin.profitBalance == null) admin.profitBalance = 0;

    //Add profit and escrow balance
    admin.escrowBalance += totalAmount;
    admin.profitBalance += serviceFee;

    await admin.save();

    for (const order of orders) {
      if (!order.stockDeducted) {
        for (const item of order.cart) {
          const product = await Product.findById(item._id);

          if (!product) {
            return next(new ErrorHandler("Product not found", 404));
          }

          if (product.stock < item.quantity) {
            return next(
              new ErrorHandler(`Insufficient stock for ${product.name}`, 400),
            );
          }

          await Product.findOneAndUpdate(
            { _id: item._id, stock: { $gte: item.quantity } },
            {
              $inc: {
                stock: -item.quantity,
                sold_out: item.quantity,
              },
            },
          );
        }

        order.stockDeducted = true;
        await order.save({ validateBeforeSave: false });
      }
    }
    // Update orders under this paymentId
    await Order.updateMany(
      { "paymentInfo.id": tx_ref },
      {
        $set: {
          "paymentInfo.status": true,
          "paymentInfo.type": flwData.payment_type,
          "paymentInfo.transactionId": transaction_id,
          "paymentInfo.response": flwData,
          paidAt: new Date(flwData.created_at || Date.now()),
        },
      },
    );

    return res.status(200).json({
      success: true,
      status: "success",
      message: "Payment verified and orders updated successfully",
    });
  }),
);

//Verify Payment with Balance
router.get(
  "/verify-balance-payment",
  isUserAuthenticated,
  catchAsyncErrors(async (req, res, next) => {
    const { tx_ref } = req.query;

    if (!tx_ref) {
      return next(new ErrorHandler("tx_ref  is required", 400));
    }

    // Find all orders tied to this paymentId
    const orders = await Order.find({ "paymentInfo.id": tx_ref });

    if (!orders || orders.length === 0) {
      return next(new ErrorHandler("No orders found for this payment", 404));
    }

    // Prevent double verification
    const alreadyPaid = orders.every(
      (order) => order.paymentInfo.status === true,
    );
    if (alreadyPaid) {
      return res.status(200).json({
        success: true,
        status: "success",
        message: "Payment already completed",
      });
    }

    const userId = orders[0]?.user;
    const user = await User.findById(userId);

    const allSameUser = orders.every(
      (order) => order.user.toString() === userId.toString(),
    );

    if (!allSameUser) {
      return next(new ErrorHandler("Orders belong to different users", 400));
    }

    if (!user) {
      return next(new ErrorHandler("User not found", 404));
    }

    const totalAmount = orders[0]?.paymentInfo?.totalAmount;

    const serviceFee = orders[0]?.paymentInfo?.serviceFee;

    if (user.availableBalance < totalAmount) {
      return next(
        new ErrorHandler("Insufficient balance to complete payment", 400),
      );
    }
    user.availableBalance -= totalAmount;

    user.transactions.push({
      amount: totalAmount,
      type: "Purchase",
      status: "Successful",
      reference: tx_ref,
      createdAt: new Date(),
    });

    await user.save({ validateBeforeSave: false });

    let admin = await AdminBalance.findOne();

    if (!admin) {
      admin = await AdminBalance.create({});
    }

    if (admin.escrowBalance == null) admin.escrowBalance = 0;
    if (admin.profitBalance == null) admin.profitBalance = 0;

    //Add profit and escrow balance
    admin.escrowBalance += totalAmount;
    admin.profitBalance += serviceFee;

    await admin.save({ validateBeforeSave: false });

    for (const order of orders) {
      if (!order.stockDeducted) {
        for (const item of order.cart) {
          const product = await Product.findById(item._id);

          if (!product) {
            return next(new ErrorHandler("Product not found", 404));
          }

          if (product.stock < item.quantity) {
            return next(
              new ErrorHandler(`Insufficient stock for ${product.name}`, 400),
            );
          }

          product.stock -= item.quantity;
          product.sold_out += item.quantity;

          await Product.findOneAndUpdate(
            { _id: item._id, stock: { $gte: item.quantity } },
            {
              $inc: {
                stock: -item.quantity,
                sold_out: item.quantity,
              },
            },
          );
        }

        order.stockDeducted = true;
        await order.save({ validateBeforeSave: false });
      }
    }

    await Order.updateMany(
      { "paymentInfo.id": tx_ref },
      {
        $set: {
          "paymentInfo.status": true,
          "paymentInfo.type": "Balance",
          "paymentInfo.transactionId": tx_ref,
          paidAt: new Date(),
        },
      },
    );
    return res.status(200).json({
      success: true,
      status: "success",
      message: "Payment completed with balance",
    });
  }),
);

// Endpoint to get banks for payment
router.get(
  "/banks/flutterwave",
  catchAsyncErrors(async (req, res, next) => {
    try {
      const options = {
        method: "GET",
        url: "https://api.flutterwave.com/v3/banks/NG",
        headers: {
          Authorization: process.env.FLUTTERWAVE_SECRET_KEY,
        },
      };

      request(options, function (error, response, body) {
        if (error) {
          return next(new ErrorHandler(error.message, 500));
        }

        // Check if the response status code is 200 (OK)
        if (response.statusCode === 200) {
          const responseData = JSON.parse(body);
          res.json({
            success: true,
            banks: responseData.data,
          });
        } else {
          console.error(
            "Request to Flutterwave failed with status code:",
            response.statusCode,
          );
          res.json({
            success: false,
            message: "Request to Flutterwave failed",
          });
        }
      });
    } catch (error) {
      next(new ErrorHandler(error.message, 500));
    }
  }),
);

module.exports = router;
