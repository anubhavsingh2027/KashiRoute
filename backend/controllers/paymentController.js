const Razorpay = require("razorpay");
const crypto = require("crypto");
const shortid = require("shortid");
const Payment = require("../models/paymentModel");
const User = require("../models/UserModel");

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_SECRET,
});

// Create Order
exports.createOrder = async (req, res) => {
  try {
    const { amount, bookingType, bookingDetails, userId } = req.body;

    // Basic validation
    if (
      amount === undefined ||
      bookingType === undefined ||
      !bookingDetails ||
      !userId
    ) {
      return res.status(400).json({
        success: false,
        message: "Missing required fields",
      });
    }

    const numericAmount = Number(amount);
    if (!Number.isFinite(numericAmount) || numericAmount <= 0) {
      return res.status(400).json({
        success: false,
        message: "Invalid amount",
      });
    }

    if (!["car", "package"].includes(bookingType)) {
      return res.status(400).json({
        success: false,
        message: "Invalid bookingType",
      });
    }

    const receiptId = `receipt_${shortid.generate()}_${Date.now()}`;

    const options = {
      amount: amount * 100, // in paise
      currency: "INR",
      receipt: receiptId,
    };

    const order = await razorpay.orders.create(options);

    // Save payment record
    const payment = new Payment({
      userId,
      orderId: order.id,
      amount,
      receiptId,
      bookingType,
      bookingDetails,
    });

    await payment.save();

    res.json({
      success: true,
      order,
      receiptId,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error creating order",
      error: error.message,
    });
  }
};

// Verify Payment
exports.verifyPayment = async (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } =
      req.body;

    const body = razorpay_order_id + "|" + razorpay_payment_id;

    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_SECRET)
      .update(body)
      .digest("hex");

    if (expectedSignature === razorpay_signature) {
      // Update payment status
      const payment = await Payment.findOneAndUpdate(
        { orderId: razorpay_order_id },
        {
          paymentId: razorpay_payment_id,
          status: "success",
          updatedAt: new Date(),
        },
        { new: true },
      );

      if (!payment) {
        return res.status(404).json({
          success: false,
          message: "Payment record not found for this order",
        });
      }

      // Perform booking immediately after successful verification.
      await performBooking(payment);

      res.json({
        success: true,
        message: "Payment verified successfully",
        paymentId: payment._id,
      });
    } else {
      await Payment.findOneAndUpdate(
        { orderId: razorpay_order_id },
        { status: "failed", updatedAt: new Date() },
      );
      res.status(400).json({ success: false, message: "Invalid signature" });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error verifying payment",
      error: error.message,
    });
  }
};

// Webhook
exports.webhook = async (req, res) => {
  try {
    const secret = process.env.WEBHOOK_SECRET;
    const shasum = crypto.createHmac("sha256", secret);
    const payload = req.rawBody || JSON.stringify(req.body);
    shasum.update(payload);
    const digest = shasum.digest("hex");

    if (digest === req.headers["x-razorpay-signature"]) {
      const event = req.body;

      if (event.event === "payment.captured") {
        const paymentEntity = event.payload.payment.entity;
        const orderId = paymentEntity.order_id;

        // Update payment status
        const payment = await Payment.findOneAndUpdate(
          { orderId },
          { status: "success", updatedAt: new Date() },
          { new: true },
        );

        if (payment) {
          await performBooking(payment);
        }
      }
    }

    res.status(200).send("OK");
  } catch (error) {
    res.status(500).send("Error");
  }
};

// Helper function to perform booking
const performBooking = async (payment) => {
  try {
    const { userId, bookingType, bookingDetails } = payment;

    if (bookingType === "package") {
      await User.findByIdAndUpdate(userId, {
        $push: {
          packageBook: {
            ...bookingDetails,
            bookingDate: new Date(),
            paymentId: payment._id,
          },
        },
      });
    } else if (bookingType === "car") {
      await User.findByIdAndUpdate(userId, {
        $push: {
          carBooking: {
            ...bookingDetails,
            bookingDate: new Date(),
            paymentId: payment._id,
          },
        },
      });
    }
  } catch (error) {
    console.error("performBooking error:", error);
    // Consider setting payment.status = 'failed' or adding a retry mechanism here
  }
};

// Get Payment History
exports.getPaymentHistory = async (req, res) => {
  try {
    const userId = req.params.userId;
    const payments = await Payment.find({ userId }).sort({ createdAt: -1 });

    res.json({
      success: true,
      payments,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error fetching payment history",
      error: error.message,
    });
  }
};

// Generate Receipt
exports.generateReceipt = async (req, res) => {
  try {
    const { paymentId } = req.params;
    const payment = await Payment.findById(paymentId).populate(
      "userId",
      "userName email",
    );

    if (!payment) {
      return res
        .status(404)
        .json({ success: false, message: "Payment not found" });
    }

    const receipt = {
      receiptId: payment.receiptId,
      userName: payment.userId.userName,
      email: payment.userId.email,
      amount: payment.amount,
      currency: payment.currency,
      bookingType: payment.bookingType,
      bookingDetails: payment.bookingDetails,
      status: payment.status,
      date: payment.createdAt,
    };

    res.json({
      success: true,
      receipt,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error generating receipt",
      error: error.message,
    });
  }
};

// Get Razorpay Key
exports.getRazorpayKey = async (req, res) => {
  res.json({
    success: true,
    key: process.env.RAZORPAY_KEY_ID,
  });
};
