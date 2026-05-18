import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import PasswordInput from "../components/PasswordInput";
import { getFieldErrors } from "../api";
import { inputClassName } from "../styles/formStyles";
import { getApiErrorMessage } from "../api";
import { useAuth } from "../context/AuthContext";

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [fieldErrors, setFieldErrors] = useState({});

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setFieldErrors({});
    try {
      await login(email, password);
      toast.success("Welcome back!");
      navigate("/dashboard", { replace: true });
    } catch (error) {
      setFieldErrors(getFieldErrors(error));
      toast.error(getApiErrorMessage(error));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4 dark:bg-slate-900">
      <div className="w-full max-w-md rounded-xl border border-slate-200 bg-white p-8 shadow-sm dark:border-slate-700 dark:bg-slate-800">
        <Link to="/" className="text-sm font-medium text-indigo-600 hover:text-indigo-700 dark:text-indigo-400">
          ← Back to home
        </Link>
        <h1 className="mt-4 text-2xl font-bold text-slate-800 dark:text-white">Login</h1>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Sign in to manage your tasks</p>
        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
            Email
            <input
              type="email"
              required
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={inputClassName}
            />
            {fieldErrors.email && <p className="mt-1 text-sm text-red-600">{fieldErrors.email}</p>}
          </label>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
            <span className="flex items-center justify-between">
              <span>Password</span>
              <Link
                to="/forgot-password"
                className="text-xs font-medium text-indigo-600 hover:text-indigo-700 dark:text-indigo-400"
              >
                Forgot password?
              </Link>
            </span>
            <PasswordInput
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete="current-password"
            />
            {fieldErrors.password && (
              <p className="mt-1 text-sm text-red-600">{fieldErrors.password}</p>
            )}
          </label>
          <button
            type="submit"
            disabled={submitting}
            className="w-full rounded-lg bg-indigo-600 py-2.5 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-50"
          >
            {submitting ? "Signing in..." : "Login"}
          </button>
        </form>
        <p className="mt-6 text-center text-sm text-slate-600 dark:text-slate-400">
          No account?{" "}
          <Link to="/register" className="font-medium text-indigo-600 hover:text-indigo-700 dark:text-indigo-400">
            Register
          </Link>
        </p>
      </div>
    </div>
  );
}
