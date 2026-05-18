import { useState } from "react";
import { Link, useNavigate, useParams, useSearchParams } from "react-router-dom";
import { toast } from "react-toastify";
import PasswordInput from "../components/PasswordInput";
import { getApiErrorMessage, getFieldErrors } from "../api";
import { labelClassName } from "../styles/formStyles";
import * as authService from "../services/authService";

function normalizeToken(raw) {
  if (!raw) return "";
  let value = String(raw).trim();

  const pathMatch = value.match(/\/reset-password\/([a-f0-9]{64})/i);
  if (pathMatch) return pathMatch[1].toLowerCase();

  const queryMatch = value.match(/[?&]token=([a-f0-9]{64})/i);
  if (queryMatch) return queryMatch[1].toLowerCase();

  try {
    const decoded = decodeURIComponent(value);
    if (decoded !== value) return normalizeToken(decoded);
  } catch {
    // ignore
  }

  if (/^[a-f0-9]{64}$/i.test(value)) return value.toLowerCase();
  return value;
}

function readTokenFromUrl(params, searchParams) {
  if (params.token?.trim()) return normalizeToken(params.token);

  const fromQuery = searchParams.get("token");
  if (fromQuery?.trim()) return normalizeToken(fromQuery);

  return "";
}

export default function ResetPassword() {
  const { token: routeToken } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = readTokenFromUrl({ token: routeToken }, searchParams);
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [fieldErrors, setFieldErrors] = useState({});

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (password !== confirm) {
      toast.error("Passwords do not match");
      return;
    }
    if (!token || !/^[a-f0-9]{64}$/i.test(token)) {
      toast.error("Invalid reset link — request a new one from Forgot password");
      return;
    }
    setSubmitting(true);
    setFieldErrors({});
    try {
      await authService.resetPassword(token, password);
      toast.success("Password updated! Please login.");
      navigate("/login", { replace: true });
    } catch (error) {
      setFieldErrors(getFieldErrors(error));
      toast.error(getApiErrorMessage(error));
    } finally {
      setSubmitting(false);
    }
  };

  if (!token || !/^[a-f0-9]{64}$/i.test(token)) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4">
        <div className="w-full max-w-md rounded-xl border border-slate-200 bg-white p-8 text-center shadow-sm">
          <p className="text-slate-700">Invalid or missing reset link.</p>
          <p className="mt-2 text-sm text-slate-500">
            Request a new link from Forgot password. On this PC, use the blue box link on that page
            if email does not work.
          </p>
          <Link
            to="/forgot-password"
            className="mt-4 inline-block text-sm font-medium text-indigo-600 hover:text-indigo-700"
          >
            Request a new link
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4">
      <div className="w-full max-w-md rounded-xl border border-slate-200 bg-white p-8 shadow-sm">
        <Link to="/login" className="text-sm font-medium text-indigo-600 hover:text-indigo-700">
          ← Back to login
        </Link>
        <h1 className="mt-4 text-2xl font-bold text-slate-800">Reset password</h1>
        <p className="mt-1 text-sm text-slate-500">Choose a new password (min 6 characters).</p>
        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <label className={labelClassName}>
            New password
            <PasswordInput
              name="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
              autoComplete="new-password"
            />
            {fieldErrors.password && (
              <p className="mt-1 text-sm text-red-600">{fieldErrors.password}</p>
            )}
          </label>
          <label className={labelClassName}>
            Confirm password
            <PasswordInput
              name="confirm"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              required
              minLength={6}
              autoComplete="new-password"
            />
          </label>
          <button
            type="submit"
            disabled={submitting}
            className="w-full rounded-lg bg-indigo-600 py-2.5 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-50"
          >
            {submitting ? "Updating..." : "Update password"}
          </button>
        </form>
      </div>
    </div>
  );
}
