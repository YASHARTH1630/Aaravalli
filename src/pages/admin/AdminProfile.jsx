import { useState } from "react";
import { useAuth } from "../../hooks/useAuth.js";
import authService from "../../services/authService.js";
import { PrimaryButton } from "../../components/ui.jsx";

export default function AdminProfile() {
  const { user } = useAuth();

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [submitting, setSubmitting] = useState(false);
  const [feedback, setFeedback] = useState({ type: "", message: "" });

  async function handleSubmit(e) {
    e.preventDefault();
    setFeedback({ type: "", message: "" });

    // Validation
    if (!currentPassword) {
      setFeedback({ type: "error", message: "Please enter your current password." });
      return;
    }

    if (!newPassword) {
      setFeedback({ type: "error", message: "Please enter a new password." });
      return;
    }

    if (newPassword.length < 6) {
      setFeedback({
        type: "error",
        message: "New password must be at least 6 characters long.",
      });
      return;
    }

    if (newPassword !== confirmPassword) {
      setFeedback({
        type: "error",
        message: "New password and confirmation do not match.",
      });
      return;
    }

    if (currentPassword === newPassword) {
      setFeedback({
        type: "error",
        message: "New password must be different from your current password.",
      });
      return;
    }

    setSubmitting(true);

    const result = await authService.changePassword(currentPassword, newPassword);

    if (result.success) {
      setFeedback({
        type: "success",
        message: "Your password has been updated successfully.",
      });
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } else {
      setFeedback({
        type: "error",
        message: result.message || "Failed to update password. Please verify your current password.",
      });
    }

    setSubmitting(false);
  }

  return (
    <div className="max-w-3xl space-y-8">
      {/* Page Header */}
      <div className="border-b border-sand-400/50 pb-6">
        <h1 className="font-display text-2xl md:text-3xl text-forest-900">
          Admin Account & Profile
        </h1>
        <p className="mt-1 text-sm text-charcoal-700">
          Manage your administrator account credentials and view your session details.
        </p>
      </div>

      {/* Feedback Banner */}
      {feedback.message && (
        <div
          className={`border px-4 py-3 text-sm flex justify-between items-center ${
            feedback.type === "success"
              ? "border-emerald-600 bg-emerald-50 text-emerald-950"
              : "border-red-600 bg-red-50 text-red-950"
          }`}
        >
          <span>{feedback.message}</span>
          <button
            type="button"
            onClick={() => setFeedback({ type: "", message: "" })}
            className="font-bold ml-4 hover:opacity-75"
          >
            ×
          </button>
        </div>
      )}

      {/* Section 1: Account Information */}
      <div className="border border-sand-400/60 bg-cream-50 p-6 shadow-sm">
        <h2 className="font-display text-lg text-forest-900 border-b border-sand-400/40 pb-3 mb-4">
          Account Information
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
          <div>
            <span className="text-xs font-semibold uppercase tracking-wider text-charcoal-500 block">
              Administrator Name
            </span>
            <span className="mt-1 font-medium text-forest-900 block">
              {user?.name || "Aravalli Administrator"}
            </span>
          </div>

          <div>
            <span className="text-xs font-semibold uppercase tracking-wider text-charcoal-500 block">
              Email Address
            </span>
            <span className="mt-1 font-medium text-forest-900 block">
              {user?.email || "admin@aravallifpc.org"}
            </span>
          </div>

          <div>
            <span className="text-xs font-semibold uppercase tracking-wider text-charcoal-500 block">
              Role
            </span>
            <span className="mt-1 inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold uppercase bg-gold-100 text-gold-900 border border-gold-300">
              {user?.role || "Admin"}
            </span>
          </div>
        </div>
      </div>

      {/* Section 2: Change Password Form */}
      <div className="border border-sand-400/60 bg-cream-50 p-6 shadow-sm">
        <div className="border-b border-sand-400/40 pb-3 mb-4">
          <h2 className="font-display text-lg text-forest-900">Change Password</h2>
          <p className="mt-0.5 text-xs text-charcoal-600">
            Choose a secure password of at least 6 characters to protect access to the FPC portal.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 max-w-md">
          <div>
            <label
              htmlFor="currentPassword"
              className="block text-xs font-semibold uppercase tracking-wider text-charcoal-700"
            >
              Current Password <span className="text-gold-600">*</span>
            </label>
            <input
              id="currentPassword"
              type="password"
              autoComplete="current-password"
              value={currentPassword}
              disabled={submitting}
              onChange={(e) => setCurrentPassword(e.target.value)}
              placeholder="••••••••"
              className="mt-1.5 w-full border border-sand-400 bg-white px-3.5 py-2 text-sm text-charcoal-900 focus:border-forest-700 focus:outline-none"
            />
          </div>

          <div>
            <label
              htmlFor="newPassword"
              className="block text-xs font-semibold uppercase tracking-wider text-charcoal-700"
            >
              New Password <span className="text-gold-600">*</span>
            </label>
            <input
              id="newPassword"
              type="password"
              autoComplete="new-password"
              value={newPassword}
              disabled={submitting}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="At least 6 characters"
              className="mt-1.5 w-full border border-sand-400 bg-white px-3.5 py-2 text-sm text-charcoal-900 focus:border-forest-700 focus:outline-none"
            />
          </div>

          <div>
            <label
              htmlFor="confirmPassword"
              className="block text-xs font-semibold uppercase tracking-wider text-charcoal-700"
            >
              Confirm New Password <span className="text-gold-600">*</span>
            </label>
            <input
              id="confirmPassword"
              type="password"
              autoComplete="new-password"
              value={confirmPassword}
              disabled={submitting}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Re-type new password"
              className="mt-1.5 w-full border border-sand-400 bg-white px-3.5 py-2 text-sm text-charcoal-900 focus:border-forest-700 focus:outline-none"
            />
          </div>

          <div className="pt-2">
            <PrimaryButton type="submit" disabled={submitting} className="text-xs">
              {submitting ? "Updating Password…" : "Update Password"}
            </PrimaryButton>
          </div>
        </form>
      </div>
    </div>
  );
}
