import { useCallback, useEffect, useState } from "react";
import { FaClipboardList, FaList, FaPlus, FaSearch, FaTh } from "react-icons/fa";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { getApiErrorMessage } from "../api";
import ConfirmDialog from "../components/ConfirmDialog";
import TaskCard from "../components/TaskCard";
import TaskModal from "../components/TaskModal";
import TaskRow from "../components/TaskRow";
import TaskSkeleton from "../components/TaskSkeleton";
import UserAvatar from "../components/UserAvatar";
import { useAuth } from "../context/AuthContext";
import { useDebouncedValue } from "../hooks/useDebouncedValue";
import * as taskService from "../services/taskService";
import { buildTaskQueryParams } from "../utils/taskQuery";

const STATUS_FILTER_OPTIONS = ["", "Pending", "In Progress", "Completed"];
const PRIORITY_FILTER_OPTIONS = ["", "Low", "Medium", "High"];
const VIEW_KEY = "taskView";
const SEARCH_DEBOUNCE_MS = 400;

export default function Home() {
  const { user, userId, logout } = useAuth();
  const navigate = useNavigate();
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [currentTask, setCurrentTask] = useState(null);

  const [searchInput, setSearchInput] = useState("");
  const debouncedSearch = useDebouncedValue(searchInput, SEARCH_DEBOUNCE_MS);
  const [statusFilter, setStatusFilter] = useState("");
  const [priorityFilter, setPriorityFilter] = useState("");
  const sortBy = "createdAt";
  const [viewMode, setViewMode] = useState(() => {
    const saved = localStorage.getItem(VIEW_KEY);
    return saved === "list" ? "list" : "grid";
  });

  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const setView = (mode) => {
    setViewMode(mode);
    localStorage.setItem(VIEW_KEY, mode);
  };

  const queryParams = useCallback(
    () =>
      buildTaskQueryParams({
        search: debouncedSearch,
        statusFilter,
        priorityFilter,
        sortBy,
      }),
    [debouncedSearch, statusFilter, priorityFilter, sortBy]
  );

  useEffect(() => {
    if (!userId) {
      queueMicrotask(() => {
        setTasks([]);
        setLoading(false);
      });
      return undefined;
    }

    const controller = new AbortController();

    async function load() {
      setLoading(true);
      try {
        const list = await taskService.fetchTasks(queryParams(), controller.signal);
        if (!controller.signal.aborted) setTasks(list);
      } catch (error) {
        if (controller.signal.aborted) return;
        if (error.response?.status === 401) {
          logout();
          navigate("/", { replace: true });
          return;
        }
        toast.error(getApiErrorMessage(error));
        if (!controller.signal.aborted) setTasks([]);
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    }

    load();
    return () => controller.abort();
  }, [userId, queryParams, logout, navigate]);

  const refetchTasks = async () => {
    if (!userId) return;
    try {
      const list = await taskService.fetchTasks(queryParams());
      setTasks(list);
    } catch (error) {
      toast.error(getApiErrorMessage(error));
    }
  };

  const openAddModal = () => {
    setCurrentTask(null);
    setModalOpen(true);
  };

  const openEditModal = async (task) => {
    try {
      const full = await taskService.getTask(task._id);
      setCurrentTask(full);
      setModalOpen(true);
    } catch (error) {
      toast.error(getApiErrorMessage(error));
    }
  };

  const closeModal = () => {
    setModalOpen(false);
    setCurrentTask(null);
  };

  const requestDelete = (task) => setDeleteTarget(task);

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await taskService.deleteTask(deleteTarget._id);
      toast.success("Task deleted successfully");
      setDeleteTarget(null);
      await refetchTasks();
    } catch (error) {
      toast.error(getApiErrorMessage(error));
    } finally {
      setDeleting(false);
    }
  };

  const hasActiveFilters = Boolean(debouncedSearch.trim() || statusFilter || priorityFilter);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
      <header className="border-b border-slate-200 bg-white shadow-sm dark:border-slate-700 dark:bg-slate-800">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 px-4 py-6 sm:flex-row sm:items-center sm:justify-between sm:px-6 lg:px-8">
          <div>
            <h1 className="text-2xl font-bold text-slate-800 dark:text-white sm:text-3xl">KaamDone</h1>
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
              Welcome, <span className="font-medium text-slate-700 dark:text-slate-200">{user?.name}</span> — your
              tasks, due dates, files & activity
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Link
              to="/profile"
              className="inline-flex items-center justify-center gap-2 rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-50 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
            >
              <UserAvatar user={user} size="sm" className="!h-7 !w-7 !text-xs" />
              Profile
            </Link>
            <button
              type="button"
              onClick={openAddModal}
              className="inline-flex items-center justify-center gap-2 rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-indigo-700"
            >
              <FaPlus />
              Add Task
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <section className="mb-8 rounded-xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-700 dark:bg-slate-800 sm:p-5">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
            <div className="relative md:col-span-1">
              <FaSearch className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="search"
                placeholder="Search by title..."
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                className="w-full rounded-lg border border-slate-300 bg-white py-2 pl-10 pr-3 text-sm text-slate-800 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-100"
                aria-label="Search tasks by title"
              />
            </div>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-800 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-100"
              aria-label="Filter by status"
            >
              <option value="">All statuses</option>
              {STATUS_FILTER_OPTIONS.filter(Boolean).map((opt) => (
                <option key={opt} value={opt}>
                  {opt}
                </option>
              ))}
            </select>

            <select
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
              className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-800 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-100"
              aria-label="Filter by priority"
            >
              <option value="">All priorities</option>
              {PRIORITY_FILTER_OPTIONS.filter(Boolean).map((opt) => (
                <option key={opt} value={opt}>
                  {opt}
                </option>
              ))}
            </select>

            <div
              className="flex w-full overflow-hidden rounded-lg border border-slate-300 bg-white dark:border-slate-600 dark:bg-slate-900"
              role="group"
              aria-label="Task view mode"
            >
              <button
                type="button"
                onClick={() => setView("grid")}
                className={`inline-flex flex-1 items-center justify-center gap-1.5 py-2 text-sm font-medium transition ${
                  viewMode === "grid"
                    ? "bg-indigo-600 text-white"
                    : "text-slate-600 hover:bg-slate-50 dark:text-slate-300 dark:hover:bg-slate-800"
                }`}
                aria-pressed={viewMode === "grid"}
              >
                <FaTh />
                Grid
              </button>
              <button
                type="button"
                onClick={() => setView("list")}
                className={`inline-flex flex-1 items-center justify-center gap-1.5 border-l border-slate-300 py-2 text-sm font-medium transition dark:border-slate-600 ${
                  viewMode === "list"
                    ? "bg-indigo-600 text-white"
                    : "text-slate-600 hover:bg-slate-50 dark:text-slate-300 dark:hover:bg-slate-800"
                }`}
                aria-pressed={viewMode === "list"}
              >
                <FaList />
                List
              </button>
            </div>
          </div>

        </section>

        {loading ? (
          <div
            className={
              viewMode === "list" ? "space-y-3" : "grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3"
            }
          >
            {Array.from({ length: viewMode === "list" ? 5 : 6 }).map((_, i) => (
              <TaskSkeleton key={i} />
            ))}
          </div>
        ) : tasks.length === 0 ? (
          <div className="rounded-xl border border-dashed border-slate-300 bg-white px-6 py-16 text-center dark:border-slate-600 dark:bg-slate-800">
            <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-slate-100 text-2xl text-slate-500 dark:bg-slate-700 dark:text-slate-300">
              <FaClipboardList />
            </span>
            <p className="mt-4 text-lg font-medium text-slate-700 dark:text-slate-200">
              {hasActiveFilters ? "No tasks match" : "No tasks yet"}
            </p>
            <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
              {hasActiveFilters ? "Try adjusting your search or filters." : "Add your first task to get started."}
            </p>
            {!hasActiveFilters && (
              <button
                type="button"
                onClick={openAddModal}
                className="mt-6 inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-indigo-700"
              >
                <FaPlus />
                Add first task
              </button>
            )}
          </div>
        ) : viewMode === "list" ? (
          <div className="space-y-3">
            {tasks.map((task) => (
              <TaskRow key={task._id} task={task} onEdit={openEditModal} onDelete={requestDelete} />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {tasks.map((task) => (
              <TaskCard key={task._id} task={task} onEdit={openEditModal} onDelete={requestDelete} />
            ))}
          </div>
        )}
      </main>

      <TaskModal isOpen={modalOpen} onClose={closeModal} task={currentTask} onSaved={refetchTasks} />

      <ConfirmDialog
        open={Boolean(deleteTarget)}
        title="Delete task?"
        message={
          deleteTarget
            ? `"${deleteTarget.title}" will be removed permanently. This cannot be undone.`
            : ""
        }
        confirmLabel="Delete"
        cancelLabel="Keep task"
        variant="danger"
        loading={deleting}
        onConfirm={confirmDelete}
        onCancel={() => !deleting && setDeleteTarget(null)}
      />
    </div>
  );
}
