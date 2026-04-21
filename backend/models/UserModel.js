const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    userName: {
      type: String,
      required: true,
    },
    password: {
      type: String,
      required: true,
    },
    phone: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
    },
    userType: {
      type: String,
      enum: ["guest", "host"],
      default: "guest",
    },
    location: {
      type: String,
      required: true,
    },

    carBooking: [
      {
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
          required: true,
        },
        notes: {
          type: String,
        },
        paymentId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Payment",
        },
      },
    ],

    packageBook: [
      {
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
        paymentId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Payment",
        },
        arrivalDate: {
          type: Date,
          required: true,
        },
        bookingDate: {
          type: Date,
          default: Date.now,
        },
        request: {
          type: String,
        },
      },
    ],
  },
  { timestamps: true },
);

module.exports = mongoose.model("User", userSchema);
