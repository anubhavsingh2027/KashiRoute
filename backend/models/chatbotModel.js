const mongoose = require("mongoose");

const chatBot = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    sessionId: {
      type: String,
      default: null,
      index: true,
    },
    question: {
      type: String,
      required: true,
    },
    answer: {
      type: String,
      required: true,
    },
    userMode: {
      type: String,
      enum: ["login", "notLogin"],
      default: "notLogin",
    },
    language: {
      type: String,
      enum: ["en", "hi"],
      default: "en",
    },
    hasProfanity: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true },
);

module.exports = mongoose.model("ChatBot", chatBot);
