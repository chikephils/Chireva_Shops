const Shop = require("../model/shop");
const ErrorHandler = require("../utils/ErrorHandler");
const catchAsyncErrors = require("../middleware/CatchAsyncError");
const express = require("express");
const Withdraw = require("../model/withdraw");
const sendMail = require("../utils/sendMail");
const {
  isAuthenticated,
  authorizeRoles,
  isSellerAuthenticated,
  isUserAuthenticated,
} = require("../middleware/auth");
const router = express.Router();
const path = require("path");
const fs = require("fs");
const mongoose = require("mongoose");
const { numbersWithCommas } = require("../utils/priceDisplay");
const User = require("../model/user");
const AdminBalance = require("../model/admin");

//create withdraw request for seller
router.post(
  "/create-withdraw-request",
  isSellerAuthenticated,
  catchAsyncErrors(async (req, res, next) => {
    const session = await mongoose.startSession();
    session.startTransaction();
    try {
      const { amount, bankName, accountNumber } = req.body;

      // Validate required fields
      if (!amount || amount < 1000) {
        throw new ErrorHandler("Minimum withdrawal amount is ₦1,000", 400);
      }

      if (!bankName || !accountNumber) {
        throw new ErrorHandler(
          "Bank name and account number are required",
          400,
        );
      }

      const shop = await Shop.findById(req.seller._id).session(session);
      if (!shop) throw new ErrorHandler("Shop not found", 404);

      if (amount > shop.availableBalance) {
        throw new ErrorHandler("Insufficient funds", 400);
      }
      //prevent multiple pending withdrawals
      const existing = await Withdraw.findOne({
        seller: shop._id,
        status: "Processing",
      }).session(session);

      if (existing) {
        throw new ErrorHandler("You already have a pending withdrawal", 400);
      }

      //Deduct from shop
      shop.availableBalance -= amount;

      //Add to escrow
      const admin = await AdminBalance.findOne({ isSingleton: true }).session(
        session,
      );
      if (!admin) throw new ErrorHandler("Admin Balance not found", 500);

      admin.escrowBalance += amount;

      //save withdraw method
      const isNewMethod = !shop.withdrawMethods?.some(
        (m) => m.accountNumber === accountNumber && m.bankName === bankName,
      );

      if (isNewMethod) {
        shop.withdrawMethods = shop.withdrawMethods || [];
        shop.withdrawMethods.push({
          bankName,
          accountNumber,
          addedAt: new Date(),
        });
      }

      // MongoDB will automatically generate a unique _id for the Withdraw document
      const withdrawalId = new mongoose.Types.ObjectId();

      const withdrawalData = {
        _id: withdrawalId,
        seller: shop._id,
        withdrawalType: "seller",
        amount,
        bank: bankName,
        accountNumber,
        reference: withdrawalId.toString(),
        status: "Processing",
        escrowHandled: true,
      };

      const transaction = {
        _id: withdrawalId,
        amount: amount,
        type: "Withdrawal",
        bank: bankName,
        accountNumber,
        status: "Processing",
        reference: withdrawalId,
      };
      const withdrawal = await Withdraw.create([withdrawalData], { session });

      shop.transactions.push(transaction);
      await shop.save({ session, validateBeforeSave: false });
      await admin.save({ session });

      await session.commitTransaction();
      session.endSession();

      res.status(201).json({
        success: true,
        withdrawal: withdrawal[0],
      });

      //  send the email
      const htmlTemplatePath = path.join(
        __dirname,
        "../html/withdrawalRequest.html",
      );
      const htmlTemplate = fs.readFileSync(htmlTemplatePath, "utf-8");

      const htmlMail = htmlTemplate
        .replace("%SHOPNAME%", shop.shopName)
        .replace("%AMOUNT%", numbersWithCommas(amount))
        .replace("%BANKNAME%", bankName)
        .replace("%ACCOUNTNUMBER%", accountNumber);

      sendMail({
        email: req.seller.email,
        subject: "Withdrawal Request",
        html: htmlMail,
      }).catch((emailErr) => {
        console.error("Email send failed:", emailErr);
      });
    } catch (error) {
      await session.abortTransaction();
      session.endSession();
      return next(new ErrorHandler(error.message, 500));
    }
  }),
);

//Create withdrawal request for User
router.post(
  "/user-create-withdraw-request",
  isUserAuthenticated,
  catchAsyncErrors(async (req, res, next) => {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      const { amount, bankName, accountNumber } = req.body;

      // Validate required fields
      if (!amount || amount < 1000) {
        throw new ErrorHandler("Minimum withdrawal amount is ₦1,000", 400);
      }

      if (!bankName || !accountNumber) {
        throw new ErrorHandler(
          "Bank name and account number are required",
          400,
        );
      }
      const user = await User.findById(req.user._id).session(session);
      if (!user) throw new ErrorHandler("User not found", 404);

      if (amount > user.availableBalance) {
        throw new ErrorHandler("Insufficient funds", 400);
      }

      // prevent multiple pending withdrawals
      const existing = await Withdraw.findOne({
        user: user._id,
        status: "Processing",
      }).session(session);

      if (existing) {
        throw new ErrorHandler("You already have a pending withdrawal", 400);
      }

      user.availableBalance -= amount;

      // Add to escrow
      const admin = await AdminBalance.findOne({ isSingleton: true }).session(
        session,
      );
      if (!admin) throw new ErrorHandler("Admin balance not found", 500);

      admin.escrowBalance += amount;

      const isNewMethod = !user.withdrawMethods?.some(
        (m) => m.accountNumber === accountNumber && m.bankName === bankName,
      );

      if (isNewMethod) {
        user.withdrawMethods = user.withdrawMethods || [];
        user.withdrawMethods.push({
          bankName,
          accountNumber,
          addedAt: new Date(),
        });
      }

      // MongoDB will automatically generate a unique _id for the Withdraw document
      const withdrawalId = new mongoose.Types.ObjectId();

      const withdrawalData = {
        _id: withdrawalId,
        user: user._id,
        withdrawalType: "user",
        amount,
        bank: bankName,
        accountNumber,
        reference: withdrawalId.toString(),
        status: "Processing",
        escrowHandled: true,
      };

      const transaction = {
        _id: withdrawalId,
        amount,
        type: "Withdrawal",
        bank: bankName,
        accountNumber,
        status: "Processing",
        reference: withdrawalId,
      };

      const withdrawal = await Withdraw.create([withdrawalData], { session });

      user.transactions.push(transaction);
      await user.save({ session, validateBeforeSave: false });
      await admin.save({ session });

      await session.commitTransaction();
      session.endSession();

      res.status(201).json({
        success: true,
        withdrawal: withdrawal[0],
      });

      //  send the email
      const htmlTemplatePath = path.join(
        __dirname,
        "../html/userWithdrawalRequest.html",
      );
      const htmlTemplate = fs.readFileSync(htmlTemplatePath, "utf-8");

      const htmlMail = htmlTemplate
        .replace("%FIRST_NAME%", user.firstName)
        .replace("%LAST_NAME%", user.lastName)
        .replace("%AMOUNT%", numbersWithCommas(amount))
        .replace("%BANKNAME%", bankName)
        .replace("%ACCOUNTNUMBER%", accountNumber);

      sendMail({
        email: req.user.email,
        subject: "Withdrawal Request",
        html: htmlMail,
      }).catch((emailErr) => {
        console.error("Email send failed:", emailErr);
      });
    } catch (error) {
      await session.abortTransaction();
      session.endSession();
      return next(new ErrorHandler(error.message, 500));
    }
  }),
);

//get all Withdrawals  for admin
router.get(
  "/admin-withdrawal-requests",
  isUserAuthenticated,
  authorizeRoles("Admin"),
  catchAsyncErrors(async (req, res, next) => {
    const { type } = req.query;

    const filter = {};
    if (type) {
      filter.withdrawalType = type;
    }

    try {
      const withdrawals = await Withdraw.find(filter)
        .populate("seller", "shopName")
        .populate("user", "firstName lastName email")
        .sort({ createdAt: -1 });

      res.status(201).json({
        success: true,
        withdrawals,
      });
    } catch (error) {
      return next(new ErrorHandler(error.message, 500));
    }
  }),
);

//get a withdrawal request
router.get(
  "/get-withdraw-request/:id",
  isUserAuthenticated,
  authorizeRoles("Admin"),
  catchAsyncErrors(async (req, res, next) => {
    try {
      const withdrawal = await Withdraw.findById(req.params.id)
        .populate("seller")
        .populate("user");
      if (!withdrawal) {
        return next(new ErrorHandler("Withdrawal not found"), 404);
      }
      res.status(201).json({
        success: true,
        withdrawal,
      });
    } catch (error) {
      return next(new ErrorHandler(error.message, 500));
    }
  }),
);

//update withdraw request for admin
router.put(
  "/update-withdraw-request/:id",
  isUserAuthenticated,
  authorizeRoles("Admin"),
  catchAsyncErrors(async (req, res, next) => {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      const { status, failureReason } = req.body;
      const withdrawalId = req.params.id;

      const allowedStatuses = ["Successful", "Rejected"];

      if (!status || !allowedStatuses.includes(status)) {
        return next(
          new ErrorHandler(
            "Invalid status. Allowed: Successful, Rejected",
            400,
          ),
        );
      }

      const withdrawal = await Withdraw.findById(withdrawalId).session(session);
      if (!withdrawal) {
        throw new ErrorHandler("Withdrawal request not found", 404);
      }
      // prevent double processing
      if (withdrawal.status !== "Processing") {
        throw new ErrorHandler(
          `Withdrawal already ${withdrawal.status.toLowerCase()}`,
          400,
        );
      }

      // Get admin escrow
      const admin = await AdminBalance.findOne({ isSingleton: true }).session(
        session,
      );
      if (!admin) throw new ErrorHandler("Admin balance not found", 500);

      // Safety check
      if (!withdrawal.escrowHandled) {
        throw new ErrorHandler("Escrow not handled for this withdrawal", 400);
      }

      let account;
      let accountType;

      if (withdrawal.withdrawalType === "seller") {
        account = await Shop.findById(withdrawal.seller).session(session);
        accountType = "seller";
      } else if (withdrawal.withdrawalType === "user") {
        account = await User.findById(withdrawal.user).session(session);
        accountType = "user";
      }

      if (!account) {
        throw new ErrorHandler("Associated account not found", 404);
      }
      // Find transaction
      const transaction = account.transactions.find(
        (transaction) =>
          transaction?._id?.toString() === withdrawalId.toString(),
      );

      // Handle status update
      if (status === "Successful") {
        if (admin.escrowBalance < withdrawal.amount) {
          throw new ErrorHandler("Escrow balance inconsistency", 500);
        }
        // Remove from escrow
        admin.escrowBalance -= withdrawal.amount;

        if (transaction) {
          transaction.status = "Successful";
          transaction.updatedAt = Date.now();
        }
      }

      if (status === "Rejected") {
        if (!failureReason) {
          throw new ErrorHandler("Rejection reason is required", 400);
        }

        if (admin.escrowBalance < withdrawal.amount) {
          throw new ErrorHandler("Escrow balance inconsistency", 500);
        }
        // Remove from escrow
        admin.escrowBalance -= withdrawal.amount;

        // Refund user/seller
        account.availableBalance += withdrawal.amount;

        if (transaction) {
          transaction.status = "Rejected";
          transaction.updatedAt = Date.now();
        }

        withdrawal.failureReason = failureReason;
      }

      withdrawal.status = status;
      withdrawal.processedAt = new Date();

      await withdrawal.save({ session, validateBeforeSave: false });
      await account.save({ session, validateBeforeSave: false });
      await admin.save({ session });

      await session.commitTransaction();
      session.endSession();

      res.status(200).json({
        success: true,
        message: `Withdrawal ${status}`,
        withdrawal,
      });

      let htmlTemplatePath;
      let htmlTemplate;

      const name =
        accountType === "seller"
          ? account.shopName
          : `${account.firstName} ${account.lastName}`;

      if (status === "Successful") {
        htmlTemplatePath = path.join(
          __dirname,
          "../html/withdrawalSuccess.html",
        );

        htmlTemplate = fs.readFileSync(htmlTemplatePath, "utf-8");

        const htmlMail = htmlTemplate
          .replace("%NAME%", name)
          .replace("%AMOUNT%", numbersWithCommas(withdrawal.amount))
          .replace("%BANKNAME%", withdrawal.bank)
          .replace("%ACCOUNTNUMBER%", withdrawal.accountNumber);

        const email = account.email;

        sendMail({
          email,
          subject: "Withdrawal Successful",
          html: htmlMail,
        }).catch(console.error);
      }

      if (status === "Rejected") {
        htmlTemplatePath = path.join(
          __dirname,
          "../html/withdrawalRejected.html",
        );

        htmlTemplate = fs.readFileSync(htmlTemplatePath, "utf-8");

        let reasonBlock = "";

        if (withdrawal.failureReason) {
          reasonBlock = `
            <p style="margin-top: 20px; color: #e74c3c;">
              <strong>Reason:</strong> ${withdrawal.failureReason}
            </p>
          `;
        }

        const htmlMail = htmlTemplate
          .replace("%NAME%", name)
          .replace("%AMOUNT%", numbersWithCommas(withdrawal.amount))
          .replace("%BANKNAME%", withdrawal.bank)
          .replace("%ACCOUNTNUMBER%", withdrawal.accountNumber)
          .replace("%REASON_BLOCK%", reasonBlock);

        const email = account.email;

        sendMail({
          email,
          subject: "Withdrawal Rejected",
          html: htmlMail,
        }).catch(console.error);
      }
    } catch (error) {
      await session.abortTransaction();
      session.endSession();
      return next(new ErrorHandler(error.message, 500));
    }
  }),
);

module.exports = router;
