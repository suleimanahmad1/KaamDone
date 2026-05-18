import { useEffect, useState } from "react";
import { FaHistory } from "react-icons/fa";
import { formatRelativeTime } from "../utils/relativeTime";
import * as taskService from "../services/taskService";

export default function TaskActivityList({ taskId }) {
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!taskId) return undefined;

    const controller = new AbortController();
    async function load() {
      setLoading(true);
      try {
        const list = await taskService.fetchTaskActivity(taskId, controller.signal);
        if (!controller.signal.aborted) setActivities(list);
      } catch {
        if (!controller.signal.aborted) setActivities([]);
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    }
    load();
    return () => controller.abort();
  }, [taskId]);

  if (!taskId) return null;

  return (
    <div className="rounded-lg border border-slate-200 bg-slate-50/80 p-4">
      <h3 className="flex items-center gap-2 text-sm font-semibold text-slate-800">
        <FaHistory className="text-indigo-500" />
        Activity history
      </h3>

      {loading ? (
        <p className="mt-3 text-sm text-slate-500">Loading activity...</p>
      ) : activities.length === 0 ? (
        <p className="mt-3 text-sm text-slate-500">No activity yet.</p>
      ) : (
        <ul className="mt-3 max-h-40 space-y-3 overflow-y-auto pr-1">
          {activities.map((item) => (
            <li key={item._id} className="relative border-l-2 border-indigo-200 pl-3">
              <p className="text-sm text-slate-800">{item.message}</p>
              <p className="mt-0.5 text-xs text-slate-500">{formatRelativeTime(item.createdAt)}</p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
