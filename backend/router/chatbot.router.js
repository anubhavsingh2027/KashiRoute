const express = require("express");
const router = express.Router();
const chatbotController = require("../controllers/chatbot.controller");

/**
 * POST /KashiRoute/chatbot
 * Send a question to chatbot and get response
 * Body: { question, sessionId (required for non-logged-in users) }
 */
router.post("/chatbot", chatbotController.postChatbot);

/**
 * GET /KashiRoute/chatbot/history
 * Get chat history for logged-in user
 */
router.get("/chatbot/history", chatbotController.getChatHistory);

/**
 * GET /KashiRoute/chatbot/session/:sessionId
 * Get chat history for non-logged-in users
 */
router.get("/chatbot/session/:sessionId", chatbotController.getSessionChat);

/**
 * DELETE /KashiRoute/chatbot/clear
 * Clear chat history for logged-in user
 */
router.delete("/chatbot/clear", chatbotController.clearChatHistory);

module.exports = router;
