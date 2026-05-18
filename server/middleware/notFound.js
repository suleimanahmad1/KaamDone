function notFound(req, res, next) {
  const err = new Error(`Not found — ${req.method} ${req.originalUrl}`);
  err.statusCode = 404;
  next(err);
}

module.exports = { notFound };
