const { body } = require("express-validator");

const registerRules = [
  body("name").trim().notEmpty().withMessage("Name is required"),
  body("email").trim().isEmail().withMessage("Valid email is required").normalizeEmail(),
  body("password")
    .isLength({ min: 6 })
    .withMessage("Password must be at least 6 characters"),
];

const loginRules = [
  body("email").trim().notEmpty().withMessage("Email is required").normalizeEmail(),
  body("password").notEmpty().withMessage("Password is required"),
];

const updateProfileRules = [
  body("name").trim().notEmpty().withMessage("Name is required"),
  body("email").trim().isEmail().withMessage("Valid email is required").normalizeEmail(),
  body("avatar").optional({ nullable: true }).isString(),
  body("avatarPosition").optional().isObject(),
  body("avatarPosition.x").optional().isFloat({ min: 0, max: 100 }),
  body("avatarPosition.y").optional().isFloat({ min: 0, max: 100 }),
  body("avatarPosition.scale").optional().isFloat({ min: 1, max: 3 }),
  body("currentPassword").optional().isString(),
  body("newPassword")
    .optional()
    .isLength({ min: 6 })
    .withMessage("New password must be at least 6 characters"),
];

const forgotPasswordRules = [
  body("email")
    .trim()
    .notEmpty()
    .withMessage("Email is required")
    .isEmail()
    .withMessage("Valid email is required")
    .customSanitizer((value) => String(value).trim().toLowerCase()),
];

const resetPasswordRules = [
  body("token").trim().notEmpty().withMessage("Reset token is required"),
  body("password")
    .isLength({ min: 6 })
    .withMessage("Password must be at least 6 characters"),
];

module.exports = {
  registerRules,
  loginRules,
  updateProfileRules,
  forgotPasswordRules,
  resetPasswordRules,
};
