import { useState } from "react";
import { Link, useNavigate, Navigate } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth.js";
import { PrimaryButton } from "../../components/ui.jsx";

export default function AdminLogin() {
  const { login, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  // If already logged in, redirect to admin dashboard
  if (isAuthenticated) {
    return <Navigate to="/admin" replace />;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setErrorMessage("");

    if (!email.trim() || !password) {
      setErrorMessage("Please enter both email address and password.");
      return;
    }

    setLoading(true);

    try {
      const result = await login(email, password);
      if (result.success) {
        navigate("/admin");
      } else {
        setErrorMessage(
          result.message || "Invalid credentials. Please verify your email and password."
        );
      }
    } catch {
      setErrorMessage("Unable to sign in. Please check your network connection.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-sand-400/20 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <Link to="/" className="inline-block">
          <span className="font-display text-2xl tracking-wide text-forest-900 block">
            Aravalli Aadivasi Mahila Grih Udyog FPC
          </span>
          <span className="text-xs uppercase tracking-widest text-gold-600 font-semibold mt-1 inline-block">
            Administration Portal
          </span>
        </Link>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md px-4 sm:px-0">
        <div className="border border-sand-400/60 bg-cream-50 p-8 shadow-sm">
          <h2 className="font-display text-xl text-forest-900 mb-2">
            Administrator Sign In
          </h2>
          <p className="text-xs text-charcoal-700/80 mb-6">
            Enter your authorized administrative credentials to manage products.
          </p>

          {errorMessage && (
            <div className="mb-6 border-l-4 border-red-600 bg-red-50 p-4 text-xs text-red-800">
              {errorMessage}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label
                htmlFor="email"
                className="block text-xs font-semibold uppercase tracking-wider text-charcoal-800"
              >
                Email Address
              </label>
              <input
                id="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                disabled={loading}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@aravallifpc.org"
                className="mt-1.5 w-full border border-sand-400 bg-white px-3.5 py-2.5 text-sm text-charcoal-900 placeholder:text-charcoal-500/50 focus:border-forest-700 focus:outline-none"
              />
            </div>

            <div>
              <label
                htmlFor="password"
                className="block text-xs font-semibold uppercase tracking-wider text-charcoal-800"
              >
                Password
              </label>
              <input
                id="password"
                type="password"
                autoComplete="current-password"
                required
                value={password}
                disabled={loading}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                className="mt-1.5 w-full border border-sand-400 bg-white px-3.5 py-2.5 text-sm text-charcoal-900 placeholder:text-charcoal-500/50 focus:border-forest-700 focus:outline-none"
              />
            </div>

            <PrimaryButton
              type="submit"
              disabled={loading}
              className="w-full justify-center bg-forest-900 text-cream-50 hover:bg-forest-800 py-3"
            >
              {loading ? "Signing in…" : "Sign In to Admin Portal"}
            </PrimaryButton>
          </form>

          <div className="mt-6 border-t border-sand-400/40 pt-4 text-center">
            <Link
              to="/"
              className="text-xs text-forest-800 hover:text-forest-950 underline underline-offset-4"
            >
              ← Back to public website
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
