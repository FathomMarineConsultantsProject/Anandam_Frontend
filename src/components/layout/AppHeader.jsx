// src/components/layout/AppHeader.jsx
import { useState, useRef, useEffect } from "react";
import { Bell, LogOut } from "lucide-react";
import { useNavigate } from "react-router-dom";
import "../../styles/global.css";

function AppHeader({ header }) {
  const navigate   = useNavigate();
  const dropRef    = useRef(null);
  const [open, setOpen] = useState(false);

  // ── Close on outside click ──────────────────────────────────────────────
  useEffect(() => {
    if (!open) return;
    function onOutside(e) {
      if (dropRef.current && !dropRef.current.contains(e.target)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", onOutside);
    return () => document.removeEventListener("mousedown", onOutside);
  }, [open]);

  // ── Sign out ────────────────────────────────────────────────────────────
  function handleSignOut() {
    setOpen(false);
    localStorage.removeItem("token");
    localStorage.removeItem("moodGateCompleted");
    sessionStorage.clear();
    navigate("/");
  }

  if (!header) return null;

  const fullName = header.userName || header.userInitials || "User";

  return (
    <header className="pd-app-header">
      <div className="pd-app-header-inner">

        {/* ── Brand / Logo ── */}
        <div className="pd-brand">
          <div className="pd-brand-logo">
            <div className="pd-brand-logo-outer" />
            <div className="pd-brand-logo-inner" />
            <div className="pd-brand-logo-person">
              <div className="pd-brand-logo-head" />
              <div className="pd-brand-logo-body">
                <div className="pd-brand-logo-arm pd-brand-logo-arm-left" />
                <div className="pd-brand-logo-arm pd-brand-logo-arm-right" />
              </div>
              <div className="pd-brand-logo-base" />
            </div>
            <div className="pd-brand-logo-dot" />
          </div>
          <div className="pd-brand-text">
            <h1>{header.appName}</h1>
            <p>{header.appSubtitle}</p>
          </div>
        </div>

        {/* ── Right actions ── */}
        <div className="pd-header-actions">

          <button className="pd-header-icon-btn" type="button" aria-label="Notifications">
            <Bell size={18} strokeWidth={2} />
          </button>

          {/* Profile badge + dropdown */}
          <div className="pd-profile-wrap" ref={dropRef}>
            <button
              type="button"
              className="pd-user-badge"
              onClick={() => setOpen((p) => !p)}
              aria-haspopup="true"
              aria-expanded={open}
              aria-label="Profile menu"
            >
              {header.userInitials}
            </button>

            {open && (
              <div className="pd-profile-dropdown" role="menu">
                <div className="pd-profile-welcome">
                  <div className="pd-profile-avatar">{header.userInitials}</div>
                  <div className="pd-profile-info">
                    <p className="pd-profile-greeting">Welcome back</p>
                    <p className="pd-profile-name">{fullName}</p>
                  </div>
                </div>
                <div className="pd-profile-divider" />
                <button
                  type="button"
                  className="pd-profile-menu-item signout"
                  role="menuitem"
                  onClick={handleSignOut}
                >
                  <LogOut size={15} strokeWidth={2} />
                  Sign out
                </button>
              </div>
            )}
          </div>

        </div>
      </div>
    </header>
  );
}

export default AppHeader;