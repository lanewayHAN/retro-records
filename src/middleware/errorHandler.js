export function errorHandler(error, req, res, next) {
  if (process.env.NODE_ENV !== "test") {
    console.error(error);
  }

  const status = error.status || 500;

  res.status(status).json({
    error: error.name || "InternalServerError",
    message: error.message || "Something went wrong"
  });
}