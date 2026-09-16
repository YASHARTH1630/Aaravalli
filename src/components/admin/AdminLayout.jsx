import { useState, useEffect } from "react";
import { Link, NavLink, Outlet, useNavigate } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth.js";
import api from "../../services/api.js";

export default function AdminLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [dbOffline, setDbOffline] = useState(false);

  useEffect(() => {
    async function checkDb() {
      const health = await api.checkHealth();
      if (health?.database === "disconnected" || health?.status === "offline") {
        setDbOffline(true);
      } else {
        setDbOffline(false);
      }
    }
    checkDb();
  }, []);

  function handleLogout() {
    logout();
    navigate("/admin/login");
  }

  const navLinkClass = ({ isActive }) =>
    `px-3 py-2 text-sm font-medium transition-colors ${
      isActive
        ? "border-b-2 border-gold-500 text-cream-50 font-semibold"
        : "text-cream-100/70 hover:text-cream-50"
    }`;

  return (
    <div className="min-h-screen bg-sand-400/20 text-charcoal-900 flex flex-col">
      {/* Admin Top Navigation */}
      <header className="border-b border-sand-400/50 bg-forest-900 text-cream-50 sticky top-0 z-30">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            {/* Left Brand Identity */}
            <div className="flex items-center gap-6">
              <Link to="/admin" className="flex items-center gap-2">
                <span className="font-display text-lg tracking-wide text-cream-50">
                  Aravalli FPC
                </span>
                <span className="rounded bg-forest-800 px-2 py-0.5 text-xs font-semibold uppercase tracking-wider text-gold-500 border border-gold-500/30">
                  Admin
                </span>
              </Link>

              {/* Navigation Links */}
              <nav className="hidden md:flex items-center space-x-2">
                <NavLink to="/admin" end className={navLinkClass}>
                  Dashboard
                </NavLink>
                <NavLink to="/admin/products" className={navLinkClass}>
                  Products
                </NavLink>
                <NavLink to="/admin/enquiries" className={navLinkClass}>
                  Enquiries
                </NavLink>
                <NavLink to="/admin/profile" className={navLinkClass}>
                  Profile
                </NavLink>
              </nav>
            </div>

            {/* Right User & Utility Actions */}
            <div className="flex items-center gap-4">
              <Link
                to="/"
                target="_blank"
                rel="noreferrer"
                className="hidden sm:inline-flex text-xs font-medium text-cream-100/70 hover:text-cream-50 underline underline-offset-4"
              >
                View Public Website ↗
              </Link>

              <div className="h-4 w-px bg-cream-100/20 hidden sm:block"></div>

              <div className="flex items-center gap-3">
                <Link to="/admin/profile" className="text-right hidden sm:block group">
                  <p className="text-xs font-medium text-cream-50 leading-none group-hover:underline">
                    {user?.name || "Administrator"}
                  </p>
                  <p className="text-[10px] text-cream-100/60 uppercase mt-0.5">
                    {user?.role || "Admin"}
                  </p>
                </Link>

                <button
                  onClick={handleLogout}
                  className="rounded border border-cream-100/30 px-3 py-1.5 text-xs font-medium text-cream-50 hover:bg-cream-50 hover:text-forest-900 transition-colors"
                >
                  Logout
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Mobile Navigation bar */}
        <div className="flex md:hidden border-t border-forest-800 px-4 py-2 space-x-3 bg-forest-950 overflow-x-auto">
          <NavLink to="/admin" end className={navLinkClass}>
            Dashboard
          </NavLink>
          <NavLink to="/admin/products" className={navLinkClass}>
            Products
          </NavLink>
          <NavLink to="/admin/enquiries" className={navLinkClass}>
            Enquiries
          </NavLink>
          <NavLink to="/admin/profile" className={navLinkClass}>
            Profile
          </NavLink>
        </div>
      </header>

      {/* Database Offline Notice Banner */}
      {dbOffline && (
        <div className="bg-amber-100 border-b border-amber-300 px-4 py-3 text-amber-950 text-sm">
          <div className="mx-auto max-w-7xl flex items-center gap-2">
            <span className="font-bold text-amber-700">⚠️ Database Notice:</span>
            <span>
              Product management is temporarily unavailable because the database connection is not available.
            </span>
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <main className="flex-1 py-8 px-4 sm:px-6 lg:px-8 max-w-7xl w-full mx-auto">
        <Outlet context={{ dbOffline }} />
      </main>

      {/* Admin Footer */}
      <footer className="border-t border-sand-400/40 bg-cream-100/60 py-4 px-4 text-center text-xs text-charcoal-700">
        Aravalli Aadivasi Mahila Grih Udyog FPC — Administration Portal
      </footer>
    </div>
  );
}
