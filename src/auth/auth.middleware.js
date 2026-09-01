import jwt from "jsonwebtoken";

export function authenticateToken(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    const error = new Error("Authorization header is required");
    error.name = "Unauthorized";
    error.status = 401;
    return next(error);
  }

  const parts = authHeader.split(" ");

  if (parts.length !== 2 || parts[0] !== "Bearer") {
    const error = new Error("Invalid authorization format");
    error.name = "Unauthorized";
    error.status = 401;
    return next(error);
  }

  const token = parts[1];

  try {
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET
    );

    req.user = decoded;
    next();
  } catch (error) {
    const authError = new Error("Invalid or expired token");
    authError.name = "Unauthorized";
    authError.status = 401;
    next(authError);
  }
}

export function authorizeRoles(...allowedRoles) {
  return (req, res, next) => {
    if (!req.user) {
      const error = new Error("Authentication required");
      error.name = "Unauthorized";
      error.status = 401;
      return next(error);
    }

    if (!allowedRoles.includes(req.user.role)) {
      const error = new Error("You do not have permission to access this resource");
      error.name = "Forbidden";
      error.status = 403;
      return next(error);
    }

    next();
  };
}