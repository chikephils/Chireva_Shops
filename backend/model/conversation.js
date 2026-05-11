const mongoose = require("mongoose");

const conversationSchema = new mongoose.Schema(
  {
    groupTitle: {
      type: String,
      unique: true,
      sparse: true,
    },
    members: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
      },
    ],
    lastMessage: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Message",
    },
    lastMessagePreview: {
      type: String,
      trim: true,
    },
    updatedAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

conversationSchema.index({ members: 1 });
conversationSchema.index({ groupTitle: 1 });

module.exports = mongoose.model("Conversation", conversationSchema);
