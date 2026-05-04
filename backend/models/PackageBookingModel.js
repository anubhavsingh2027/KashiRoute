const mongoose = require("mongoose");

const packageBookingSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    packageName: {
      type: String,
      required: true,
    },
    guestNo: {
      type: String,
      required: true,
    },
    price: {
      type: Number,
    },
    totalPrice: {
      type: Number,
    },
    arrivalDate: {
      type: Date,
    },
    request: {
      type: String,
      default: "nothing",
    },
    bookingDate: {
      type: Date,
      default: Date.now,
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

module.exports = mongoose.model("PackageBooking", packageBookingSchema);
