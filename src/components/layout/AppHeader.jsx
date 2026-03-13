import { Bell } from "lucide-react";
import "../../styles/global.css";

function AppHeader({ header }) {
  if (!header) return null;

  return (
    <header className="pd-app-header">
      <div className="pd-app-header-inner">
        <div className="pd-brand">
          <div className="pd-brand-logo">
            <div className="pd-brand-logo-outer" />
            <div className="pd-brand-logo-inner" />
            <div className="pd-brand-logo-person">
              <div className="pd-brand-logo-person">
                <div className="pd-brand-logo-head" />
                <div className="pd-brand-logo-body">
                  <div className="pd-brand-logo-arm pd-brand-logo-arm-left" />
                  <div className="pd-brand-logo-arm pd-brand-logo-arm-right" />
                </div>
                <div className="pd-brand-logo-base" />
              </div>
            </div>
            <div className="pd-brand-logo-dot" />
          </div>

          <div className="pd-brand-text">
            <h1>{header.appName}</h1>
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

          <div className="pd-user-badge">{header.userInitials}</div>
        </div>
      </div>
    </header>
  );
}

export default AppHeader;