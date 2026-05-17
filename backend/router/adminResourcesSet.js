// External Module
const express = require("express");
const adminResourcesSetRouter = express.Router();

// Local Module
const adminResourcesSetController = require("../controllers/adminController");
const { adminAuth } = require("../middleware/authMiddleware-host");



// Apply admin authentication middleware to all routes
adminResourcesSetRouter.use(adminAuth);

adminResourcesSetRouter.post("/addCar", adminResourcesSetController.createCar);
adminResourcesSetRouter.delete(
  "/carDelete/:id",
  adminResourcesSetController.deleteCar,
);
adminResourcesSetRouter.post(
  "/createPackage",
  adminResourcesSetController.createPackage,
);
adminResourcesSetRouter.delete(
  "/packageDelete/:id",
  adminResourcesSetController.deletepackage,
);
adminResourcesSetRouter.get(
  "/history",
  adminResourcesSetController.getAllAdminHistory,
);

module.exports = adminResourcesSetRouter;
