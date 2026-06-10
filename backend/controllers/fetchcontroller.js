const cardetailsModel = require("../models/carDetailsModel");
const packageDetailsModel = require("../models/packagedetailsModel");
const userDetailsModel = require("../models/UserModel");
const { getCache, setCache, CACHE_CONFIG } = require("../utils/cacheUtils");

/**
 * Check server availability
 */
exports.checkAvailable = async (req, res, next) => {
  try {
    return res.json({ wakeup: true });
  } catch (err) {
    next(err);
  }
};

/**
 * Get all cars with caching
 * Cache TTL: 1 hour
 */
exports.getCar = async (req, res, next) => {
  try {
    const cacheKey = CACHE_CONFIG.carDetails.key;

    // Try to get from cache first
    let fetchCar = await getCache(cacheKey);

    // If not in cache, fetch from database
    if (!fetchCar) {
      fetchCar = await cardetailsModel.find();
      // Store in cache for future requests
      if (fetchCar && fetchCar.length > 0) {
        await setCache(cacheKey, fetchCar, CACHE_CONFIG.carDetails.ttl);
      }
    }

    res.json(fetchCar || []);
  } catch (err) {
    console.error("Error fetching car details:", err);
    next(err);
  }
};

/**
 * Get single car by ID with caching
 * Cache TTL: 1 hour
 */
exports.getCarById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const cacheKey = `${CACHE_CONFIG.carDetailsById.prefix}${id}`;

    // Try to get from cache first
    let car = await getCache(cacheKey);

    // If not in cache, fetch from database
    if (!car) {
      car = await cardetailsModel.findById(id);
      // Store in cache for future requests
      if (car) {
        await setCache(cacheKey, car, CACHE_CONFIG.carDetailsById.ttl);
      }
    }

    res.json(car || { message: "Car not found" });
  } catch (err) {
    console.error("Error fetching car by ID:", err);
    next(err);
  }
};

/**
 * Get all packages with caching
 * Cache TTL: 1 hour
 */
exports.getPackages = async (req, res, next) => {
  try {
    const cacheKey = CACHE_CONFIG.packageDetails.key;

    // Try to get from cache first
    let fetchPackage = await getCache(cacheKey);

    // If not in cache, fetch from database
    if (!fetchPackage) {
      fetchPackage = await packageDetailsModel.find();
      // Store in cache for future requests
      if (fetchPackage && fetchPackage.length > 0) {
        await setCache(cacheKey, fetchPackage, CACHE_CONFIG.packageDetails.ttl);
      }
    }

    res.json(fetchPackage || []);
  } catch (err) {
    console.error("Error fetching package details:", err);
    next(err);
  }
};

/**
 * Get single package by ID with caching
 * Cache TTL: 1 hour
 */
exports.getPackageById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const cacheKey = `${CACHE_CONFIG.packageDetailsById.prefix}${id}`;

    // Try to get from cache first
    let pkg = await getCache(cacheKey);

    // If not in cache, fetch from database
    if (!pkg) {
      pkg = await packageDetailsModel.findById(id);
      // Store in cache for future requests
      if (pkg) {
        await setCache(cacheKey, pkg, CACHE_CONFIG.packageDetailsById.ttl);
      }
    }

    res.json(pkg || { message: "Package not found" });
  } catch (err) {
    console.error("Error fetching package by ID:", err);
    next(err);
  }
};



/**
 * Get single user by ID with caching
 * Cache TTL: 30 minutes
 */
exports.getUserById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const cacheKey = `${CACHE_CONFIG.userDetailsById.prefix}${id}`;

    // Try to get from cache first
    let user = await getCache(cacheKey);

    // If not in cache, fetch from database
    if (!user) {
      user = await userDetailsModel
        .findById(id)
        .select("userName email phone location userType");
      // Store in cache for future requests
      if (user) {
        await setCache(cacheKey, user, CACHE_CONFIG.userDetailsById.ttl);
      }
    }

    res.json(user || { message: "User not found" });
  } catch (err) {
    console.error("Error fetching user by ID:", err);
    next(err);
  }
};
