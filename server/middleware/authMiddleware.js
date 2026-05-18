const jwt = require("jsonwebtoken");
const User = require("../models/User");

function protect(req, res, next) {
  const header = req.headers.authorization;
  if (!header || !header.startsWith("Bearer ")) {
    return res.status(401).json({ success: false, message: "Not authorized — login required" });
  }

  const token = header.split(" ")[1];
  if (!token) {
    return res.status(401).json({ success: false, message: "Not authorized — login required" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    User.findById(decoded.id)
      .select("-password")
      .then((user) => {
        if (!user) {
          return res.status(401).json({ success: false, message: "User no longer exists" });
        }
        req.user = user;
        next();
      })
      .catch(next);
  } catch (err) {
    return res.status(401).json({ success: false, message: "Invalid or expired token — please login again" });
  }
}

module.exports = { protect };
