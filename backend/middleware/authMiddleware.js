const jwt = require(
  "jsonwebtoken"
);

const User = require(
  "../models/User"
);

// Token blacklist for logout functionality
const tokenBlacklist = new Set();

const protect = async (
  req,
  res,
  next
) => {
  try {
    // Check for Authorization header
    if (
      !req.headers.authorization ||
      !req.headers.authorization.startsWith(
        "Bearer"
      )
    ) {
      return res.status(401).json({
        success: false,
        message:
          "No authentication token provided",
      });
    }

    // Extract token from header
    const token =
      req.headers.authorization.split(
        " "
      )[1];

    // Verify token is not blacklisted
    if (tokenBlacklist.has(token)) {
      return res.status(401).json({
        success: false,
        message:
          "Token has been revoked",
      });
    }

    // Verify and decode token
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET
    );

    // Verify token hasn't expired
    if (
      decoded.exp &&
      decoded.exp * 1000 < Date.now()
    ) {
      return res.status(401).json({
        success: false,
        message:
          "Token has expired",
      });
    }

    // Fetch user from database
    const user =
      await User.findById(
        decoded.id
      ).select(
        "-password"
      );

    if (!user) {
      return res.status(401).json({
        success: false,
        message:
          "User not found",
      });
    }

    // Attach user to request
    req.user = user;
    req.token = token;
    next();
  } catch (error) {
    if (
      error.name === "JsonWebTokenError"
    ) {
      return res.status(401).json({
        success: false,
        message:
          "Invalid token",
      });
    }
    if (
      error.name === "TokenExpiredError"
    ) {
      return res.status(401).json({
        success: false,
        message:
          "Token expired",
      });
    }
    return res.status(401).json({
      success: false,
      message:
        "Authentication failed",
    });
  }
};

// Logout helper to add token to blacklist
const logout = (token) => {
  tokenBlacklist.add(token);
};

module.exports = {
  protect,
  logout,
};
