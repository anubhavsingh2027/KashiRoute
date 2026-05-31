const mongoose = require("mongoose");
const {
  deleteCache,
  deleteCacheByPattern,
  CACHE_CONFIG,
} = require("../utils/cacheUtils");

const carSchema = new mongoose.Schema(
  {
    carName: {
      type: String,
      required: true,
    },
    url: {
      type: String,
      required: true,
    },
    totalSeats: {
      type: Number,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    price: {
      type: Number,
      required: true,
    },
  },
  { timeStamp: true },
);

/**
 * Middleware: Clear cache after saving new car or updating existing car
 */
carSchema.post("save", async function () {
  try {
    // Invalidate all car cache
    await deleteCache(CACHE_CONFIG.carDetails.key);
    await deleteCacheByPattern(`${CACHE_CONFIG.carDetailsById.prefix}*`);
    console.log("Car cache invalidated after save");
  } catch (err) {
    console.error("Error invalidating car cache after save:", err);
  }
});

/**
 * Middleware: Clear cache after finding and removing
 */
carSchema.post(
  ["findByIdAndDelete", "findByIdAndUpdate", "findOneAndDelete"],
  async function () {
    try {
      // Invalidate all car cache
      await deleteCache(CACHE_CONFIG.carDetails.key);
      await deleteCacheByPattern(`${CACHE_CONFIG.carDetailsById.prefix}*`);
      console.log("Car cache invalidated after delete/update");
    } catch (err) {
      console.error("Error invalidating car cache after delete/update:", err);
    }
  },
);

/**
 * Middleware: Clear cache after updateMany
 */
carSchema.post("updateMany", async function () {
  try {
    // Invalidate all car cache
    await deleteCache(CACHE_CONFIG.carDetails.key);
    await deleteCacheByPattern(`${CACHE_CONFIG.carDetailsById.prefix}*`);
    console.log("Car cache invalidated after updateMany");
  } catch (err) {
    console.error("Error invalidating car cache after updateMany:", err);
  }
});

module.exports = mongoose.model("caritems", carSchema);
