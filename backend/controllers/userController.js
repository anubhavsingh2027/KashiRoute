const User = require("../models/UserModel");
const CarBooking = require("../models/CarBookingModel");
const PackageBooking = require("../models/PackageBookingModel");

// === BOOK PACKAGE ===
exports.bookPackage = async (req, res, next) => {
  try {
    const userId = req.params.id;
    let {
      packageName,
      guestNo,
      guestCount,
      arrivalDate,
      request,
      price,
      totalPrice,
      paymentId,
    } = req.body;

    if (!request) request = "nothing";
    if (!guestNo && guestCount) guestNo = guestCount;

    // Verify user exists
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found!",
      });
    }

    // Create new package booking
    const bookingItem = new PackageBooking({
      userId,
      packageName,
      guestNo,
      arrivalDate,
      request,
      bookingDate: new Date(),
      status: "pending",
    });

    if (price !== undefined) bookingItem.price = price;
    if (totalPrice !== undefined) bookingItem.totalPrice = totalPrice;
    if (paymentId) bookingItem.paymentId = paymentId;

    const savedBooking = await bookingItem.save();

    res.status(201).json({
      success: true,
      message: "Package booked successfully!",
      data: savedBooking,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server Error",
      error: error.message,
    });
  }
};

// === BOOK CAR ===
exports.bookCar = async (req, res, next) => {
  try {
    const userId = req.params.id;
    const { carName, price, totalPrice, duration, date, notes, paymentId } =
      req.body;

    // Verify user exists
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found!",
      });
    }

    // Create new car booking
    const bookingItem = new CarBooking({
      userId,
      carName,
      price,
      duration,
      date,
      bookingDate: new Date(),
      status: "pending",
    });

    if (totalPrice !== undefined) bookingItem.totalPrice = totalPrice;
    if (notes) bookingItem.notes = notes;
    if (paymentId) bookingItem.paymentId = paymentId;

    const savedBooking = await bookingItem.save();

    res.status(201).json({
      success: true,
      message: "Car booked successfully!",
      data: savedBooking,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server Error",
      error: error.message,
    });
  }
};

//=== find user History ===
exports.userHistory = async (req, res, next) => {
  try {
    const userId = req.params.id;

    // Verify user exists
    const userData = await User.findById(userId);
    if (!userData) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Fetch car and package bookings separately
    const carHistory = await CarBooking.find({ userId })
      .populate("paymentId")
      .sort({ bookingDate: -1 });

    const packageHistory = await PackageBooking.find({ userId })
      .populate("paymentId")
      .sort({ bookingDate: -1 });

    return res.status(200).json({
      success: true,
      carHistory,
      packageHistory,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Server Error",
      error: error.message,
    });
  }
};

// === GET USER CAR BOOKINGS ===
exports.getUserCarBookings = async (req, res) => {
  try {
    const userId = req.params.id;

    const bookings = await CarBooking.find({ userId })
      .populate("paymentId")
      .sort({ bookingDate: -1 });

    return res.status(200).json({
      success: true,
      data: bookings,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Server Error",
      error: error.message,
    });
  }
};

// === GET USER PACKAGE BOOKINGS ===
exports.getUserPackageBookings = async (req, res) => {
  try {
    const userId = req.params.id;

    const bookings = await PackageBooking.find({ userId })
      .populate("paymentId")
      .sort({ bookingDate: -1 });

    return res.status(200).json({
      success: true,
      data: bookings,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Server Error",
      error: error.message,
    });
  }
};

// === GET BOOKING BY ID (CAR) ===
exports.getCarBookingById = async (req, res) => {
  try {
    const { bookingId } = req.params;

    const booking = await CarBooking.findById(bookingId).populate("paymentId");

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: "Car booking not found",
      });
    }

    return res.status(200).json({
      success: true,
      data: booking,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Server Error",
      error: error.message,
    });
  }
};

// === GET BOOKING BY ID (PACKAGE) ===
exports.getPackageBookingById = async (req, res) => {
  try {
    const { bookingId } = req.params;

    const booking =
      await PackageBooking.findById(bookingId).populate("paymentId");

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: "Package booking not found",
      });
    }

    return res.status(200).json({
      success: true,
      data: booking,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Server Error",
      error: error.message,
    });
  }
};

// === UPDATE CAR BOOKING ===
exports.updateCarBooking = async (req, res) => {
  try {
    const { bookingId } = req.params;
    const { status, notes } = req.body;

    const booking = await CarBooking.findByIdAndUpdate(
      bookingId,
      { status, notes },
      { new: true },
    );

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: "Car booking not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Car booking updated successfully",
      data: booking,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Server Error",
      error: error.message,
    });
  }
};

// === UPDATE PACKAGE BOOKING ===
exports.updatePackageBooking = async (req, res) => {
  try {
    const { bookingId } = req.params;
    const { status, request } = req.body;

    const booking = await PackageBooking.findByIdAndUpdate(
      bookingId,
      { status, request },
      { new: true },
    );

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: "Package booking not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Package booking updated successfully",
      data: booking,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Server Error",
      error: error.message,
    });
  }
};

// === CANCEL CAR BOOKING ===
exports.cancelCarBooking = async (req, res) => {
  try {
    const { bookingId } = req.params;

    const booking = await CarBooking.findByIdAndUpdate(
      bookingId,
      { status: "cancelled" },
      { new: true },
    );

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: "Car booking not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Car booking cancelled successfully",
      data: booking,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Server Error",
      error: error.message,
    });
  }
};

// === CANCEL PACKAGE BOOKING ===
exports.cancelPackageBooking = async (req, res) => {
  try {
    const { bookingId } = req.params;

    const booking = await PackageBooking.findByIdAndUpdate(
      bookingId,
      { status: "cancelled" },
      { new: true },
    );

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: "Package booking not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Package booking cancelled successfully",
      data: booking,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Server Error",
      error: error.message,
    });
  }
};
