const User = require("../models/UserModel");

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

    const bookingItem = {
      packageName,
      guestNo,
      arrivalDate,
      request,
      bookingDate: new Date(),
    };

    if (price !== undefined) bookingItem.price = price;
    if (totalPrice !== undefined) bookingItem.totalPrice = totalPrice;
    if (paymentId) bookingItem.paymentId = paymentId;

    // Push the booking object directly into user's array
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      {
        $push: {
          packageBook: bookingItem,
        },
      },
      { new: true }, // return updated document
    );

    if (!updatedUser) {
      return res.status(404).json({
        success: false,
        message: "User not found!",
      });
    }

    res.status(201).json({
      success: true,
      message: "Package booked successfully!",
      data: updatedUser.packageBook[updatedUser.packageBook.length - 1], // return last booked package
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

    const bookingItem = {
      carName,
      price,
      duration,
      date,
    };

    if (totalPrice !== undefined) bookingItem.totalPrice = totalPrice;
    if (notes) bookingItem.notes = notes;
    if (paymentId) bookingItem.paymentId = paymentId;

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      {
        $push: {
          carBooking: bookingItem,
        },
      },
      { new: true }, // return updated document
    );

    if (!updatedUser) {
      return res.status(404).json({
        success: false,
        message: "User not found!",
      });
    }

    res.status(201).json({
      success: true,
      message: "Car booked successfully!",
      data: updatedUser.carBooking[updatedUser.carBooking.length - 1],
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
    const userData = await User.findById(userId);
    if (!userData) {
      return res.status(404).json({
        message: "User not found",
      });
    }
    return res.status(200).json({
      carHistory: userData.carBooking,
      packageHistory: userData.packageBook,
    });
  } catch (error) {
    return res.status(500).json({
      message: "server Error",
    });
  }
};
