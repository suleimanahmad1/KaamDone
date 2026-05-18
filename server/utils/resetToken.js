const crypto = require("crypto");

/** Plain reset token from email link (hex). */
function normalizeResetToken(raw) {
  if (!raw) return "";
  let value = String(raw).trim();

  // User pasted full URL
  const pathMatch = value.match(/\/reset-password\/([a-f0-9]{64})/i);
  if (pathMatch) return pathMatch[1].toLowerCase();

  const queryMatch = value.match(/[?&]token=([a-f0-9]{64})/i);
  if (queryMatch) return queryMatch[1].toLowerCase();

  try {
    const decoded = decodeURIComponent(value);
    if (decoded !== value) return normalizeResetToken(decoded);
  } catch {
    // ignore
  }

  const hexOnly = value.match(/^[a-f0-9]{64}$/i);
  if (hexOnly) return hexOnly[0].toLowerCase();

  return value;
}

function hashResetToken(raw) {
  const token = normalizeResetToken(raw);
  if (!token) return "";
  return crypto.createHash("sha256").update(token).digest("hex");
}

function buildResetUrl(clientUrl, resetToken) {
  const base = String(clientUrl || "http://localhost:5173").replace(/\/$/, "");
  return `${base}/reset-password/${resetToken}`;
}

module.exports = { normalizeResetToken, hashResetToken, buildResetUrl };
