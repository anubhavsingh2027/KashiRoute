const mongoose = require("mongoose");
const {
  deleteCache,
  deleteCacheByPattern,
  CACHE_CONFIG,
} = require("../utils/cacheUtils");

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

    // OTP fields for email verification and password reset
    otp: {
      type: String,
      default: null,
    },
    otpExpiry: {
      type: Date,
      default: null,
    },
    otpAttempts: {
      type: Number,
      default: 0,
    },
    lastOtpRequestTime: {
      type: Date,
      default: null,
    },
    isEmailVerified: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true },
);

/**
 * Middleware: Clear cache after saving new user or updating existing user
 */
userSchema.post("save", async function () {
  try {
    // Invalidate all user cache
    await deleteCache(CACHE_CONFIG.userDetails.key);
    await deleteCacheByPattern(`${CACHE_CONFIG.userDetailsById.prefix}*`);
    console.log("User cache invalidated after save");
  } catch (err) {
    console.error("Error invalidating user cache after save:", err);
  }
});

/**
 * Middleware: Clear cache after finding and removing or updating
 */
userSchema.post(
  ["findByIdAndDelete", "findByIdAndUpdate", "findOneAndDelete"],
  async function () {
    try {
      // Invalidate all user cache
      await deleteCache(CACHE_CONFIG.userDetails.key);
      await deleteCacheByPattern(`${CACHE_CONFIG.userDetailsById.prefix}*`);
      console.log("User cache invalidated after delete/update");
    } catch (err) {
      console.error("Error invalidating user cache after delete/update:", err);
    }
  },
);

/**
 * Middleware: Clear cache after updateMany
 */
userSchema.post("updateMany", async function () {
  try {
    // Invalidate all user cache
    await deleteCache(CACHE_CONFIG.userDetails.key);
    await deleteCacheByPattern(`${CACHE_CONFIG.userDetailsById.prefix}*`);
    console.log("User cache invalidated after updateMany");
  } catch (err) {
    console.error("Error invalidating user cache after updateMany:", err);
  }
});

module.exports = mongoose.model("User", userSchema);
