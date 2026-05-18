const express = require("express");
const {
  register,
  login,
  getMe,
  updateProfile,
  forgotPassword,
  resetPassword,
} = require("../controllers/authController");
const { protect } = require("../middleware/authMiddleware");
const { validate } = require("../middleware/validate");
const {
  registerRules,
  loginRules,
  updateProfileRules,
  forgotPasswordRules,
  resetPasswordRules,
} = require("../validators/authValidators");

const { authLimiter } = require("../middleware/rateLimit");

const router = express.Router();

router.post("/register", authLimiter, registerRules, validate, register);
router.post("/login", authLimiter, loginRules, validate, login);
router.post("/forgot-password", authLimiter, forgotPasswordRules, validate, forgotPassword);
router.post("/reset-password", authLimiter, resetPasswordRules, validate, resetPassword);
router.get("/me", protect, getMe);
router.put("/profile", protect, updateProfileRules, validate, updateProfile);

module.exports = router;
