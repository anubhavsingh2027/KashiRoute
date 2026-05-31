const mongoose = require("mongoose");
const {
  deleteCache,
  deleteCacheByPattern,
  CACHE_CONFIG,
} = require("../utils/cacheUtils");

const packageSchema = new mongoose.Schema(
  {
    packageName: {
      type: String,
      required: true,
    },
    place: {
      type: String,
      required: true,
    },
    url: {
      type: String,
      required: true,
    },
    packageDuration: {
      type: Number,
      required: true,
    },
    price: {
      type: Number,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
  },
  { timeStamp: true },
);

/**
 * Middleware: Clear cache after saving new package or updating existing package
 */
packageSchema.post("save", async function () {
  try {
    // Invalidate all package cache
    await deleteCache(CACHE_CONFIG.packageDetails.key);
    await deleteCacheByPattern(`${CACHE_CONFIG.packageDetailsById.prefix}*`);
    console.log("Package cache invalidated after save");
  } catch (err) {
    console.error("Error invalidating package cache after save:", err);
  }
});

/**
 * Middleware: Clear cache after finding and removing
 */
packageSchema.post(
  ["findByIdAndDelete", "findByIdAndUpdate", "findOneAndDelete"],
  async function () {
    try {
      // Invalidate all package cache
      await deleteCache(CACHE_CONFIG.packageDetails.key);
      await deleteCacheByPattern(`${CACHE_CONFIG.packageDetailsById.prefix}*`);
      console.log("Package cache invalidated after delete/update");
    } catch (err) {
      console.error(
        "Error invalidating package cache after delete/update:",
        err,
      );
    }
  },
);

/**
 * Middleware: Clear cache after updateMany
 */
packageSchema.post("updateMany", async function () {
  try {
    // Invalidate all package cache
    await deleteCache(CACHE_CONFIG.packageDetails.key);
    await deleteCacheByPattern(`${CACHE_CONFIG.packageDetailsById.prefix}*`);
    console.log("Package cache invalidated after updateMany");
  } catch (err) {
    console.error("Error invalidating package cache after updateMany:", err);
  }
});

module.exports = mongoose.model("packagedetails", packageSchema);
