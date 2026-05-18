import { useState } from "react";
import { Link } from "react-router-dom";
import { FaCopy, FaEnvelopeOpenText, FaExternalLinkAlt } from "react-icons/fa";
import { toast } from "react-toastify";
import { getApiErrorMessage, getFieldErrors } from "../api";
import { inputClassName } from "../styles/formStyles";
import * as authService from "../services/authService";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [fieldErrors, setFieldErrors] = useState({});
  const [emailSent, setEmailSent] = useState(false);
  const [resetLink, setResetLink] = useState("");
  const [emailSentOk, setEmailSentOk] = useState(true);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setFieldErrors({});
    setEmailSent(false);
    setResetLink("");
    setEmailSentOk(true);
    try {
      const result = await authService.forgotPassword(email);
      setEmailSent(true);
      setEmailSentOk(result.emailSent);
      if (result.resetLink) setResetLink(result.resetLink);
      toast.success(result.message || "Check your email for the reset link.");
    } catch (error) {
      setFieldErrors(getFieldErrors(error));
      toast.error(getApiErrorMessage(error));
    } finally {
      setSubmitting(false);
    }
  };

  const copyLink = async () => {
    if (!resetLink) return;
    try {
      await navigator.clipboard.writeText(resetLink);
      toast.success("Link copied!");
    } catch {
      toast.error("Could not copy — select the link and copy manually.");
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4">
      <div className="w-full max-w-md rounded-xl border border-slate-200 bg-white p-8 shadow-sm">
        <Link to="/login" className="text-sm font-medium text-indigo-600 hover:text-indigo-700">
          ← Back to login
        </Link>
        <h1 className="mt-4 text-2xl font-bold text-slate-800">Forgot password</h1>
        <p className="mt-1 text-sm text-slate-500">
          Enter your registered email. We will send you a link to set a new password.
        </p>

        {emailSent ? (
          <div className="mt-6 space-y-4">
            <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-5 text-center">
              <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-emerald-100 text-xl text-emerald-600">
                <FaEnvelopeOpenText />
              </span>
              <p className="mt-3 font-medium text-emerald-900">Check your email</p>
              <p className="mt-2 text-sm text-emerald-800">
                If <strong>{email}</strong> is registered, we sent a reset link. It expires in 1 hour.
              </p>
              <p className="mt-2 text-xs text-emerald-700">
                {emailSentOk
                  ? "Also check spam. Gmail often hides localhost links — use the link below if needed."
                  : "Email failed — use the reset link in the blue box below (same PC, Chrome)."}
              </p>
            </div>

            {resetLink && (
              <div className="rounded-lg border border-indigo-200 bg-indigo-50 p-4">
                <p className="text-sm font-medium text-indigo-900">Reset link (use on this PC)</p>
                <p className="mt-1 text-xs text-indigo-700">
                  If the email has no button, copy this link or open it directly:
                </p>
                <p className="mt-2 break-all rounded bg-white px-2 py-2 font-mono text-xs text-slate-800">
                  {resetLink}
                </p>
                <div className="mt-3 flex flex-wrap gap-2">
                  <a
                    href={resetLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-3 py-2 text-sm font-medium text-white hover:bg-indigo-700"
                  >
                    <FaExternalLinkAlt />
                    Open reset page
                  </a>
                  <button
                    type="button"
                    onClick={copyLink}
                    className="inline-flex items-center gap-2 rounded-lg border border-indigo-300 bg-white px-3 py-2 text-sm font-medium text-indigo-700 hover:bg-indigo-100"
                  >
                    <FaCopy />
                    Copy link
                  </button>
                </div>
              </div>
            )}

            <Link
              to="/login"
              className="block text-center text-sm font-medium text-indigo-600 hover:text-indigo-700"
            >
              Back to login
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            <label className="block text-sm font-medium text-slate-700">
              Email
              <input
                type="email"
                required
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={inputClassName}
                placeholder="you@example.com"
              />
              {fieldErrors.email && <p className="mt-1 text-sm text-red-600">{fieldErrors.email}</p>}
            </label>
            <button
              type="submit"
              disabled={submitting}
              className="w-full rounded-lg bg-indigo-600 py-2.5 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-50"
            >
              {submitting ? "Sending email..." : "Send reset link to email"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
