const mongoose = require("mongoose");

const messagesSchema = new mongoose.Schema(
  {
    conversation: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Conversation",
      required: true,
      index: true,
    },
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    text: {
      type: String,
      trim: true,
      default: null,
    },

    images: [
      {
        public_id: {
          type: String,
        },
        url: { type: String, required: true },
      },
    ],
    seenBy: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    seenAt: {
      type: Date,
    },
  },
  { timestamps: true, }
);

messagesSchema.virtual("isSeen").get(function () {
  return this.seenBy?.length > 0;
});

module.exports = mongoose.model("Messages", messagesSchema);
