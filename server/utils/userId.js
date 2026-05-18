const mongoose = require("mongoose");

/** Stable MongoDB ObjectId for the authenticated user. */
function getUserObjectId(req) {
  const raw = req.user?._id ?? req.user?.id;
  if (!raw) {
    const err = new Error("Not authorized");
    err.statusCode = 401;
    throw err;
  }
  return new mongoose.Types.ObjectId(String(raw));
}

module.exports = { getUserObjectId };
