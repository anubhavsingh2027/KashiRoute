const mongoose = require("mongoose");
const {
  deleteCache,
  deleteCacheByPattern,
  CACHE_CONFIG,
} = require("../utils/cacheUtils");

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

/**
 * Middleware: Clear cache after saving new booking or updating existing booking
 */
carBookingSchema.post("save", async function () {
  try {
    // Invalidate booking cache
    await deleteCache(CACHE_CONFIG.bookings.key);
    await deleteCacheByPattern(`${CACHE_CONFIG.bookingsById.prefix}*`);
    console.log("Car booking cache invalidated after save");
  } catch (err) {
    console.error("Error invalidating car booking cache after save:", err);
  }
});

/**
 * Middleware: Clear cache after finding and removing or updating
 */
carBookingSchema.post(
  ["findByIdAndDelete", "findByIdAndUpdate", "findOneAndDelete"],
  async function () {
    try {
      // Invalidate booking cache
      await deleteCache(CACHE_CONFIG.bookings.key);
      await deleteCacheByPattern(`${CACHE_CONFIG.bookingsById.prefix}*`);
      console.log("Car booking cache invalidated after delete/update");
    } catch (err) {
      console.error(
        "Error invalidating car booking cache after delete/update:",
        err,
      );
    }
  },
);

/**
 * Middleware: Clear cache after updateMany
 */
carBookingSchema.post("updateMany", async function () {
  try {
    // Invalidate booking cache
    await deleteCache(CACHE_CONFIG.bookings.key);
    await deleteCacheByPattern(`${CACHE_CONFIG.bookingsById.prefix}*`);
    console.log("Car booking cache invalidated after updateMany");
  } catch (err) {
    console.error(
      "Error invalidating car booking cache after updateMany:",
      err,
    );
  }
});

module.exports = mongoose.model("CarBooking", carBookingSchema);
