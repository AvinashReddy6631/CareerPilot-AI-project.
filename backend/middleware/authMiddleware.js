const jwt = require(
  "jsonwebtoken"
);

const User = require(
  "../models/User"
);

const protect = async (
  req,
  res,
  next
) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith(
      "Bearer"
    )
  ) {
    try {
      token =
        req.headers.authorization.split(
          " "
        )[1];

      const decoded =
        jwt.verify(
          token,
          process.env.JWT_SECRET
        );

      req.user =
        await User.findById(
          decoded.id
        ).select(
          "-password"
        );

      if (!req.user) {
        return res.status(401).json({
          success: false,
          message: "User not found, Not Authorized",
        });
      }

      return next();
    } catch (error) {
      if (req.originalUrl?.includes("/api/interview/generate-questions")) {
        console.error("[AI Interview] JWT verification failed", {
          "error.status": error.status,
          "error.response?.status": error.response?.status,
          "error.response?.data": error.response?.data,
          "error.message": error.message,
          "error.stack": error.stack,
        });
      }
      return res.status(401).json({
        success: false,
        message: "Not Authorized",
      });
    }
  }

  if (!token) {
    if (req.originalUrl?.includes("/api/interview/generate-questions")) {
      console.error("[AI Interview] JWT verification failed", {
        "error.status": undefined,
        "error.response?.status": undefined,
        "error.response?.data": undefined,
        "error.message": "Authorization header with a Bearer token is required",
        "error.stack": undefined,
      });
    }
    return res.status(401).json({
      success: false,
      message: "No Token",
    });
  }
};

module.exports = {
  protect,
};
