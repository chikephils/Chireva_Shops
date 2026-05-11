const express = require("express");
const Messages = require("../model/messages");
const Conversation = require("../model/conversation");
const ErrorHandler = require("../utils/ErrorHandler");
const catchAsyncErrors = require("../middleware/CatchAsyncError");
const router = express.Router();
const cloudinary = require("cloudinary");
const { isAuthenticated } = require("../middleware/auth");

// create new message
router.post(
  "/create-new-message",
  isAuthenticated,
  catchAsyncErrors(async (req, res, next) => {
    try {
      const { conversationId, sender, text, images } = req.body;

      //Validate conversation
      const conversation = await Conversation.findById(conversationId);
      if (!conversation) {
        return next(new ErrorHandler("Conversation not Found", 404));
      }
      if (!conversation.members.includes(sender)) {
        return next(new ErrorHandler("Nor authorized", 403));
      }

      //Upload Image if present
      let uploadedImage = null;
      if (images && typeof images === "string" && images.startsWith("data")) {
        const myCloud = await cloudinary.v2.uploader.upload(images, {
          folder: "messages",
        });
        uploadedImage = {
          public_id: myCloud.public_id,
          url: myCloud.secure_url,
        };
      }

      const message = await Messages.create({
        conversation: conversationId,
        sender,
        text: text?.trim() || null,
        images: uploadedImage || undefined,
      });

      const preview =
        text?.trim().substring(0, 120) || (uploadedImage ? "Photo" : "");

      await Conversation.findByIdAndUpdate(conversationId, {
        lastMessage: message._id,
        lastMessagePreview: preview,
        updatedAt: new Date(),
      });

      //Send real-time notification
      const io = req.app.get("io");
      const receiverId = conversation.members.find(
        (m) => m.toString() !== sender.toString(),
      );

      if (io && receiverId) {
        io.to(receiverId.toString()).emit("newMessage", {
          ...message.toObject(),
          conversationId: conversationId.toString(),
        });
      }

      // Also send back to sender (so optimistic message gets real _id & timestamp)
      if (io) {
        io.to(sender.toString()).emit("newMessage", {
          ...message.toObject(),
          conversationId: conversationId.toString(),
        });
      }

      res.status(201).json({
        success: true,
        message,
      });
    } catch (error) {
      return next(new ErrorHandler(error.message), 500);
    }
  }),
);

router.get(
  "/get-all-messages/:id",
  isAuthenticated,
  catchAsyncErrors(async (req, res, next) => {
    try {
      const messages = await Messages.find({
        conversation: req.params.id,
      }).sort({ createdAt: 1 });

      res.status(201).json({
        success: true,
        messages,
      });
    } catch (error) {
      return next(new ErrorHandler(error.message), 500);
    }
  }),
);

module.exports = router;
