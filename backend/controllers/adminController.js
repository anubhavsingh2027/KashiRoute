const carDetailsModel = require("../models/carDetailsModel");
const packageDetailsModel = require("../models/packagedetailsModel");
const UserModel = require("../models/UserModel");
const CarBookingModel = require("../models/CarBookingModel");
const PackageBookingModel = require("../models/PackageBookingModel");

exports.createPackage = async (req, res, next) => {
  try {
    const { packageName, place, url, description, price, packageDuration } =
      req.body;
    const packageInfo = new packageDetailsModel({
      packageName,
      place,
      packageDuration,
      url,
      description,
      price,
    });

    await packageInfo.save();

    res.status(201).json({
      success: true,
      message: "Package created successfully!",
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: "Server Error",
      error: err.message,
    });
  }
};

exports.deletepackage = async (req, res, next) => {
  const id = req.params.id;
  await packageDetailsModel.findByIdAndDelete(id);
  res.status(200).json({
    success: true,
    message: "Package deleted successfully!",
  });
};

exports.createCar = async (req, res, next) => {
  try {
    const { carName, url, description, price, totalSeats } = req.body;
    const carInfo = new carDetailsModel({
      carName,
      url,
      description,
      price,
      totalSeats,
    });
    await carInfo.save();
    res.status(201).json({
      success: true,
      message: "Car booked successfully!",
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: "Server Error",
      error: err.message,
    });
  }
};

exports.deleteCar = async (req, res, next) => {
  const id = req.params.id;
  await carDetailsModel.findByIdAndDelete(id);
  res.status(200).json({
    success: true,
    message: "Car deleted successfully!",
  });
};

// ===== ADMIN HISTORY - Get all user bookings efficiently =====
exports.getAllAdminHistory = async (req, res, next) => {
  try {
    // Step 1: Fetch all users
    const allUsers = await UserModel.find().select("-password -otp -otpExpiry");

    // Step 2: Fetch all car and package bookings in parallel
    const [carBookings, packageBookings] = await Promise.all([
      CarBookingModel.find().populate("userId", "userName email phone").lean(),
      PackageBookingModel.find()
        .populate("userId", "userName email phone")
        .lean(),
    ]);

    // Step 3: Combine bookings by user
    const historyByUser = allUsers.map((user) => {
      const userCarBookings = carBookings.filter(
        (booking) => booking.userId._id.toString() === user._id.toString(),
      );

      const userPackageBookings = packageBookings.filter(
        (booking) => booking.userId._id.toString() === user._id.toString(),
      );

      return {
        userId: user._id,
        userName: user.userName,
        email: user.email,
        phone: user.phone,
        location: user.location,
        totalBookings: userCarBookings.length + userPackageBookings.length,
        carBookings: userCarBookings.length,
        packageBookings: userPackageBookings.length,
        bookingHistory: {
          cars: userCarBookings,
          packages: userPackageBookings,
        },
      };
    });

    // Step 4: Calculate summary statistics including revenue
    const totalCarRevenue = carBookings.reduce(
      (sum, booking) => sum + (Number(booking.price) || 0),
      0,
    );
    const totalPackageRevenue = packageBookings.reduce(
      (sum, booking) => sum + (Number(booking.price) || 0),
      0,
    );
    const totalRevenue = totalCarRevenue + totalPackageRevenue;

    const summary = {
      totalUsers: allUsers.length,
      totalCarBookings: carBookings.length,
      totalPackageBookings: packageBookings.length,
      totalBookings: carBookings.length + packageBookings.length,
      totalCarRevenue: totalCarRevenue,
      totalPackageRevenue: totalPackageRevenue,
      totalRevenue: totalRevenue,
    };

    res.status(200).json({
      success: true,
      message: "Admin history fetched successfully",
      summary,
      historyByUser,
      allCarBookings: carBookings,
      allPackageBookings: packageBookings,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: "Server Error",
      error: err.message,
    });
  }
};

/**
 * Get all users (direct DB call)
 */
exports.getUser = async (req, res, next) => {
  try {
    const users = await userDetailsModel
      .find()
      .select("userName email phone location userType");

    res.json(users || []);
  } catch (err) {
    console.error("Error fetching user details:", err);
    next(err);
  }
};