import { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  FaArrowLeft,
  FaCamera,
  FaEdit,
  FaEnvelope,
  FaSignOutAlt,
  FaTimes,
  FaUser,
} from "react-icons/fa";
import { toast } from "react-toastify";
import { getApiErrorMessage, getFieldErrors } from "../api";
import PasswordInput from "../components/PasswordInput";
import UserAvatar from "../components/UserAvatar";
import { getAvatarPosition } from "../utils/avatarPosition";
import AvatarCropModal from "../components/AvatarCropModal";
import { inputClassName, labelClassName } from "../styles/formStyles";
import { useAuth } from "../context/AuthContext";

const MAX_AVATAR_INPUT_BYTES = 2 * 1024 * 1024;

function formatDate(value) {
  if (!value) return "—";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleDateString(undefined, {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

function readImageFileForCrop(file) {
  return new Promise((resolve, reject) => {
    if (!file.type.startsWith("image/")) {
      reject(new Error("Please choose an image file (JPEG, PNG, GIF, or WebP)."));
      return;
    }
    if (file.size > MAX_AVATAR_INPUT_BYTES) {
      reject(new Error("Image must be 2 MB or smaller (you will crop it next)."));
      return;
    }
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = () => reject(new Error("Could not read image."));
    reader.readAsDataURL(file);
  });
}

export default function Profile() {
  const { user, isAuthenticated, logout, updateProfile } = useAuth();
  const navigate = useNavigate();
  const fileInputRef = useRef(null);
  const [editing, setEditing] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);
  const [fieldErrors, setFieldErrors] = useState({});
  const [form, setForm] = useState({
    name: "",
    email: "",
    avatar: "",
    avatarPosition: { x: 50, y: 50, scale: 1 },
    currentPassword: "",
    newPassword: "",
  });
  const [avatarCropSrc, setAvatarCropSrc] = useState(null);

  useEffect(() => {
    if (!user) return;
    queueMicrotask(() => {
      setForm({
        name: user.name || "",
        email: user.email || "",
        avatar: user.avatar || "",
        avatarPosition: getAvatarPosition(user),
        currentPassword: "",
        newPassword: "",
      });
      setAvatarCropSrc(null);
    });
  }, [user]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleAvatarPick = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const dataUrl = await readImageFileForCrop(file);
      setAvatarCropSrc(dataUrl);
    } catch (err) {
      toast.error(err.message || "Invalid image");
    }
    e.target.value = "";
  };

  const removeAvatar = () => {
    setForm((prev) => ({
      ...prev,
      avatar: "",
      avatarPosition: { x: 50, y: 50, scale: 1 },
    }));
    setAvatarCropSrc(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setFieldErrors({});
    try {
      const payload = {
        name: form.name.trim(),
        email: form.email.trim(),
        avatar: form.avatar,
        avatarPosition: form.avatarPosition,
      };
      if (form.newPassword) {
        payload.currentPassword = form.currentPassword;
        payload.newPassword = form.newPassword;
      }
      await updateProfile(payload);
      toast.success("Profile updated");
      setEditing(false);
      setForm((prev) => ({ ...prev, currentPassword: "", newPassword: "" }));
    } catch (error) {
      setFieldErrors(getFieldErrors(error));
      toast.error(getApiErrorMessage(error));
    } finally {
      setSubmitting(false);
    }
  };

  const cancelEdit = () => {
    setEditing(false);
    setFieldErrors({});
    setForm({
      name: user?.name || "",
      email: user?.email || "",
      avatar: user?.avatar || "",
      avatarPosition: getAvatarPosition(user),
      currentPassword: "",
      newPassword: "",
    });
    setAvatarCropSrc(null);
  };

  const applyCroppedAvatar = (dataUrl) => {
    setForm((prev) => ({
      ...prev,
      avatar: dataUrl,
      avatarPosition: { x: 50, y: 50, scale: 1 },
    }));
    setAvatarCropSrc(null);
  };

  const handleLogout = () => {
    setLoggingOut(true);
    logout();
    toast.success("Logged out successfully");
    navigate("/", { replace: true });
  };

  const displayUser = editing
    ? { name: form.name, avatar: form.avatar, avatarPosition: form.avatarPosition }
    : {
        name: user?.name,
        avatar: user?.avatar,
        avatarPosition: user?.avatarPosition,
      };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-indigo-50/40">
      <header className="border-b border-slate-200/80 bg-white/80 backdrop-blur-md">
        <div className="mx-auto flex max-w-3xl items-center justify-between gap-4 px-4 py-4 sm:px-6">
          <Link
            to="/dashboard"
            className="inline-flex items-center gap-2 rounded-lg px-2 py-1.5 text-sm font-medium text-indigo-600 transition hover:bg-indigo-50 hover:text-indigo-700"
          >
            <FaArrowLeft />
            Back to tasks
          </Link>
          {isAuthenticated && !editing && (
            <span className="inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-medium text-emerald-800">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
              </span>
              Signed in
            </span>
          )}
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-4 py-8 sm:px-6">
        <section className="overflow-hidden rounded-2xl border border-indigo-100 bg-gradient-to-br from-indigo-600 via-indigo-600 to-violet-700 p-6 text-white shadow-lg shadow-indigo-200/50 sm:p-8">
          <div className="flex flex-col items-center gap-5 sm:flex-row sm:items-center">
            <div className="relative rounded-full ring-4 ring-white/30 ring-offset-2 ring-offset-indigo-600">
              <UserAvatar user={displayUser} size="lg" className="!h-24 !w-24 !text-3xl" />
              {isAuthenticated && (
                <span
                  className="absolute bottom-1 right-1 h-4 w-4 rounded-full border-2 border-white bg-emerald-400"
                  title="Active session"
                />
              )}
            </div>
            <div className="flex-1 text-center sm:text-left">
              <p className="text-xs font-semibold uppercase tracking-wider text-indigo-200">
                Live account
              </p>
              <h1 className="mt-1 text-2xl font-bold sm:text-3xl">{user?.name || "Your profile"}</h1>
              <p className="mt-1 flex items-center justify-center gap-2 text-sm text-indigo-100 sm:justify-start">
                <FaEnvelope className="shrink-0 opacity-80" />
                {user?.email}
              </p>
              <p className="mt-2 text-xs text-indigo-200">
                Member since {formatDate(user?.createdAt)}
              </p>
            </div>
            {!editing && (
              <button
                type="button"
                onClick={() => setEditing(true)}
                className="inline-flex shrink-0 items-center gap-2 rounded-xl bg-white px-4 py-2.5 text-sm font-semibold text-indigo-700 shadow-md transition hover:bg-indigo-50 hover:shadow-lg"
              >
                <FaEdit />
                Edit profile
              </button>
            )}
          </div>
        </section>

        <div className="mt-6 rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex flex-col items-center gap-4 sm:flex-row sm:items-start">
            <div className="relative">
              <UserAvatar user={displayUser} size="md" />
              {editing && (
                <>
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="absolute bottom-0 right-0 flex h-8 w-8 items-center justify-center rounded-full bg-indigo-600 text-white shadow-lg transition hover:bg-indigo-700"
                    aria-label="Change photo"
                  >
                    <FaCamera size={14} />
                  </button>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/jpeg,image/png,image/gif,image/webp"
                    className="hidden"
                    onChange={handleAvatarPick}
                  />
                </>
              )}
            </div>
            <div className="text-center sm:text-left">
              <p className="text-lg font-semibold text-slate-900">
                {editing ? form.name || "Your name" : user?.name}
              </p>
              <p className="text-sm text-slate-500">KaamDone member</p>
              {editing && form.avatar && (
                <div className="mt-2 flex flex-wrap justify-center gap-2 sm:justify-start">
                  <button
                    type="button"
                    onClick={() => setAvatarCropSrc(form.avatar)}
                    className="text-xs font-medium text-indigo-600 hover:text-indigo-800"
                  >
                    Crop again
                  </button>
                  <button
                    type="button"
                    onClick={removeAvatar}
                    className="inline-flex items-center gap-1 text-xs font-medium text-red-600 hover:text-red-700"
                  >
                    <FaTimes />
                    Remove photo
                  </button>
                </div>
              )}
            </div>
          </div>

          {editing ? (
            <form onSubmit={handleSubmit} className="mt-6 space-y-4">
              <label className={labelClassName}>
                Name
                <input
                  name="name"
                  type="text"
                  required
                  value={form.name}
                  onChange={handleChange}
                  className={inputClassName}
                />
                {fieldErrors.name && (
                  <p className="mt-1 text-sm text-red-600">{fieldErrors.name}</p>
                )}
              </label>
              <label className={labelClassName}>
                Email
                <input
                  name="email"
                  type="email"
                  required
                  value={form.email}
                  onChange={handleChange}
                  className={inputClassName}
                />
                {fieldErrors.email && (
                  <p className="mt-1 text-sm text-red-600">{fieldErrors.email}</p>
                )}
              </label>
              <hr className="border-slate-200" />
              <p className="text-sm text-slate-500">
                Leave blank to keep your current password.
              </p>
              <label className={labelClassName}>
                Current password
                <PasswordInput
                  name="currentPassword"
                  autoComplete="current-password"
                  value={form.currentPassword}
                  onChange={handleChange}
                />
                {fieldErrors.currentPassword && (
                  <p className="mt-1 text-sm text-red-600">{fieldErrors.currentPassword}</p>
                )}
              </label>
              <label className={labelClassName}>
                New password
                <PasswordInput
                  name="newPassword"
                  autoComplete="new-password"
                  minLength={6}
                  value={form.newPassword}
                  onChange={handleChange}
                />
                {fieldErrors.newPassword && (
                  <p className="mt-1 text-sm text-red-600">{fieldErrors.newPassword}</p>
                )}
              </label>
              <div className="flex flex-wrap gap-3 pt-2">
                <button
                  type="submit"
                  disabled={submitting}
                  className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-50"
                >
                  {submitting ? "Saving..." : "Save changes"}
                </button>
                <button
                  type="button"
                  onClick={cancelEdit}
                  disabled={submitting}
                  className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
                >
                  Cancel
                </button>
              </div>
            </form>
          ) : (
            <dl className="mt-6 space-y-4">
              <div className="flex items-start gap-3">
                <FaUser className="mt-0.5 text-slate-400" />
                <div>
                  <dt className="text-xs font-medium uppercase tracking-wide text-slate-500">Name</dt>
                  <dd className="text-slate-800">{user?.name}</dd>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <FaEnvelope className="mt-0.5 text-slate-400" />
                <div>
                  <dt className="text-xs font-medium uppercase tracking-wide text-slate-500">Email</dt>
                  <dd className="text-slate-800">{user?.email}</dd>
                </div>
              </div>
              <div>
                <dt className="text-xs font-medium uppercase tracking-wide text-slate-500">
                  Member since
                </dt>
                <dd className="mt-1 text-slate-800">{formatDate(user?.createdAt)}</dd>
              </div>
            </dl>
          )}

          {!editing && (
            <p className="mt-6 rounded-lg bg-slate-50 px-3 py-2 text-xs text-slate-600">
              Account ID: <span className="font-mono text-slate-800">{user?._id}</span>
            </p>
          )}
        </div>

        <div className="mt-6 flex justify-end">
          <button
            type="button"
            onClick={handleLogout}
            disabled={loggingOut || !isAuthenticated}
            className="group inline-flex items-center justify-center gap-2 rounded-xl border border-red-200 bg-white px-5 py-2.5 text-sm font-semibold text-red-700 shadow-sm transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <FaSignOutAlt className="transition group-hover:scale-110" />
            {loggingOut ? "Logging out..." : "Log out"}
          </button>
        </div>
      </main>
      {avatarCropSrc && (
        <AvatarCropModal
          imageSrc={avatarCropSrc}
          onCancel={() => setAvatarCropSrc(null)}
          onApply={applyCroppedAvatar}
        />
      )}
    </div>
  );
}
