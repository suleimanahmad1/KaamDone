const crypto = require("crypto");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const { sendPasswordResetEmail } = require("../utils/sendEmail");
const { hashResetToken, buildResetUrl, normalizeResetToken } = require("../utils/resetToken");

function badRequest(message) {
  const err = new Error(message);
  err.statusCode = 400;
  return err;
}

function signToken(userId) {
  if (!process.env.JWT_SECRET) {
    throw new Error("JWT_SECRET is not set in server/.env");
  }
  return jwt.sign({ id: userId }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || "7d",
  });
}

function defaultAvatarPosition() {
  return { x: 50, y: 50, scale: 1 };
}

function userPayload(user) {
  const pos = user.avatarPosition || defaultAvatarPosition();
  return {
    _id: user._id,
    name: user.name,
    email: user.email,
    avatar: user.avatar || "",
    avatarPosition: {
      x: pos.x ?? 50,
      y: pos.y ?? 50,
      scale: pos.scale ?? 1,
    },
    createdAt: user.createdAt,
  };
}

function sendUser(res, user, token, statusCode = 200) {
  res.status(statusCode).json({
    success: true,
    token,
    data: userPayload(user),
  });
}

function validateAvatar(avatar) {
  if (avatar === undefined) return null;
  if (avatar === null || avatar === "") return "";
  if (typeof avatar !== "string" || !avatar.startsWith("data:image/")) {
    return badRequest("Profile image must be a valid image (JPEG, PNG, GIF, or WebP)");
  }
  if (avatar.length > 3_200_000) {
    return badRequest("Profile image is too large. Use a photo under 2 MB after crop.");
  }
  return avatar;
}

function validateAvatarPosition(position) {
  if (position === undefined) return null;
  if (position === null) return defaultAvatarPosition();
  if (typeof position !== "object") {
    return badRequest("Invalid profile image position");
  }
  const x = Number(position.x);
  const y = Number(position.y);
  const scale = Number(position.scale);
  if (![x, y, scale].every((n) => Number.isFinite(n))) {
    return badRequest("Invalid profile image position");
  }
  return {
    x: Math.min(100, Math.max(0, x)),
    y: Math.min(100, Math.max(0, y)),
    scale: Math.min(3, Math.max(1, scale)),
  };
}

/** POST /api/auth/register */
async function register(req, res, next) {
  try {
    const { name, email, password } = req.body;

    if (!name?.trim()) return next(badRequest("Name is required"));
    if (!email?.trim()) return next(badRequest("Email is required"));
    if (!password || String(password).length < 6) {
      return next(badRequest("Password must be at least 6 characters"));
    }

    const exists = await User.findOne({ email: email.trim().toLowerCase() });
    if (exists) {
      return next(badRequest("Email already registered"));
    }

    const user = await User.create({
      name: name.trim(),
      email: email.trim().toLowerCase(),
      password,
    });

    const token = signToken(user._id);
    sendUser(res, user, token, 201);
  } catch (err) {
    if (err.code === 11000) {
      return next(badRequest("Email already registered"));
    }
    next(err);
  }
}

/** POST /api/auth/login */
async function login(req, res, next) {
  try {
    const { email, password } = req.body;

    if (!email?.trim() || !password) {
      return next(badRequest("Email and password are required"));
    }

    const user = await User.findOne({ email: email.trim().toLowerCase() }).select("+password");
    if (!user || !(await user.comparePassword(password))) {
      const err = new Error("Invalid email or password");
      err.statusCode = 401;
      return next(err);
    }

    const token = signToken(user._id);
    user.password = undefined;
    sendUser(res, user, token);
  } catch (err) {
    next(err);
  }
}

/** GET /api/auth/me */
async function getMe(req, res) {
  res.json({
    success: true,
    data: userPayload(req.user),
  });
}

/** PUT /api/auth/profile */
async function updateProfile(req, res, next) {
  try {
    const { name, email, currentPassword, newPassword, avatar, avatarPosition } = req.body;

    if (!name?.trim()) return next(badRequest("Name is required"));
    if (!email?.trim()) return next(badRequest("Email is required"));

    const user = await User.findById(req.user._id).select("+password");
    if (!user) {
      const err = new Error("User not found");
      err.statusCode = 404;
      return next(err);
    }

    const normalizedEmail = email.trim().toLowerCase();
    if (normalizedEmail !== user.email) {
      const taken = await User.findOne({ email: normalizedEmail });
      if (taken) return next(badRequest("Email already in use"));
      user.email = normalizedEmail;
    }

    user.name = name.trim();

    if (avatar !== undefined) {
      const validated = validateAvatar(avatar);
      if (validated instanceof Error) return next(validated);
      user.avatar = validated;
      if (!validated) user.avatarPosition = defaultAvatarPosition();
    }

    if (avatarPosition !== undefined) {
      const validatedPos = validateAvatarPosition(avatarPosition);
      if (validatedPos instanceof Error) return next(validatedPos);
      user.avatarPosition = validatedPos;
    }

    if (newPassword) {
      if (!currentPassword) {
        return next(badRequest("Current password is required to set a new password"));
      }
      const valid = await user.comparePassword(currentPassword);
      if (!valid) return next(badRequest("Current password is incorrect"));
      user.password = newPassword;
      user.markModified("password");
    }

    await user.save();
    user.password = undefined;

    res.json({ success: true, data: userPayload(user) });
  } catch (err) {
    if (err.code === 11000) {
      return next(badRequest("Email already in use"));
    }
    next(err);
  }
}

/** POST /api/auth/forgot-password */
async function forgotPassword(req, res, next) {
  try {
    const { email } = req.body;
    if (!email?.trim()) return next(badRequest("Email is required"));

    const normalizedEmail = email.trim().toLowerCase();
    const user = await User.findOne({ email: normalizedEmail });

    const message =
      "If an account exists with this email, we sent a password reset link. Check your inbox and spam folder.";

    if (!user) {
      return res.json({ success: true, message, data: null });
    }

    const resetToken = crypto.randomBytes(32).toString("hex");
    user.passwordResetToken = crypto.createHash("sha256").update(resetToken).digest("hex");
    user.passwordResetExpires = new Date(Date.now() + 60 * 60 * 1000);
    await user.save({ validateBeforeSave: false });

    const clientUrl = (process.env.CLIENT_URL || "http://localhost:5173").replace(/\/$/, "");
    const resetUrl = `${clientUrl}/reset-password?token=${encodeURIComponent(resetToken)}`;

    if (process.env.NODE_ENV !== "production") {
      console.log(`Password reset link (${user.email}):\n${resetUrl}`);
    }

    await sendPasswordResetEmail(user.email, resetUrl, user.name);

    const includeResetLink = process.env.INCLUDE_RESET_LINK !== "false";
    res.json({
      success: true,
      message,
      data: includeResetLink ? { resetLink: resetUrl } : null,
    });
  } catch (err) {
    next(err);
  }
}

/** POST /api/auth/reset-password */
async function resetPassword(req, res, next) {
  try {
    const { token, password } = req.body;
    if (!token?.trim()) return next(badRequest("Reset token is required"));
    if (!password || String(password).length < 6) {
      return next(badRequest("Password must be at least 6 characters"));
    }

    const normalized = normalizeResetToken(token);
    if (!/^[a-f0-9]{64}$/i.test(normalized)) {
      return next(badRequest("Invalid or expired reset link. Request a new one."));
    }

    const hashed = hashResetToken(normalized);
    const user = await User.findOne({
      passwordResetToken: hashed,
      passwordResetExpires: { $gt: new Date() },
    }).select("+password +passwordResetToken +passwordResetExpires");

    if (!user) {
      return next(badRequest("Invalid or expired reset link. Request a new one."));
    }

    user.password = password;
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    user.markModified("password");
    await user.save();

    res.json({ success: true, message: "Password updated. You can login now.", data: null });
  } catch (err) {
    next(err);
  }
}

module.exports = { register, login, getMe, updateProfile, forgotPassword, resetPassword };
