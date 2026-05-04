const express = require("express");
const AuthRouter = express.Router();
const AuthController = require("../controllers/Auth-Controller.js");

// Public routes

AuthRouter.post("/signup", AuthController.postSignUp);
AuthRouter.post("/verify-signup-otp", AuthController.verifySignupOTP);
AuthRouter.post("/resend-otp", AuthController.resendOTP);

AuthRouter.post("/login", AuthController.postLogin);
AuthRouter.post("/logout", AuthController.postLogout);

AuthRouter.post("/forgetPassword", AuthController.postForget);
AuthRouter.post("/verify-forgot-otp", AuthController.verifyForgotOTP);

// User Type Change Routes
AuthRouter.put("/changeUserType", AuthController.updateUserType);
AuthRouter.get("/permissiongrant", AuthController.grantPermission);

module.exports = AuthRouter;
