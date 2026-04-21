const express = require("express");
const paymentRouter = express.Router();
const paymentController = require("../controllers/paymentController");

paymentRouter.post("/create-order", paymentController.createOrder);
paymentRouter.post("/verify-payment", paymentController.verifyPayment);
paymentRouter.post("/webhook", paymentController.webhook);
paymentRouter.get(
  "/payment-history/:userId",
  paymentController.getPaymentHistory,
);
paymentRouter.get("/receipt/:paymentId", paymentController.generateReceipt);
paymentRouter.get("/razorpay-key", paymentController.getRazorpayKey);

module.exports = paymentRouter;
