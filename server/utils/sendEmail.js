const nodemailer = require("nodemailer");

function isEmailConfigured() {
  return Boolean(process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS);
}

function createTransport() {
  if (!isEmailConfigured()) return null;

  const port = Number(String(process.env.SMTP_PORT || "587").trim()) || 587;
  const secure =
    String(process.env.SMTP_SECURE || "").trim().toLowerCase() === "true" || port === 465;

  return nodemailer.createTransport({
    host: String(process.env.SMTP_HOST).trim(),
    port,
    secure,
    auth: {
      user: String(process.env.SMTP_USER).trim(),
      pass: String(process.env.SMTP_PASS).trim(),
    },
  });
}

function buildResetEmailHtml(resetUrl, userName) {
  const greeting = userName ? `Hi ${userName},` : "Hi,";
  const safeUrl = resetUrl.replace(/&/g, "&amp;");

  return `<!DOCTYPE html>
<html lang="en">
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:24px;font-family:Arial,Helvetica,sans-serif;background:#f8fafc;color:#0f172a;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:560px;margin:0 auto;">
    <tr>
      <td style="background:#ffffff;border:1px solid #e2e8f0;border-radius:12px;padding:28px;">
        <h2 style="margin:0 0 16px;color:#4f46e5;font-size:20px;">KaamDone — Password reset</h2>
        <p style="margin:0 0 12px;padding:12px;background:#fef3c7;border-radius:8px;font-size:13px;word-break:break-all;line-height:1.4;">
          <strong>Reset link:</strong><br />
          <a href="${safeUrl}" style="color:#4f46e5;">${resetUrl}</a>
        </p>
        <p style="margin:0 0 12px;line-height:1.5;">${greeting}</p>
        <p style="margin:0 0 20px;line-height:1.5;">Use the button below to set a new password. This link expires in <strong>1 hour</strong>.</p>
        <table role="presentation" cellspacing="0" cellpadding="0" style="margin:0 0 24px;">
          <tr>
            <td style="border-radius:8px;background:#4f46e5;">
              <a href="${safeUrl}" target="_blank" rel="noopener noreferrer"
                style="display:inline-block;padding:14px 28px;color:#ffffff;font-size:16px;font-weight:bold;text-decoration:none;">
                Reset password
              </a>
            </td>
          </tr>
        </table>
        <p style="margin:0 0 8px;font-size:13px;color:#64748b;">If the button does not work (common with localhost), copy this full link into Chrome on the same PC where the app runs:</p>
        <p style="margin:0 0 20px;padding:12px;background:#f1f5f9;border-radius:8px;font-size:13px;word-break:break-all;line-height:1.4;">
          <a href="${safeUrl}" style="color:#4f46e5;">${resetUrl}</a>
        </p>
        <p style="margin:0;font-size:12px;color:#94a3b8;">If you did not request this, ignore this email.</p>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

/** @returns {Promise<{ sent: boolean }>} */
async function sendPasswordResetEmail(to, resetUrl, userName = "") {
  const transport = createTransport();
  if (!transport) {
    const err = new Error(
      "Email is not configured. Add SMTP_HOST, SMTP_USER, and SMTP_PASS to server/.env (see .env.example)."
    );
    err.statusCode = 503;
    throw err;
  }

  const from = process.env.SMTP_FROM || `"KaamDone" <${process.env.SMTP_USER}>`;

  const text = [
    "RESET PASSWORD LINK (copy if button missing):",
    resetUrl,
    "",
    "KaamDone — Reset your password",
    "This link expires in 1 hour.",
    "Open in Chrome on the same PC where the app runs (localhost does not work on phone).",
    "",
    "If you did not request this, ignore this email.",
  ].join("\n");

  await transport.sendMail({
    from,
    to,
    subject: "KaamDone — Reset your password",
    text,
    html: buildResetEmailHtml(resetUrl, userName),
  });

  return { sent: true };
}

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function buildDeadlineReminderHtml({ userName, taskTitle, dueDateLabel, minutesLeft, dashboardUrl }) {
  const greeting = userName ? `Hi ${escapeHtml(userName)},` : "Hi,";
  const safeTitle = escapeHtml(taskTitle);
  const safeUrl = dashboardUrl.replace(/&/g, "&amp;");

  return `<!DOCTYPE html>
<html lang="en">
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:24px;font-family:Arial,Helvetica,sans-serif;background:#f8fafc;color:#0f172a;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:560px;margin:0 auto;">
    <tr>
      <td style="background:#ffffff;border:1px solid #e2e8f0;border-radius:12px;padding:28px;">
        <h2 style="margin:0 0 16px;color:#4f46e5;font-size:20px;">KaamDone — Deadline reminder</h2>
        <p style="margin:0 0 12px;line-height:1.5;">${greeting}</p>
        <p style="margin:0 0 16px;line-height:1.5;">
          Your task <strong>${safeTitle}</strong> is due in about <strong>${minutesLeft} minutes</strong>
          (${dueDateLabel}).
        </p>
        <p style="margin:0 0 20px;padding:14px;background:#fef3c7;border-radius:8px;font-size:14px;line-height:1.5;color:#92400e;">
          ⏰ Task end hone mein sirf <strong>${minutesLeft} minutes</strong> reh gaye hain. Abhi complete karein ya dashboard check karein.
        </p>
        <table role="presentation" cellspacing="0" cellpadding="0" style="margin:0 0 20px;">
          <tr>
            <td style="border-radius:8px;background:#4f46e5;">
              <a href="${safeUrl}" target="_blank" rel="noopener noreferrer"
                style="display:inline-block;padding:14px 28px;color:#ffffff;font-size:16px;font-weight:bold;text-decoration:none;">
                Open dashboard
              </a>
            </td>
          </tr>
        </table>
        <p style="margin:0;font-size:12px;color:#94a3b8;">You receive this once per task deadline.</p>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

/** @returns {Promise<{ sent: boolean }>} */
async function sendTaskDeadlineReminderEmail({
  to,
  userName,
  taskTitle,
  dueDate,
  minutesLeft = 30,
}) {
  const transport = createTransport();
  if (!transport) {
    console.warn("Deadline reminder skipped: SMTP not configured in server/.env");
    return { sent: false };
  }

  const dueDateLabel = new Date(dueDate).toLocaleString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });

  const clientUrl = (process.env.CLIENT_URL || "http://localhost:5173").replace(/\/$/, "");
  const dashboardUrl = `${clientUrl}/dashboard`;
  const from = process.env.SMTP_FROM || `"KaamDone" <${process.env.SMTP_USER}>`;

  const text = [
    "KaamDone — Deadline reminder",
    "",
    userName ? `Hi ${userName},` : "Hi,",
    "",
    `Task: ${taskTitle}`,
    `Due: ${dueDateLabel}`,
    `About ${minutesLeft} minutes left until the deadline.`,
    "",
    "Task end hone mein sirf 30 minutes reh gaye hain.",
    "",
    `Open your tasks: ${dashboardUrl}`,
  ].join("\n");

  await transport.sendMail({
    from,
    to,
    subject: `KaamDone — "${taskTitle}" due in ${minutesLeft} minutes`,
    text,
    html: buildDeadlineReminderHtml({
      userName,
      taskTitle,
      dueDateLabel,
      minutesLeft,
      dashboardUrl,
    }),
  });

  return { sent: true };
}

module.exports = {
  sendPasswordResetEmail,
  sendTaskDeadlineReminderEmail,
  isEmailConfigured,
};
