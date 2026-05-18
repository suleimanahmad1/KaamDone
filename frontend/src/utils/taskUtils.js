export function formatDueDate(date) {
  if (!date) return "No due date";
  const d = new Date(date);
  if (Number.isNaN(d.getTime())) return "No due date";
  const hasTime =
    d.getHours() !== 0 || d.getMinutes() !== 0 || d.getSeconds() !== 0 || d.getMilliseconds() !== 0;
  const datePart = d.toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
  if (!hasTime) return datePart;
  const timePart = d.toLocaleTimeString(undefined, {
    hour: "numeric",
    minute: "2-digit",
  });
  return `${datePart} at ${timePart}`;
}

export function isOverdue(task) {
  if (!task.dueDate || task.status === "Completed") return false;
  const due = new Date(task.dueDate);
  if (Number.isNaN(due.getTime())) return false;
  return due.getTime() < Date.now();
}

export function combineDateAndTime(dateStr, timeStr) {
  if (!dateStr) return null;
  const time = timeStr?.trim() || "23:59";
  const iso = new Date(`${dateStr}T${time}:00`);
  if (Number.isNaN(iso.getTime())) return null;
  return iso.toISOString();
}

export function splitDueDateTime(date) {
  if (!date) return { dueDate: "", dueTime: "" };
  const d = new Date(date);
  if (Number.isNaN(d.getTime())) return { dueDate: "", dueTime: "" };
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  const hours = String(d.getHours()).padStart(2, "0");
  const minutes = String(d.getMinutes()).padStart(2, "0");
  return {
    dueDate: `${year}-${month}-${day}`,
    dueTime: `${hours}:${minutes}`,
  };
}

export const priorityStyles = {
  High: "bg-red-100 text-red-700 border-red-200 dark:bg-red-900/40 dark:text-red-300 dark:border-red-800",
  Medium:
    "bg-amber-100 text-amber-800 border-amber-200 dark:bg-amber-900/40 dark:text-amber-300 dark:border-amber-800",
  Low: "bg-emerald-100 text-emerald-800 border-emerald-200 dark:bg-emerald-900/40 dark:text-emerald-300 dark:border-emerald-800",
};

export const statusStyles = {
  Pending:
    "bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-700 dark:text-slate-200 dark:border-slate-600",
  "In Progress":
    "bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-900/40 dark:text-blue-300 dark:border-blue-800",
  Completed:
    "bg-green-100 text-green-700 border-green-200 dark:bg-green-900/40 dark:text-green-300 dark:border-green-800",
};

export const borderAccent = {
  High: "border-l-red-500",
  Medium: "border-l-amber-500",
  Low: "border-l-emerald-500",
};
