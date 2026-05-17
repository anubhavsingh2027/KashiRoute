const jwt = require("jsonwebtoken");

// ===== ADMIN AUTH MIDDLEWARE =====
// Checks if user is logged in and has "host" user type
exports.adminAuth = (req, res, next) => {
  try {
    // Get token from cookies
    const token = req.cookies.token;

    // Check if token exists
    if (!token) {
      return res.status(401).json({
        status: false,
        message: "Unauthorized: Please login first",
      });
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Check if user is logged in
    if (!decoded.isLogged) {
      return res.status(401).json({
        status: false,
        message: "Unauthorized: Invalid login session",
      });
    }

    // Check if user type is "host"
    if (decoded.user.userType !== "host") {
      return res.status(403).json({
        status: false,
        message: "Forbidden: Only host users can access admin resources",
      });
    }

    // Attach user data to request for use in controllers
    req.user = decoded.user;
    next();
  } catch (err) {
    // Handle JWT errors
    if (err.name === "TokenExpiredError") {
      return res.status(401).json({
        status: false,
        message: "Unauthorized: Token expired, please login again",
      });
    }

    if (err.name === "JsonWebTokenError") {
      return res.status(401).json({
        status: false,
        message: "Unauthorized: Invalid token",
      });
    }

    return res.status(500).json({
      status: false,
      message: "Server error during authentication",
      error: err.message,
    });
  }
};
