const mongoose = require("mongoose");

const carBookingSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    carName: {
      type: String,
      required: true,
    },
    price: {
      type: Number,
      required: true,
    },
    totalPrice: {
      type: Number,
    },
    duration: {
      type: Number,
      required: true,
    },
    bookingDate: {
      type: Date,
      default: Date.now,
    },
    date: {
      type: Date,
    },
    notes: {
      type: String,
    },
    paymentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Payment",
    },
    status: {
      type: String,
      enum: ["pending", "confirmed", "completed", "cancelled"],
      default: "pending",
    },
  },
  { timestamps: true },
);

module.exports = mongoose.model("CarBooking", carBookingSchema);
