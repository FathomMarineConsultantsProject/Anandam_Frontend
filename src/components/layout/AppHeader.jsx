import { Bell } from 'lucide-react';

function AppHeader({ header }) {
  if (!header) return null;

  return (
    <header className="app-header">
      <div className="brand-wrap">
        <div className="brand-logo">
          <div className="brand-logo-outer"></div>
          <div className="brand-logo-inner"></div>
          <div className="brand-logo-person">
            <div className="brand-logo-head"></div>
            <div className="brand-logo-body"></div>
            <div className="brand-logo-arm brand-logo-arm-left"></div>
            <div className="brand-logo-arm brand-logo-arm-right"></div>
            <div className="brand-logo-base"></div>
          </div>
          <div className="brand-logo-dot"></div>
        </div>

        <div className="brand-text">
          <h1>{header.appName}</h1>
          <p>{header.appSubtitle}</p>
        </div>
      </div>

      <div className="header-right">
        <button className="icon-button" type="button" aria-label="Notifications">
          <Bell size={18} strokeWidth={2} />
        </button>

        <div className="profile-badge">{header.userInitials}</div>
      </div>
    </header>
  );
}

export default AppHeader;