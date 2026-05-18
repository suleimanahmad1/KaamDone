import { useEffect, useState } from "react";
import { FaTimes } from "react-icons/fa";
import { toast } from "react-toastify";
import { getApiErrorMessage, getFieldErrors } from "../api";
import * as taskService from "../services/taskService";
import { fieldClassName, labelClassName } from "../styles/formStyles";
import { combineDateAndTime, splitDueDateTime } from "../utils/taskUtils";
import TaskAttachments from "./TaskAttachments";
import TaskActivityList from "./TaskActivityList";

const STATUS_OPTIONS = ["Pending", "In Progress", "Completed"];
const PRIORITY_OPTIONS = ["Low", "Medium", "High"];

const emptyForm = {
  title: "",
  description: "",
  status: "Pending",
  priority: "Medium",
  dueDate: "",
  dueTime: "",
  attachments: [],
};

export default function TaskModal({ isOpen, onClose, task, onSaved }) {
  const [form, setForm] = useState(emptyForm);
  const [submitting, setSubmitting] = useState(false);
  const [fieldErrors, setFieldErrors] = useState({});

  const isEditing = Boolean(task?._id);

  useEffect(() => {
    if (!isOpen) return;

    queueMicrotask(() => {
      if (task) {
        const { dueDate, dueTime } = splitDueDateTime(task.dueDate);
        setForm({
          title: task.title || "",
          description: task.description || "",
          status: task.status || "Pending",
          priority: task.priority || "Medium",
          dueDate,
          dueTime,
          attachments: task.attachments ? [...task.attachments] : [],
        });
      } else {
        setForm(emptyForm);
      }
      setFieldErrors({});
    });
  }, [isOpen, task]);

  if (!isOpen) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => {
      const next = { ...prev, [name]: value };
      if (name === "dueDate" && !value) next.dueTime = "";
      return next;
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.title.trim()) {
      toast.error("Title is required");
      return;
    }

    const payload = {
      title: form.title.trim(),
      description: form.description.trim(),
      status: form.status,
      priority: form.priority,
      dueDate: combineDateAndTime(form.dueDate, form.dueTime),
      attachments: form.attachments,
    };

    setSubmitting(true);
    setFieldErrors({});
    try {
      if (isEditing) {
        await taskService.updateTask(task._id, payload);
        toast.success("Task updated successfully");
      } else {
        await taskService.createTask(payload);
        toast.success("Task created successfully");
      }
      onSaved();
      onClose();
    } catch (error) {
      setFieldErrors(getFieldErrors(error));
      toast.error(getApiErrorMessage(error));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm dark:bg-black/70"
        onClick={onClose}
        aria-hidden="true"
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="task-modal-title"
        className="relative z-10 flex max-h-[92vh] w-full max-w-2xl flex-col rounded-xl border border-slate-200 bg-white shadow-2xl dark:border-slate-600 dark:bg-slate-800"
      >
        <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4 dark:border-slate-600">
          <h2 id="task-modal-title" className="text-xl font-semibold text-slate-900 dark:text-white">
            {isEditing ? "Edit Task" : "Add New Task"}
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-2 text-slate-500 transition hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-slate-700 dark:hover:text-slate-200"
            aria-label="Close modal"
          >
            <FaTimes />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 overflow-y-auto px-6 py-5">
          <div>
            <label htmlFor="title" className={labelClassName}>
              Title <span className="text-red-500">*</span>
            </label>
            <input
              id="title"
              name="title"
              type="text"
              required
              value={form.title}
              onChange={handleChange}
              placeholder="Enter task title"
              className={fieldClassName}
            />
            {fieldErrors.title && (
              <p className="mt-1 text-sm text-red-600 dark:text-red-400">{fieldErrors.title}</p>
            )}
          </div>

          <div>
            <label htmlFor="description" className={labelClassName}>
              Description
            </label>
            <textarea
              id="description"
              name="description"
              rows={3}
              value={form.description}
              onChange={handleChange}
              placeholder="Optional description"
              className={`${fieldClassName} resize-none`}
            />
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="status" className={labelClassName}>
                Status
              </label>
              <select
                id="status"
                name="status"
                value={form.status}
                onChange={handleChange}
                className={fieldClassName}
              >
                {STATUS_OPTIONS.map((opt) => (
                  <option key={opt} value={opt}>
                    {opt}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="priority" className={labelClassName}>
                Priority
              </label>
              <select
                id="priority"
                name="priority"
                value={form.priority}
                onChange={handleChange}
                className={fieldClassName}
              >
                {PRIORITY_OPTIONS.map((opt) => (
                  <option key={opt} value={opt}>
                    {opt}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="dueDate" className={labelClassName}>
                Due date
              </label>
              <input
                id="dueDate"
                name="dueDate"
                type="date"
                value={form.dueDate}
                onChange={handleChange}
                className={fieldClassName}
              />
            </div>
            <div>
              <label htmlFor="dueTime" className={labelClassName}>
                Due time
              </label>
              <input
                id="dueTime"
                name="dueTime"
                type="time"
                value={form.dueTime}
                onChange={handleChange}
                disabled={!form.dueDate}
                className={fieldClassName}
              />
              <p className="mt-1 text-xs text-slate-500">Optional — pick a date first</p>
            </div>
          </div>

          <TaskAttachments
            attachments={form.attachments}
            onChange={(attachments) => setForm((prev) => ({ ...prev, attachments }))}
          />

          {isEditing && <TaskActivityList taskId={task._id} key={task._id} />}

          <div className="flex justify-end gap-3 border-t border-slate-200 pt-4 dark:border-slate-600">
            <button
              type="button"
              onClick={onClose}
              disabled={submitting}
              className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50 disabled:opacity-50 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-200 dark:hover:bg-slate-600"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-indigo-700 disabled:opacity-50"
            >
              {submitting ? "Saving..." : isEditing ? "Update Task" : "Create Task"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
