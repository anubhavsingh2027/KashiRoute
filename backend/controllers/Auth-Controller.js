const User = require("../models/UserModel");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

// ===== SIGNUP =====
exports.postSignUp = async (req, res) => {
  const { userName, email, phone, location, password } = req.body;
  try {
    //  Check if user already exists
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(400).json({ status: false, message: "User already exists" });
    }

    //  Hash password and create new user
    const hashedPassword = await bcrypt.hash(password, 12);
    const newUser = new User({
      userName,
      email: email.toLowerCase(),
      phone,
      location,
      password: hashedPassword,
    });
    await newUser.save();

    //  Prepare safe user data (exclude password)
    const userObj = newUser.toObject();
    const { password: _, ...safeUser } = userObj;

    //  Create token payload
    const tokenPayload = {
      isLogged: true,
      user: safeUser,
    };

    //  Sign JWT
    const token = jwt.sign(tokenPayload, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_EXPIRES_IN || "1d",
    });

    //  Store token in cookie (secure for cross-origin)
    res.cookie("token", token, {
      httpOnly: true,
      secure: true,
      sameSite: "none",
      maxAge: 1000 * 60 * 60 * 24,
    });

    //  Send same type of response as postLogin
    res.status(200).json({
      status: true,
      message: `Welcome to kashi Route Mrs/Mr  ${userName}`,
      isLoggedIn: true,
      user: safeUser,
    });
  } catch (err) {
    res.status(500).json({ status: false, message: "Server error during signup" });
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

    //  Check password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch)
      return res.status(422).json({ status: false, message: "Incorrect password" });

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

    //  Send cookie
    res.cookie("token", token, {
      httpOnly: true,
      secure: true, // true on HTTPS
      sameSite: "none",
      maxAge: 1000 * 60 * 60 * 24,
    });

    //  Send response
    res.status(200).json({
      status: true,
      message: `Welcome again Mrs/Mr  ${user.userName}`,
      isLoggedIn: true,
      user: safeUser,
    });
  } catch (err) {
    res.status(500).json({ status: false, message: `Failed To Login: ${err.message}` });
  }
};

// ===== FORGET PASSWORD =====
exports.postForget = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return res.status(422).json({ status: false, message: "User not found" });
    }

    const isSamePassword = await bcrypt.compare(password, user.password);
    if (isSamePassword) {
      return res.status(422).json({ status: false, message: "Already Same Password" });
    }

    const hashedPassword = await bcrypt.hash(password, 12);

     const result = await User.updateOne(
      { _id: user._id },
      { $set: { password: hashedPassword } }
    );
     if (result.modifiedCount === 0) {
      return res.status(500).json({ status: false, message: "Failed To Change Password" });
    }
    res.status(200).json({ status: true, message: "Password Change successful" });
  } catch (err) {
    res.status(500).json({ status: false, message: "Failed To Change Password" });
  }
};


// ===== LOGOUT =====
exports.postLogout = (req, res) => {
  res.clearCookie("token", {
    httpOnly: true,
    secure: true,
    sameSite: "none",
  });
  res.status(200).json({ status: true, message: "Logged out successfully" });
};


exports.verifyJWT = function (req, res, next) {
  const token = req.cookies.token || req.headers['authorization'];
  if (!token) {
    return res.status(401).json({ status: false, message: "No token provided!" });
  }
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ status: false, message: "Invalid token" });
  }
};

exports.updateUserType = async (req, res) => {
  try {
    const { id, changeType } = req.body;

    const result = await User.updateOne(
      { _id: id },
      { $set: { userType: changeType } }
    );

    if (result.modifiedCount === 0) {
      return res.status(400).json({ status: false, message: "User type not changed" });
    }

    res.status(200).json({ status: true, message: "User type changed successfully!" });

  } catch (err) {
    res.status(500).json({ status: false, message: "Server error while changing user type" });
  }
};

