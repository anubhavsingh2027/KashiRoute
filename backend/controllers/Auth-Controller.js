const User = require("../models/UserModel");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const {
  generateOTP,
  getOTPExpiry,
  isOTPExpired,
} = require("../utils/otpUtils");
const {
  sendEmail,
  generateOTPEmailHTML,
  generatePasswordResetHTML,
  generateUserTypeChangeApprovalEmailHTML,
  generateUserTypeChangeConfirmationHTML,
  generateUserTypeChangeRejectionHTML,
  generateWelcomeSignupEmailHTML,
  generateAdminSignupNotificationEmailHTML,
} = require("../utils/emailUtils");

// ===== IN-MEMORY STORAGE FOR PENDING USER TYPE CHANGE REQUESTS =====
const pendingUserTypeChanges = {};

// ===== HELPER: Get cookie options based on environment =====
function getCookieOptions(req) {
  const isProduction = process.env.NODE_ENV === "production";

  return {
    path: "/",
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? "none" : "lax", // Allow cross-origin for both dev and prod
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  };
}

// ===== HELPER: Check if user can request OTP (rate limiting) =====
function canRequestOTP(lastOtpRequestTime) {
  if (!lastOtpRequestTime) return true;
  const timeDiffSeconds = (new Date() - lastOtpRequestTime) / 1000;
  return timeDiffSeconds > 30; // Allow OTP request only after 30 seconds
}

//check Session
exports.checkSession = async (req, res, next) => {
  const token = req.cookies.token;

  if (!token) {
    return res.json({ loggedIn: false, user: { userType: "guest" } });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    return res.json({
      loggedIn: decoded.isLogged,
      user: decoded.user, // full user data
    });
  } catch (err) {
    return res.json({ loggedIn: false, user: { userType: "guest" } });
  }
};

// ===== SIGNUP: Step 1 - Send OTP =====
exports.postSignUp = async (req, res) => {
  const { userName, email, phone, location, password } = req.body;

  try {
    // Validate required fields
    if (!userName || !email || !phone || !location || !password) {
      return res
        .status(400)
        .json({ status: false, message: "All fields are required" });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      // If email already verified, they should login
      if (existingUser.isEmailVerified) {
        return res.status(400).json({
          status: false,
          message: "User already exists. Please login.",
        });
      }

      // If email not verified, allow resending OTP
      // But check rate limiting first
      if (!canRequestOTP(existingUser.lastOtpRequestTime)) {
        return res.status(429).json({
          status: false,
          message: "Please wait 30 seconds before requesting another OTP",
          retryAfter: 30,
        });
      }

      // Generate new OTP for existing unverified user
      const otp = generateOTP(6);
      const otpExpiry = getOTPExpiry();

      existingUser.otp = otp;
      existingUser.otpExpiry = otpExpiry;
      existingUser.otpAttempts = 0;
      existingUser.lastOtpRequestTime = new Date();
      await existingUser.save();

      // Send OTP email
      const emailHTML = generateOTPEmailHTML(otp);
      const emailResult = await sendEmail({
        to: existingUser.email,
        subject: "Verify Your Email - Kashi Route",
        message: emailHTML,
        websiteName: "Kashi Route",
      });

      if (!emailResult.success) {
        return res.status(500).json({
          status: false,
          message: "Failed to send OTP. Please try again.",
        });
      }

      return res.status(200).json({
        status: true,
        message: "OTP sent to your email. Valid for 7 minutes.",
        userId: existingUser._id,
        email: existingUser.email,
      });
    }

    // Generate OTP for new user
    const otp = generateOTP(6);
    const otpExpiry = getOTPExpiry();

    // Store signup data temporarily in database (NOT VERIFIED YET)
    const tempUser = new User({
      userName,
      email: email.toLowerCase(),
      phone,
      location,
      password: await bcrypt.hash(password, 12),
      otp: otp,
      otpExpiry: otpExpiry,
      otpAttempts: 0,
      lastOtpRequestTime: new Date(),
      isEmailVerified: false,
    });

    await tempUser.save();

    // Send OTP email
    const emailHTML = generateOTPEmailHTML(otp);
    const emailResult = await sendEmail({
      to: email.toLowerCase(),
      subject: "Verify Your Email - Kashi Route",
      message: emailHTML,
      websiteName: "Kashi Route",
    });

    if (!emailResult.success) {
      // Delete temporary user if email fails
      await User.deleteOne({ _id: tempUser._id });
      return res.status(500).json({
        status: false,
        message: "Failed to send OTP. Please try again.",
      });
    }

    res.status(200).json({
      status: true,
      message: "OTP sent to your email. Valid for 7 minutes.",
      userId: tempUser._id,
      email: email.toLowerCase(),
    });
  } catch (err) {
    console.error("Signup error:", err);
    res
      .status(500)
      .json({ status: false, message: "Server error during signup" });
  }
};

// ===== SIGNUP: Step 2 - Verify OTP and Complete Registration =====
exports.verifySignupOTP = async (req, res) => {
  const { userId, otp } = req.body;

  try {
    if (!userId || !otp) {
      return res
        .status(400)
        .json({ status: false, message: "User ID and OTP are required" });
    }

    // Find the temporary user
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ status: false, message: "User not found" });
    }

    // Check if email already verified
    if (user.isEmailVerified) {
      return res.status(400).json({
        status: false,
        message: "Email already verified. Please login.",
      });
    }

    // Check OTP expiry
    if (isOTPExpired(user.otpExpiry)) {
      return res.status(400).json({
        status: false,
        message: "OTP has expired. Please request a new one.",
      });
    }

    // Check OTP (case-insensitive)
    if (user.otp.toUpperCase() !== otp.toUpperCase()) {
      // Increment failed attempts
      user.otpAttempts += 1;
      await user.save();

      if (user.otpAttempts >= 5) {
        // Delete user after 5 failed attempts
        await User.deleteOne({ _id: userId });
        return res.status(400).json({
          status: false,
          message: "Too many failed attempts. Please register again.",
        });
      }

      return res.status(400).json({
        status: false,
        message: `Invalid OTP. ${5 - user.otpAttempts} attempts remaining.`,
      });
    }

    // Mark email as verified and clear OTP
    user.isEmailVerified = true;
    user.otp = null;
    user.otpExpiry = null;
    user.otpAttempts = 0;
    await user.save();

    // ===== SEND WELCOME EMAIL TO USER =====
    const welcomeEmailHTML = generateWelcomeSignupEmailHTML(user.userName);
    const userEmailResult = await sendEmail({
      to: user.email,
      subject: `Welcome to Kashi Route, ${user.userName}! 🎉`,
      message: welcomeEmailHTML,
      websiteName: "Kashi Route",
    });

    if (!userEmailResult.success) {
      console.error(
        "Failed to send welcome email to user:",
        userEmailResult.error,
      );
    }

    // ===== SEND ADMIN NOTIFICATION EMAIL =====
    const adminEmail = process.env.ADMIN_EMAIL;
    if (adminEmail) {
      const adminNotificationHTML = generateAdminSignupNotificationEmailHTML(
        user.userName,
        user.email,
        user.phone,
        user.location,
        user.userType,
        new Date(),
      );

      const adminEmailResult = await sendEmail({
        to: adminEmail,
        subject: `📢 New User Registration - ${user.userName}`,
        message: adminNotificationHTML,
        websiteName: "Kashi Route",
      });

      if (!adminEmailResult.success) {
        console.error(
          "Failed to send admin notification email:",
          adminEmailResult.error,
        );
      }
    } else {
      console.warn("ADMIN_EMAIL not configured. Skipping admin notification.");
    }

    // Prepare safe user data
    const userObj = user.toObject();
    const { password: _, otp: __, ...safeUser } = userObj;

    // Create JWT token
    const tokenPayload = {
      isLogged: true,
      user: safeUser,
    };

    const token = jwt.sign(tokenPayload, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_EXPIRES_IN || "7d",
    });

    // Set cookie
    const cookieOpts = getCookieOptions(req);
    res.cookie("token", token, cookieOpts);

    res.status(200).json({
      status: true,
      message: `Welcome to Kashi Route ${user.userName}!`,
      isLoggedIn: true,
      user: safeUser,
    });
  } catch (err) {
    console.error("OTP verification error:", err);
    res.status(500).json({
      status: false,
      message: "Server error during OTP verification",
    });
  }
};

// ===== RESEND OTP =====
exports.resendOTP = async (req, res) => {
  const { userId, email } = req.body;

  try {
    if (!userId && !email) {
      return res.status(400).json({
        status: false,
        message: "User ID or email is required",
      });
    }

    // Find user
    const user = await User.findById(
      userId || (email && { email: email.toLowerCase() }),
    );
    if (!user) {
      return res.status(404).json({ status: false, message: "User not found" });
    }

    // Check if already verified
    if (user.isEmailVerified) {
      return res.status(400).json({
        status: false,
        message: "Email already verified. Please login.",
      });
    }

    // Rate limiting check
    if (!canRequestOTP(user.lastOtpRequestTime)) {
      return res.status(429).json({
        status: false,
        message: "Please wait 30 seconds before requesting another OTP",
        retryAfter: 30,
      });
    }

    // Generate new OTP
    const otp = generateOTP(6);
    const otpExpiry = getOTPExpiry();

    // Update user
    user.otp = otp;
    user.otpExpiry = otpExpiry;
    user.otpAttempts = 0;
    user.lastOtpRequestTime = new Date();
    await user.save();

    // Send OTP email
    const emailHTML = generateOTPEmailHTML(otp);
    const emailResult = await sendEmail({
      to: user.email,
      subject: "Verify Your Email - Kashi Route",
      message: emailHTML,
      websiteName: "Kashi Route",
    });

    if (!emailResult.success) {
      return res.status(500).json({
        status: false,
        message: "Failed to send OTP. Please try again.",
      });
    }

    res.status(200).json({
      status: true,
      message: "OTP resent to your email. Valid for 7 minutes.",
    });
  } catch (err) {
    console.error("Resend OTP error:", err);
    res
      .status(500)
      .json({ status: false, message: "Server error during OTP resend" });
  }
};

// ===== LOGIN =====
exports.postLogin = async (req, res) => {
  try {
    const { email, password } = req.body;

    //  Find user
    const user = await User.findOne({ email: email.toLowerCase() }).lean();
    if (!user)
      return res.status(422).json({ status: false, message: "User not found" });

    //  Check if email is verified
    if (!user.isEmailVerified) {
      return res.status(403).json({
        status: false,
        message:
          "Please verify your email first. Check your inbox for the OTP.",
        requiresVerification: true,
      });
    }

    //  Check password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch)
      return res
        .status(422)
        .json({ status: false, message: "Incorrect password" });

    //  Remove password before encoding
    const { password: _, ...safeUser } = user;

    //  Create full JWT payload
    const tokenPayload = {
      isLogged: true,
      user: safeUser,
    };

    const token = jwt.sign(tokenPayload, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_EXPIRES_IN || "1d",
    });

    //  Send cookie with environment-aware options
    const cookieOpts = getCookieOptions(req);
    res.cookie("token", token, cookieOpts);

   if(safeUser.userType === "host"){
    res.status(200).json({
      status: true,
      message: `Hello host Mr./Mrs. ${safeUser.userName}! .`,
      isLoggedIn: true,
      user: safeUser,
    });
   } else {
    res.status(200).json({
      status: true,
      message: `Welcome back, ${safeUser.userName}!`,
      isLoggedIn: true,
      user: safeUser,
    });
   }
  } catch (err) {
    res
      .status(500)
      .json({ status: false, message: `Failed To Login: ${err.message}` });
  }
};

// ===== FORGOT PASSWORD: Step 1 - Send OTP =====
exports.postForget = async (req, res) => {
  const { email } = req.body;

  try {
    if (!email) {
      return res
        .status(400)
        .json({ status: false, message: "Email is required" });
    }

    // Find user
    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return res.status(404).json({
        status: false,
        message:
          "User not found. Please check your email or register a new account.",
      });
    }

    // Rate limiting check
    if (!canRequestOTP(user.lastOtpRequestTime)) {
      return res.status(429).json({
        status: false,
        message: "Please wait 30 seconds before requesting another OTP",
        retryAfter: 30,
      });
    }

    // Generate OTP
    const otp = generateOTP(6);
    const otpExpiry = getOTPExpiry();

    // Update user with OTP
    user.otp = otp;
    user.otpExpiry = otpExpiry;
    user.otpAttempts = 0;
    user.lastOtpRequestTime = new Date();
    await user.save();

    // Send OTP email
    const emailHTML = generateOTPEmailHTML(otp);
    const emailResult = await sendEmail({
      to: user.email,
      subject: "Reset Your Password - Kashi Route",
      message: emailHTML,
      websiteName: "Kashi Route",
    });

    if (!emailResult.success) {
      return res.status(500).json({
        status: false,
        message: "Failed to send OTP. Please try again.",
      });
    }

    res.status(200).json({
      status: true,
      message: "OTP sent to your email. Valid for 7 minutes.",
      email: user.email,
    });
  } catch (err) {
    console.error("Forgot password error:", err);
    res
      .status(500)
      .json({ status: false, message: "Server error during password reset" });
  }
};

// ===== FORGOT PASSWORD: Step 2 - Verify OTP and Reset Password =====
exports.verifyForgotOTP = async (req, res) => {
  const { email, otp, newPassword } = req.body;

  try {
    if (!email || !otp || !newPassword) {
      return res.status(400).json({
        status: false,
        message: "Email, OTP, and new password are required",
      });
    }

    // Find user
    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return res.status(404).json({ status: false, message: "User not found" });
    }

    // Check OTP expiry
    if (isOTPExpired(user.otpExpiry)) {
      return res.status(400).json({
        status: false,
        message: "OTP has expired. Please request a new one.",
      });
    }

    // Verify OTP (case-insensitive)
    if (user.otp.toUpperCase() !== otp.toUpperCase()) {
      // Increment failed attempts
      user.otpAttempts += 1;
      await user.save();

      if (user.otpAttempts >= 5) {
        // Clear OTP after 5 failed attempts
        user.otp = null;
        user.otpExpiry = null;
        user.otpAttempts = 0;
        await user.save();

        return res.status(400).json({
          status: false,
          message: "Too many failed attempts. Please request a new OTP.",
        });
      }

      return res.status(400).json({
        status: false,
        message: `Invalid OTP. ${5 - user.otpAttempts} attempts remaining.`,
      });
    }

    // Check if new password is same as old password
    const isSamePassword = await bcrypt.compare(newPassword, user.password);
    if (isSamePassword) {
      return res.status(400).json({
        status: false,
        message: "New password cannot be the same as your old password",
      });
    }

    // Hash and update password
    const hashedPassword = await bcrypt.hash(newPassword, 12);
    user.password = hashedPassword;
    user.otp = null;
    user.otpExpiry = null;
    user.otpAttempts = 0;
    await user.save();

    // Send password reset confirmation email
    const emailHTML = generatePasswordResetHTML(user.userName);
    await sendEmail({
      to: user.email,
      subject: "Password Reset Successful - Kashi Route",
      message: emailHTML,
      websiteName: "Kashi Route",
    });

    res.status(200).json({
      status: true,
      message:
        "Password reset successful! You can now login with your new password.",
    });
  } catch (err) {
    console.error("Verify forgot OTP error:", err);
    res.status(500).json({
      status: false,
      message: "Server error during password reset",
    });
  }
};

// ===== LOGOUT =====
exports.postLogout = (req, res) => {
  res.clearCookie("token", getCookieOptions(req));
  res.status(200).json({ status: true, message: "Logged out successfully" });
};

exports.verifyJWT = function (req, res, next) {
  let token = req.cookies.token || req.headers["authorization"];
  // If Authorization header is in the form 'Bearer <token>' strip the prefix
  if (typeof token === "string" && token.toLowerCase().startsWith("bearer ")) {
    token = token.slice(7).trim();
  }
  if (!token) {
    return res
      .status(401)
      .json({ status: false, message: "No token provided!" });
  }
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ status: false, message: "Invalid token" });
  }
};

// ===== REQUEST USER TYPE CHANGE: Send OTP to Admin =====
exports.updateUserType = async (req, res) => {
  try {
    const { id, changeType } = req.body;

    // Validate required fields
    if (!id || !changeType) {
      return res.status(400).json({
        status: false,
        message: "User ID and new user type are required",
      });
    }

    // Validate user exists
    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({
        status: false,
        message: "User not found",
      });
    }

    // Check if user already has the requested type
    if (user.userType === changeType) {
      return res.status(400).json({
        status: false,
        message: `User is already a ${changeType}`,
      });
    }

    // Generate OTP and unique request ID
    const otp = generateOTP(6);
    const requestId =
      Date.now().toString(36) + Math.random().toString(36).substr(2);
    const expiryTime = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours expiry for admin action

    // Store pending request in memory
    pendingUserTypeChanges[requestId] = {
      userId: id,
      userName: user.userName,
      email: user.email,
      currentUserType: user.userType,
      requestedUserType: changeType,
      otp: otp,
      expiryTime: expiryTime,
      createdAt: new Date(),
    };

    // Generate approval email with links
    const emailHTML = generateUserTypeChangeApprovalEmailHTML(
      user.userName,
      id,
      changeType,
      otp,
      requestId,
    );

    // Send email to admin
    const emailResult = await sendEmail({
      to: process.env.ADMIN_EMAIL,
      subject: `User Type Change Request - ${user.userName} to ${changeType}`,
      message: emailHTML,
      websiteName: "Kashi Route",
    });

    if (!emailResult.success) {
      // Remove pending request if email fails
      delete pendingUserTypeChanges[requestId];
      return res.status(500).json({
        status: false,
        message: "Failed to send approval request to admin. Please try again.",
      });
    }

    res.status(200).json({
      status: true,
      message:
        "User type change request sent to admin. You will receive an email confirmation once approved.",
      requestId: requestId,
    });
  } catch (err) {
    console.error("Update user type error:", err);
    res.status(500).json({
      status: false,
      message: "Server error while processing user type change request",
    });
  }
};

// ===== GRANT/DENY PERMISSION: Handle Admin's Decision =====
exports.grantPermission = async (req, res) => {
  try {
    const { id, type, action, otp, requestId } = req.query;

    // Validate required query parameters
    if (!id || !type || !action || !requestId) {
      return res.status(400).json({
        status: false,
        message: "Missing required parameters: id, type, action, requestId",
      });
    }

    // Check if request exists and is not expired
    const pendingRequest = pendingUserTypeChanges[requestId];
    if (!pendingRequest) {
      return res.status(404).json({
        status: false,
        message: "Request not found or has already been processed",
      });
    }

    // Check if request has expired
    if (new Date() > pendingRequest.expiryTime) {
      delete pendingUserTypeChanges[requestId];
      return res.status(400).json({
        status: false,
        message:
          "Request has expired. Please ask the user to submit a new request.",
      });
    }

    // Verify OTP if provided
    if (otp && otp.toUpperCase() !== pendingRequest.otp.toUpperCase()) {
      return res.status(400).json({
        status: false,
        message: "Invalid OTP",
      });
    }

    // Verify request matches parameters
    if (
      pendingRequest.userId !== id ||
      pendingRequest.requestedUserType !== type
    ) {
      return res.status(400).json({
        status: false,
        message: "Request parameters do not match",
      });
    }

    // Handle approval or disapproval
    if (action === "approve") {
      // Update user type
      const result = await User.updateOne(
        { _id: id },
        { $set: { userType: type } },
      );

      if (result.modifiedCount === 0) {
        return res.status(400).json({
          status: false,
          message: "Failed to update user type",
        });
      }

      // Delete pending request
      delete pendingUserTypeChanges[requestId];

      // Send confirmation email to user
      const confirmationHTML = generateUserTypeChangeConfirmationHTML(
        pendingRequest.userName,
        type,
      );

      await sendEmail({
        to: pendingRequest.email,
        subject: "Your Account Type Change Has Been Approved - Kashi Route",
        message: confirmationHTML,
        websiteName: "Kashi Route",
      });

      return res.status(200).json({
        status: true,
        message: `✓ User type change approved successfully! Confirmation email sent to ${pendingRequest.email}`,
      });
    } else if (action === "disapprove") {
      // Delete pending request
      delete pendingUserTypeChanges[requestId];

      // Send rejection email to user
      const rejectionHTML = generateUserTypeChangeRejectionHTML(
        pendingRequest.userName,
        type,
        pendingRequest.currentUserType,
      );

      await sendEmail({
        to: pendingRequest.email,
        subject:
          "Your Account Type Change Request Has Been Declined - Kashi Route",
        message: rejectionHTML,
        websiteName: "Kashi Route",
      });

      return res.status(200).json({
        status: true,
        message: `✕ User type change request declined. Notification email sent to ${pendingRequest.email}`,
      });
    } else {
      return res.status(400).json({
        status: false,
        message: "Invalid action. Use 'approve' or 'disapprove'",
      });
    }
  } catch (err) {
    console.error("Grant permission error:", err);
    res.status(500).json({
      status: false,
      message: "Server error while processing permission grant",
    });
  }
};
