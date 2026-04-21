// External Module
const express = require("express");
const fetchRouter = express.Router();

// Local Module
const fetchController = require("../controllers/fetchcontroller.js");
const { checkSession } = require("../controllers/Auth-Controller.js");


// routers


fetchRouter.get("/check",fetchController.checkAvailable);
fetchRouter.get("/session-user",checkSession);
fetchRouter.get("/getCar", fetchController.getCar);
fetchRouter.get("/getPackage",fetchController.getPackages);
fetchRouter.get("/getUser",fetchController.getUser);

module.exports = fetchRouter;