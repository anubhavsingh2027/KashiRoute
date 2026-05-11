const express = require("express");
const contactRouter = express.Router();
const contactController = require("../controllers/contactController");

// Public routes - no authentication required for contact form
contactRouter.post("/contact", contactController.submitContactForm);
contactRouter.get("/contact/info", contactController.getContactInfo);

module.exports = contactRouter;
