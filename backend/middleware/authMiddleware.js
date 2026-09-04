const jwt = require("jsonwebtoken");

const authMiddleware = (req, res, next) => {
  // Support both cookie (same-origin) and Authorization header (cross-origin SPA)
  let token = req.cookies?.token;

  if (!token) {
    const authHeader = req.headers["authorization"];
    if (authHeader && authHeader.startsWith("Bearer ")) {
      token = authHeader.slice(7);
    }
  }

  if (!token) {
    return res.status(401).json({
      success: false,
      message: "Authentication required",
    });
  }

  try {
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET || "knowledgevault_secret",
    );

    req.user = { id: decoded.id };
    return next();
  } catch (error) {
    if (error.name === "TokenExpiredError") {
      return res.status(401).json({
        success: false,
        message: "Session expired. Please log in again.",
      });
    }

    return res.status(401).json({
      success: false,
      message: "Invalid or expired token",
    });
  }
};

module.exports = authMiddleware;
