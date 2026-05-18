const { Task, STATUS_VALUES } = require("../models/Task");
const { sendTaskDeadlineReminderEmail, isEmailConfigured } = require("./sendEmail");

const DEFAULT_LEAD_MINUTES = 30;
const DEFAULT_CHECK_INTERVAL_MS = 60_000;
const WINDOW_MS = 60_000;

function getLeadMinutes() {
  const n = Number(process.env.DEADLINE_REMINDER_MINUTES);
  return Number.isFinite(n) && n > 0 ? Math.floor(n) : DEFAULT_LEAD_MINUTES;
}

function getCheckIntervalMs() {
  const n = Number(process.env.DEADLINE_REMINDER_CHECK_MS);
  return Number.isFinite(n) && n >= 15_000 ? Math.floor(n) : DEFAULT_CHECK_INTERVAL_MS;
}

function isRemindersEnabled() {
  if (String(process.env.DEADLINE_REMINDERS_ENABLED || "true").toLowerCase() === "false") {
    return false;
  }
  return isEmailConfigured();
}

/**
 * Tasks whose dueDate falls in [now + lead - tolerance, now + lead + tolerance]
 * so a once-per-minute job catches the 30-minute-before moment.
 */
function buildDueWindow(now, leadMinutes) {
  const leadMs = leadMinutes * 60_000;
  const halfWindow = Math.max(WINDOW_MS / 2, 30_000);
  return {
    from: new Date(now.getTime() + leadMs - halfWindow),
    to: new Date(now.getTime() + leadMs + halfWindow),
  };
}

async function sendReminderForTask(task, user, leadMinutes) {
  const claimed = await Task.findOneAndUpdate(
    {
      _id: task._id,
      deadlineReminderSentAt: null,
      status: { $ne: "Completed" },
    },
    { $set: { deadlineReminderSentAt: new Date() } },
    { new: false }
  );

  if (!claimed) return false;

  try {
    await sendTaskDeadlineReminderEmail({
      to: user.email,
      userName: user.name,
      taskTitle: task.title,
      dueDate: task.dueDate,
      minutesLeft: leadMinutes,
    });
    console.log(`Deadline reminder sent: "${task.title}" → ${user.email}`);
    return true;
  } catch (err) {
    await Task.updateOne({ _id: task._id }, { $unset: { deadlineReminderSentAt: 1 } });
    console.error(`Deadline reminder failed for task ${task._id}:`, err.message);
    return false;
  }
}

async function runDeadlineReminderCheck() {
  if (!isRemindersEnabled()) return { checked: 0, sent: 0 };

  const now = new Date();
  const leadMinutes = getLeadMinutes();
  const { from, to } = buildDueWindow(now, leadMinutes);

  const tasks = await Task.find({
    dueDate: { $gte: from, $lte: to },
    deadlineReminderSentAt: null,
    status: { $in: STATUS_VALUES.filter((s) => s !== "Completed") },
  })
    .populate("user", "name email")
    .lean();

  let sent = 0;
  for (const task of tasks) {
    const user = task.user;
    if (!user?.email) continue;
    const ok = await sendReminderForTask(task, user, leadMinutes);
    if (ok) sent += 1;
  }

  return { checked: tasks.length, sent };
}

let intervalId = null;

function startDeadlineReminderScheduler() {
  if (!isRemindersEnabled()) {
    console.log(
      "Deadline reminders: off (set SMTP_HOST, SMTP_USER, SMTP_PASS in .env to enable)"
    );
    return;
  }

  const leadMinutes = getLeadMinutes();
  const intervalMs = getCheckIntervalMs();

  console.log(
    `Deadline reminders: every ${intervalMs / 1000}s, ${leadMinutes} min before due date`
  );

  const tick = () => {
    runDeadlineReminderCheck().catch((err) => {
      console.error("Deadline reminder check error:", err.message);
    });
  };

  tick();
  intervalId = setInterval(tick, intervalMs);
}

function stopDeadlineReminderScheduler() {
  if (intervalId) {
    clearInterval(intervalId);
    intervalId = null;
  }
}

module.exports = {
  runDeadlineReminderCheck,
  startDeadlineReminderScheduler,
  stopDeadlineReminderScheduler,
  getLeadMinutes,
};
