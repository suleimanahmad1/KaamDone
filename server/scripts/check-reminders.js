require("dotenv").config();
const { connectDatabase } = require("../config/database");
const { Task } = require("../models/Task");
require("../models/User");
const { isEmailConfigured } = require("../utils/sendEmail");
const { runDeadlineReminderCheck, getLeadMinutes } = require("../utils/deadlineReminders");

function isRemindersEnabled() {
  if (String(process.env.DEADLINE_REMINDERS_ENABLED || "true").toLowerCase() === "false") {
    return false;
  }
  return isEmailConfigured();
}

function buildDueWindow(now, leadMinutes) {
  const leadMs = leadMinutes * 60_000;
  const halfWindow = 30_000;
  return {
    from: new Date(now.getTime() + leadMs - halfWindow),
    to: new Date(now.getTime() + leadMs + halfWindow),
  };
}

async function main() {
  await connectDatabase();

  const leadMinutes = getLeadMinutes();
  const now = new Date();
  const window = buildDueWindow(now, leadMinutes);

  const report = {
    now: now.toISOString(),
    smtpConfigured: isEmailConfigured(),
    remindersEnabled: isRemindersEnabled(),
    leadMinutes,
    reminderWindow: {
      from: window.from.toISOString(),
      to: window.to.toISOString(),
    },
  };

  const withDue = await Task.find({ dueDate: { $ne: null } })
    .populate("user", "name email")
    .select("title dueDate status deadlineReminderSentAt user")
    .lean();

  report.tasksWithDueDate = withDue.length;
  report.tasks = withDue.map((t) => {
    const due = new Date(t.dueDate);
    const minsUntilDue = Math.round((due - now) / 60_000);
    const inWindow = due >= window.from && due <= window.to;
    return {
      title: t.title,
      status: t.status,
      dueDate: due.toISOString(),
      minutesUntilDue: minsUntilDue,
      reminderAlreadySent: Boolean(t.deadlineReminderSentAt),
      inReminderWindowNow: inWindow,
      userEmail: t.user?.email || "(missing)",
    };
  });

  const eligibleNow = withDue.filter((t) => {
    const due = new Date(t.dueDate);
    return (
      due >= window.from &&
      due <= window.to &&
      !t.deadlineReminderSentAt &&
      t.status !== "Completed" &&
      t.user?.email
    );
  });

  report.eligibleForEmailRightNow = eligibleNow.length;

  if (eligibleNow.length > 0) {
    report.manualCheck = await runDeadlineReminderCheck();
  } else {
    report.manualCheck = { checked: 0, sent: 0, note: "No tasks in 30-min window right now" };
  }

  console.log(JSON.stringify(report, null, 2));
  process.exit(0);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
