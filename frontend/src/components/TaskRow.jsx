import { FaEdit, FaTrash, FaCalendarAlt, FaClock } from "react-icons/fa";
import TaskAttachmentLink from "./TaskAttachmentLink";
import { taskLastActivityLabel } from "../utils/relativeTime";
import {
  borderAccent,
  formatDueDate,
  isOverdue,
  priorityStyles,
  statusStyles,
} from "../utils/taskUtils";

export default function TaskRow({ task, onEdit, onDelete }) {
  const priority = task.priority || "Medium";
  const status = task.status || "Pending";
  const overdue = isOverdue(task);

  return (
    <article
      className={`flex flex-col gap-3 rounded-lg border bg-white px-4 py-3 shadow-sm transition hover:shadow-md border-l-4 sm:flex-row sm:items-center sm:gap-4 dark:bg-slate-800 ${
        overdue
          ? "border-red-300 bg-red-50/50 border-l-red-600 dark:border-red-800 dark:bg-red-950/30"
          : `border-slate-200 dark:border-slate-700 ${borderAccent[priority] || borderAccent.Medium}`
      }`}
    >
      <div className="min-w-0 flex-1">
        <h3 className="truncate font-semibold text-slate-800 dark:text-slate-100">{task.title}</h3>
        {task.description ? (
          <p className="mt-0.5 truncate text-sm text-slate-500 dark:text-slate-400">
            {task.description}
          </p>
        ) : null}
        {taskLastActivityLabel(task) && (
          <p className="mt-0.5 flex items-center gap-1 text-xs text-slate-400">
            <FaClock className="shrink-0" />
            {taskLastActivityLabel(task)}
          </p>
        )}
        <TaskAttachmentLink task={task} className="mt-0.5" />
      </div>

      <div className="flex flex-wrap items-center gap-2 sm:shrink-0">
        <span
          className={`rounded-full border px-2 py-0.5 text-xs font-medium ${priorityStyles[priority] || priorityStyles.Medium}`}
        >
          {priority}
        </span>
        <span
          className={`rounded-full border px-2 py-0.5 text-xs font-medium ${statusStyles[status] || statusStyles.Pending}`}
        >
          {status}
        </span>
        <span
          className={`inline-flex items-center gap-1 text-xs ${overdue ? "font-medium text-red-700 dark:text-red-400" : "text-slate-500 dark:text-slate-400"}`}
        >
          <FaCalendarAlt className="shrink-0" />
          {overdue ? `Overdue — ${formatDueDate(task.dueDate)}` : formatDueDate(task.dueDate)}
        </span>
      </div>

      <div className="flex shrink-0 gap-1 sm:ml-auto">
        <button
          type="button"
          onClick={() => onEdit(task)}
          className="rounded-lg p-2 text-indigo-600 transition hover:bg-indigo-50 dark:text-indigo-400 dark:hover:bg-indigo-900/40"
          aria-label="Edit task"
        >
          <FaEdit />
        </button>
        <button
          type="button"
          onClick={() => onDelete(task)}
          className="rounded-lg p-2 text-red-600 transition hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/40"
          aria-label="Delete task"
        >
          <FaTrash />
        </button>
      </div>
    </article>
  );
}
