const TaskActivity = require("../models/TaskActivity");

async function recordActivity({ taskId, userId, action, message }) {
  if (!taskId || !userId || !message) return;
  await TaskActivity.create({
    task: taskId,
    user: userId,
    action,
    message,
  });
}

function buildUpdateMessages(oldTask, updates) {
  const messages = [];

  if (updates.title !== undefined && updates.title !== oldTask.title) {
    messages.push(`Title changed to "${updates.title}"`);
  }
  if (updates.description !== undefined && updates.description !== oldTask.description) {
    messages.push("Description updated");
  }
  if (updates.status !== undefined && updates.status !== oldTask.status) {
    messages.push(`Status set to ${updates.status}`);
  }
  if (updates.priority !== undefined && updates.priority !== oldTask.priority) {
    messages.push(`Priority set to ${updates.priority}`);
  }
  if (updates.dueDate !== undefined) {
    const oldTime = oldTask.dueDate ? new Date(oldTask.dueDate).getTime() : null;
    const newTime = updates.dueDate ? new Date(updates.dueDate).getTime() : null;
    if (oldTime !== newTime) {
      messages.push(updates.dueDate ? "Due date updated" : "Due date removed");
    }
  }
  if (updates.attachments !== undefined) {
    const oldCount = oldTask.attachments?.length || 0;
    const newCount = updates.attachments?.length || 0;
    if (newCount > oldCount) {
      messages.push(`${newCount - oldCount} attachment(s) added`);
    } else if (newCount < oldCount) {
      messages.push(`${oldCount - newCount} attachment(s) removed`);
    } else if (newCount > 0) {
      messages.push("Attachments updated");
    }
  }

  return messages;
}

module.exports = { recordActivity, buildUpdateMessages };
