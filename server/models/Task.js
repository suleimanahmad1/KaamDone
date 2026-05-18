const mongoose = require("mongoose");

const STATUS_VALUES = ["Pending", "In Progress", "Completed"];
const PRIORITY_VALUES = ["Low", "Medium", "High"];

const attachmentSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    mimeType: { type: String, required: true },
    size: { type: Number, required: true },
    /** Legacy inline base64; new uploads use gridFsId only */
    data: { type: String },
    gridFsId: { type: String },
    uploadedAt: { type: Date, default: Date.now },
  },
  { _id: true }
);

const taskSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Title is required"],
      trim: true,
    },
    description: {
      type: String,
      trim: true,
      default: "",
    },
    status: {
      type: String,
      enum: STATUS_VALUES,
      default: "Pending",
    },
    priority: {
      type: String,
      enum: PRIORITY_VALUES,
      default: "Medium",
    },
    dueDate: {
      type: Date,
      default: null,
    },
    /** Set when the "30 min before deadline" email was sent (avoids duplicates). */
    deadlineReminderSentAt: {
      type: Date,
      default: null,
    },
    attachments: {
      type: [attachmentSchema],
      default: [],
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
  },
  { timestamps: true }
);

taskSchema.index({ user: 1, createdAt: -1 });
taskSchema.index({ dueDate: 1, deadlineReminderSentAt: 1, status: 1 });

const Task = mongoose.model("Task", taskSchema);

module.exports = { Task, STATUS_VALUES, PRIORITY_VALUES };
