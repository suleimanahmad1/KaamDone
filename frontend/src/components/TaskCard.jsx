import { FaEdit, FaTrash, FaCalendarAlt, FaClock } from "react-icons/fa";
import TaskAttachmentLink from "./TaskAttachmentLink";
import {
  borderAccent,
  formatDueDate,
  isOverdue,
  priorityStyles,
  statusStyles,
} from "../utils/taskUtils";
import { taskLastActivityLabel } from "../utils/relativeTime";

export default function TaskCard({ task, onEdit, onDelete }) {
  const priority = task.priority || "Medium";
  const status = task.status || "Pending";
  const overdue = isOverdue(task);

  return (
    <article
      className={`flex flex-col rounded-xl border bg-white p-5 shadow-sm transition hover:shadow-md border-l-4 dark:bg-slate-800 ${
        overdue
          ? "border-red-300 bg-red-50/50 border-l-red-600 dark:border-red-800 dark:bg-red-950/30"
          : `border-slate-200 dark:border-slate-700 ${borderAccent[priority] || borderAccent.Medium}`
      }`}
    >
      <div className="mb-3 flex items-start justify-between gap-3">
        <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-100">{task.title}</h3>
        <div className="flex shrink-0 gap-1">
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
      </div>

      {task.description ? (
        <p className="mb-4 flex-1 text-sm leading-relaxed text-slate-600 dark:text-slate-400">
          {task.description}
        </p>
      ) : (
        <p className="mb-4 flex-1 text-sm italic text-slate-400 dark:text-slate-500">No description</p>
      )}

      <div className="mb-4 flex flex-wrap gap-2">
        <span
          className={`rounded-full border px-2.5 py-0.5 text-xs font-medium ${priorityStyles[priority] || priorityStyles.Medium}`}
        >
          {priority}
        </span>
        <span
          className={`rounded-full border px-2.5 py-0.5 text-xs font-medium ${statusStyles[status] || statusStyles.Pending}`}
        >
          {status}
        </span>
      </div>

      <div className="mt-auto space-y-1.5">
        <div
          className={`flex items-center gap-2 text-sm ${overdue ? "font-medium text-red-700 dark:text-red-400" : "text-slate-500 dark:text-slate-400"}`}
        >
          <FaCalendarAlt className={`shrink-0 ${overdue ? "text-red-600 dark:text-red-400" : "text-slate-400"}`} />
          <span>
            {overdue ? `Overdue — ${formatDueDate(task.dueDate)}` : formatDueDate(task.dueDate)}
          </span>
        </div>
        {taskLastActivityLabel(task) && (
          <p className="flex items-center gap-1.5 text-xs text-slate-400">
            <FaClock className="shrink-0" />
            {taskLastActivityLabel(task)}
          </p>
        )}
        <TaskAttachmentLink task={task} />
      </div>
    </article>
  );
}
