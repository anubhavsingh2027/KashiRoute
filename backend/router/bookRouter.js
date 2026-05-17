// External Module
const express = require("express");
const bookRouter = express.Router();

// Local Module
const bookController = require("../controllers/userController.js");
const { userAuth } = require("../middleware/authMiddlleware-user");

bookRouter.use(userAuth);

// === BOOKING ENDPOINTS ===
// Book package and car
bookRouter.post("/bookPackage/:id", bookController.bookPackage);
bookRouter.post("/carbooking/:id", bookController.bookCar);

// Get user history (both car and package bookings)
bookRouter.get("/userHistory/:id", bookController.userHistory);

// Get specific booking types
bookRouter.get("/carBookings/:id", bookController.getUserCarBookings);
bookRouter.get("/packageBookings/:id", bookController.getUserPackageBookings);

// Get individual booking by ID
bookRouter.get("/carBooking/:bookingId", bookController.getCarBookingById);
bookRouter.get(
  "/packageBooking/:bookingId",
  bookController.getPackageBookingById,
);

// Update bookings
bookRouter.put("/carBooking/:bookingId", bookController.updateCarBooking);
bookRouter.put(
  "/packageBooking/:bookingId",
  bookController.updatePackageBooking,
);

// Cancel bookings
bookRouter.delete("/carBooking/:bookingId", bookController.cancelCarBooking);
bookRouter.delete(
  "/packageBooking/:bookingId",
  bookController.cancelPackageBooking,
);

module.exports = bookRouter;
