const mongoose = require("mongoose");
const { Task, STATUS_VALUES, PRIORITY_VALUES } = require("../models/Task");
const TaskActivity = require("../models/TaskActivity");
const { getUserObjectId } = require("../utils/userId");
const { recordActivity, buildUpdateMessages } = require("../utils/taskActivity");
const {
  stripAttachmentPayload,
  resolveAttachmentsForSave,
  hydrateTaskAttachments,
  deleteTaskAttachmentFiles,
} = require("../utils/taskAttachments");

function escapeRegex(value) {
  return String(value).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function badRequest(message) {
  const err = new Error(message);
  err.statusCode = 400;
  return err;
}

function isValidObjectId(id) {
  return mongoose.Types.ObjectId.isValid(id);
}

function parseDueDate(dueDate) {
  if (dueDate === undefined || dueDate === null || dueDate === "") return null;
  const parsed = new Date(dueDate);
  if (Number.isNaN(parsed.getTime())) return badRequest("dueDate must be a valid date");
  return parsed;
}

function parseAttachmentsField(raw) {
  if (raw === undefined || raw === null || raw === "") return undefined;
  if (typeof raw === "string") {
    try {
      return JSON.parse(raw);
    } catch {
      return badRequest("Invalid attachments JSON");
    }
  }
  if (Array.isArray(raw)) return raw;
  return badRequest("attachments must be an array");
}

function readTaskBody(req) {
  const body = { ...req.body };
  if (typeof body.attachments === "string") {
    const parsed = parseAttachmentsField(body.attachments);
    if (parsed instanceof Error) return parsed;
    body.attachments = parsed;
  }
  return body;
}

/** POST /api/tasks */
async function createTask(req, res, next) {
  try {
    const body = readTaskBody(req);
    if (body instanceof Error) return next(body);

    const { title, description, status, priority, dueDate, attachments } = body;
    const files = req.files || [];

    if (title === undefined || title === null || String(title).trim() === "") {
      return next(badRequest("Title is required"));
    }
    if (status !== undefined && !STATUS_VALUES.includes(status)) {
      return next(badRequest(`status must be one of: ${STATUS_VALUES.join(", ")}`));
    }
    if (priority !== undefined && !PRIORITY_VALUES.includes(priority)) {
      return next(badRequest(`priority must be one of: ${PRIORITY_VALUES.join(", ")}`));
    }

    const parsedDueDate = parseDueDate(dueDate);
    if (parsedDueDate instanceof Error) return next(parsedDueDate);

    const attachmentInput = attachments !== undefined ? attachments : [];
    const resolved = await resolveAttachmentsForSave([], attachmentInput, files);
    if (resolved instanceof Error) return next(resolved);

    const userId = getUserObjectId(req);

    const task = await Task.create({
      title: String(title).trim(),
      description: description !== undefined ? String(description).trim() : "",
      status,
      priority,
      dueDate: parsedDueDate,
      attachments: resolved,
      user: userId,
    });

    await recordActivity({
      taskId: task._id,
      userId,
      action: "created",
      message: "Task created",
    });

    if (resolved.length > 0) {
      await recordActivity({
        taskId: task._id,
        userId,
        action: "attachment_added",
        message: `${resolved.length} file(s) attached`,
      });
    }

    const hydrated = await hydrateTaskAttachments(task.toObject());
    res.status(201).json({ success: true, data: hydrated });
  } catch (err) {
    if (err.name === "ValidationError") {
      const message = Object.values(err.errors)
        .map((e) => e.message)
        .join(" ");
      return next(badRequest(message || "Validation failed"));
    }
    next(err);
  }
}

const SORT_FIELDS = ["createdAt", "updatedAt", "dueDate", "priority"];
const PRIORITY_RANK = { High: 3, Medium: 2, Low: 1 };

/** GET /api/tasks?search=&status=&priority=&sortBy=&sortOrder= */
async function getTasks(req, res, next) {
  try {
    const { search, status, priority, sortBy = "createdAt", sortOrder = "desc" } = req.query;
    const userId = getUserObjectId(req);
    const filter = { user: userId };

    if (search !== undefined && search !== null && String(search).trim() !== "") {
      filter.title = { $regex: escapeRegex(String(search).trim()), $options: "i" };
    }

    if (status !== undefined && status !== null && String(status).trim() !== "") {
      const s = String(status).trim();
      if (!STATUS_VALUES.includes(s)) {
        return next(badRequest(`status must be one of: ${STATUS_VALUES.join(", ")}`));
      }
      filter.status = s;
    }

    if (priority !== undefined && priority !== null && String(priority).trim() !== "") {
      const p = String(priority).trim();
      if (!PRIORITY_VALUES.includes(p)) {
        return next(badRequest(`priority must be one of: ${PRIORITY_VALUES.join(", ")}`));
      }
      filter.priority = p;
    }

    const field = String(sortBy).trim();
    if (!SORT_FIELDS.includes(field)) {
      return next(badRequest(`sortBy must be one of: ${SORT_FIELDS.join(", ")}`));
    }

    const order = String(sortOrder).toLowerCase() === "asc" ? 1 : -1;

    if (field === "priority") {
      const tasks = await Task.find(filter).lean();
      tasks.sort((a, b) => {
        const rankA = PRIORITY_RANK[a.priority] ?? 0;
        const rankB = PRIORITY_RANK[b.priority] ?? 0;
        if (rankA !== rankB) return order === 1 ? rankA - rankB : rankB - rankA;
        return new Date(b.createdAt) - new Date(a.createdAt);
      });
      return res.json({
        success: true,
        count: tasks.length,
        data: tasks.map(stripAttachmentPayload),
      });
    }

    const sort =
      field === "dueDate"
        ? { dueDate: order, createdAt: -1 }
        : field === "updatedAt"
          ? { updatedAt: order, createdAt: -1 }
          : { createdAt: order };

    const tasks = await Task.find(filter).sort(sort).lean();
    res.json({
      success: true,
      count: tasks.length,
      data: tasks.map(stripAttachmentPayload),
    });
  } catch (err) {
    next(err);
  }
}

/** GET /api/tasks/:id — full task with attachment file data for editing */
async function getTask(req, res, next) {
  try {
    const { id } = req.params;
    if (!isValidObjectId(id)) return next(badRequest("Invalid task ID"));

    const task = await Task.findOne({ _id: id, user: req.user._id }).lean();
    if (!task) {
      const err = new Error("Task not found");
      err.statusCode = 404;
      return next(err);
    }

    const hydrated = await hydrateTaskAttachments(task);
    res.json({ success: true, data: hydrated });
  } catch (err) {
    next(err);
  }
}

/** GET /api/tasks/:id/activity */
async function getTaskActivity(req, res, next) {
  try {
    const { id } = req.params;
    if (!isValidObjectId(id)) return next(badRequest("Invalid task ID"));

    const task = await Task.findOne({ _id: id, user: req.user._id }).select("_id");
    if (!task) {
      const err = new Error("Task not found");
      err.statusCode = 404;
      return next(err);
    }

    const activities = await TaskActivity.find({ task: id })
      .sort({ createdAt: -1 })
      .limit(50)
      .lean();

    res.json({ success: true, count: activities.length, data: activities });
  } catch (err) {
    next(err);
  }
}

/** PUT /api/tasks/:id */
async function updateTask(req, res, next) {
  try {
    const { id } = req.params;
    if (!isValidObjectId(id)) return next(badRequest("Invalid task ID"));

    const existing = await Task.findOne({ _id: id, user: req.user._id });
    if (!existing) {
      const err = new Error("Task not found");
      err.statusCode = 404;
      return next(err);
    }

    const body = readTaskBody(req);
    if (body instanceof Error) return next(body);

    const { title, description, status, priority, dueDate, attachments } = body;
    const files = req.files || [];
    const updates = {};

    if (title !== undefined) {
      if (String(title).trim() === "") return next(badRequest("Title cannot be empty"));
      updates.title = String(title).trim();
    }
    if (description !== undefined) updates.description = String(description).trim();
    if (status !== undefined) {
      if (!STATUS_VALUES.includes(status)) {
        return next(badRequest(`status must be one of: ${STATUS_VALUES.join(", ")}`));
      }
      updates.status = status;
    }
    if (priority !== undefined) {
      if (!PRIORITY_VALUES.includes(priority)) {
        return next(badRequest(`priority must be one of: ${PRIORITY_VALUES.join(", ")}`));
      }
      updates.priority = priority;
    }
    if (dueDate !== undefined) {
      if (dueDate === null || dueDate === "") {
        updates.dueDate = null;
        updates.deadlineReminderSentAt = null;
      } else {
        const d = parseDueDate(dueDate);
        if (d instanceof Error) return next(d);
        const prevMs = existing.dueDate ? new Date(existing.dueDate).getTime() : null;
        const nextMs = d.getTime();
        updates.dueDate = d;
        if (prevMs !== nextMs) {
          updates.deadlineReminderSentAt = null;
        }
      }
    }

    if (attachments !== undefined || files.length > 0) {
      const attachmentInput =
        attachments !== undefined ? attachments : existing.attachments.map((a) => a.toObject());
      const resolved = await resolveAttachmentsForSave(
        existing.attachments,
        attachmentInput,
        files
      );
      if (resolved instanceof Error) return next(resolved);
      updates.attachments = resolved;
    }

    if (Object.keys(updates).length === 0) {
      return next(badRequest("No valid fields to update"));
    }

    const task = await Task.findOneAndUpdate({ _id: id, user: req.user._id }, updates, {
      new: true,
      runValidators: true,
    });

    const messages = buildUpdateMessages(existing.toObject(), updates);
    const userId = getUserObjectId(req);
    for (const message of messages) {
      await recordActivity({
        taskId: task._id,
        userId,
        action: "updated",
        message,
      });
    }
    if (messages.length === 0) {
      await recordActivity({
        taskId: task._id,
        userId,
        action: "updated",
        message: "Task updated",
      });
    }

    const hydrated = await hydrateTaskAttachments(task.toObject());
    res.json({ success: true, data: hydrated });
  } catch (err) {
    if (err.name === "ValidationError") {
      const message = Object.values(err.errors)
        .map((e) => e.message)
        .join(" ");
      return next(badRequest(message || "Validation failed"));
    }
    next(err);
  }
}

/** DELETE /api/tasks/:id */
async function deleteTask(req, res, next) {
  try {
    const { id } = req.params;
    if (!isValidObjectId(id)) return next(badRequest("Invalid task ID"));

    const userId = getUserObjectId(req);
    const task = await Task.findOneAndDelete({ _id: id, user: userId });
    if (!task) {
      const err = new Error("Task not found");
      err.statusCode = 404;
      return next(err);
    }

    await deleteTaskAttachmentFiles(task);
    await TaskActivity.deleteMany({ task: id });

    res.json({ success: true, message: "Task deleted", data: stripAttachmentPayload(task) });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  createTask,
  getTasks,
  getTask,
  getTaskActivity,
  updateTask,
  deleteTask,
};
