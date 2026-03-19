import { useState, useRef, useEffect, useMemo } from "react";
import { Bell, LogOut, User } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { clearAuthSession, getAuthSession } from "../../utils/storage";
import "../../styles/global.css";

function getInitials(fullName = "") {
  return fullName
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() || "")
    .join("") || "U";
}

function AppHeader({ header }) {
  const navigate = useNavigate();
  const dropRef = useRef(null);
  const [open, setOpen] = useState(false);
  const [storedUser, setStoredUser] = useState(() => getAuthSession()?.user || null);

  useEffect(() => {
    function syncUser() {
      setStoredUser(getAuthSession()?.user || null);
    }

    window.addEventListener("storage", syncUser);
    window.addEventListener("focus", syncUser);

    return () => {
      window.removeEventListener("storage", syncUser);
      window.removeEventListener("focus", syncUser);
    };
  }, []);

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

  function handleSignOut() {
    setOpen(false);
    clearAuthSession();
    navigate("/", { replace: true });
  }

  function handleOpenProfile() {
    setOpen(false);
    navigate("/app/profile");
  }

  if (!header) return null;

  const fullName =
    header.fullName ||
    header.userName ||
    storedUser?.fullName ||
    "User";

  const userInitials =
    header.userInitials ||
    getInitials(fullName);

  return (
    <header className="pd-app-header">
      <div className="pd-app-header-inner">
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
            <h1 style={{ color: "#295A8E" }}>{header.appName}</h1>
            <p>{header.appSubtitle}</p>
          </div>
        </div>

        <div className="pd-header-actions">
          <button
            className="pd-header-icon-btn"
            type="button"
            aria-label="Notifications"
          >
            <Bell size={18} strokeWidth={2} />
          </button>

          <div className="pd-profile-wrap" ref={dropRef}>
            <button
              type="button"
              className="pd-user-badge"
              onClick={() => setOpen((p) => !p)}
              aria-haspopup="true"
              aria-expanded={open}
              aria-label="Profile menu"
            >
              {userInitials}
            </button>

            {open && (
              <div className="pd-profile-dropdown" role="menu">
                <div className="pd-profile-welcome">
                  <div className="pd-profile-avatar">{userInitials}</div>
                  <div className="pd-profile-info">
                    <p className="pd-profile-greeting">Welcome back</p>
                    <p className="pd-profile-name">{fullName}</p>
                  </div>
                </div>

                <div className="pd-profile-divider" />

                <button
                  type="button"
                  className="pd-profile-menu-item"
                  role="menuitem"
                  onClick={handleOpenProfile}
                >
                  <User size={15} strokeWidth={2} />
                  My Profile
                </button>

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