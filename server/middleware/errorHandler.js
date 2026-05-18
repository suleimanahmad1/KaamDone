/**
 * Global error handler. Must have 4 args so Express treats it as error middleware.
 */
function errorHandler(err, req, res, next) {
  const isCors = err.message?.startsWith("CORS blocked");
  const statusCode = isCors
    ? 403
    : err.statusCode && Number.isInteger(err.statusCode)
      ? err.statusCode
      : 500;
  const message =
    statusCode === 500 && process.env.NODE_ENV === "production"
      ? "Internal server error"
      : err.message || "Internal server error";

  if (statusCode === 500) {
    console.error(err);
  }

  res.status(statusCode).json({
    success: false,
    message,
    data: null,
    ...(process.env.NODE_ENV !== "production" && err.stack ? { stack: err.stack } : {}),
  });
}

module.exports = { errorHandler };
