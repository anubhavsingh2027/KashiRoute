const mongoose = require("mongoose");
const {
  deleteCache,
  deleteCacheByPattern,
  CACHE_CONFIG,
} = require("../utils/cacheUtils");

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

/**
 * Middleware: Clear cache after saving new booking or updating existing booking
 */
packageBookingSchema.post("save", async function () {
  try {
    // Invalidate booking cache
    await deleteCache(CACHE_CONFIG.bookings.key);
    await deleteCacheByPattern(`${CACHE_CONFIG.bookingsById.prefix}*`);
    console.log("Package booking cache invalidated after save");
  } catch (err) {
    console.error("Error invalidating package booking cache after save:", err);
  }
});

/**
 * Middleware: Clear cache after finding and removing or updating
 */
packageBookingSchema.post(
  ["findByIdAndDelete", "findByIdAndUpdate", "findOneAndDelete"],
  async function () {
    try {
      // Invalidate booking cache
      await deleteCache(CACHE_CONFIG.bookings.key);
      await deleteCacheByPattern(`${CACHE_CONFIG.bookingsById.prefix}*`);
      console.log("Package booking cache invalidated after delete/update");
    } catch (err) {
      console.error(
        "Error invalidating package booking cache after delete/update:",
        err,
      );
    }
  },
);

/**
 * Middleware: Clear cache after updateMany
 */
packageBookingSchema.post("updateMany", async function () {
  try {
    // Invalidate booking cache
    await deleteCache(CACHE_CONFIG.bookings.key);
    await deleteCacheByPattern(`${CACHE_CONFIG.bookingsById.prefix}*`);
    console.log("Package booking cache invalidated after updateMany");
  } catch (err) {
    console.error(
      "Error invalidating package booking cache after updateMany:",
      err,
    );
  }
});

module.exports = mongoose.model("PackageBooking", packageBookingSchema);
