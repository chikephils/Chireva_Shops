const Conversation = require("../model/conversation");
const ErrorHandler = require("../utils/ErrorHandler");
const catchAsyncErrors = require("../middleware/CatchAsyncError");
const express = require("express");
const {
  isUserAuthenticated,
  isSellerAuthenticated,
  isAuthenticated,
} = require("../middleware/auth");

const router = express.Router();

//Create new conversation
router.post(
  "/create-new-conversation",
  isAuthenticated,
  catchAsyncErrors(async (req, res, next) => {
    try {
      const { groupTitle, userId, sellerId } = req.body;

      if (!groupTitle || !userId || !sellerId) {
        return next(
          new ErrorHandler(
            "groupTitle, userId, and sellerId are required",
            400,
          ),
        );
      }

      // Find by groupTitle (buyer + seller pair)
      let conversation = await Conversation.findOne({ groupTitle });

      if (conversation) {
        return res.status(200).json({
          success: true,
          conversation,
        });
      }

      // Create new
      conversation = await Conversation.create({
        groupTitle,
        members: [userId, sellerId],
      });

      res.status(201).json({
        success: true,
        conversation,
      });
    } catch (error) {
      return next(new ErrorHandler(error.message, 500));
    }
  }),
);

//get seller conversation
router.get(
  "/get-all-conversation-seller/:id",
  isSellerAuthenticated,
  catchAsyncErrors(async (req, res, next) => {
    try {
      const conversations = await Conversation.find({
        members: {
          $in: [req.params.id],
        },
      }).sort({ updatedAt: -1, createdAt: -1 });

      res.status(200).json({
        success: true,
        conversations,
      });
    } catch (error) {
      return next(new ErrorHandler(error.message), 500);
    }
  }),
);

//get user conversations
router.get(
  "/get-all-conversation-user/:id",
  isUserAuthenticated,
  catchAsyncErrors(async (req, res, next) => {
    try {
      const conversations = await Conversation.find({
        members: {
          $in: [req.params.id],
        },
      }).sort({ updatedAt: -1, createdAt: -1 });

      res.status(201).json({
        success: true,
        conversations,
      });
    } catch (error) {
      return next(new ErrorHandler(error.message), 500);
    }
  }),
);

//get a particular conversation
router.get(
  "/get-conversation/:id",
  isAuthenticated,
  catchAsyncErrors(async (req, res, next) => {
    try {
      const conversation = await Conversation.findById(req.params.id);

      if (!conversation) {
        return next(new ErrorHandler("Conversation not found", 404));
      }

      res.status(201).json({
        success: true,
        conversation,
      });
    } catch (error) {
      return next(new ErrorHandler(error.message), 500);
    }
  }),
);

module.exports = router;
