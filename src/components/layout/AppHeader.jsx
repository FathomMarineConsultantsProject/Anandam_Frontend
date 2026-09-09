import { useEffect, useRef, useState } from "react";
import { Bell, LogOut, User } from "lucide-react";
import { useNavigate } from "react-router-dom";

import {
  clearAuthSession,
  getStoredUser,
  saveAuthSession,
} from "../../utils/storage";

import { apiRequest } from "../../api/client";

import anandamLogo from "../../assets/anandum logo.png";

function getInitials(fullName = "") {
  const initials = fullName
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part.charAt(0).toUpperCase())
    .join("");

  return initials || "U";
}

function getUserFullName(user) {
  return (
    user?.fullName ||
    user?.full_name ||
    user?.name ||
    [user?.firstName, user?.lastName].filter(Boolean).join(" ") ||
    [user?.first_name, user?.last_name].filter(Boolean).join(" ") ||
    "User"
  );
}

function getUserEmail(user) {
  return user?.email || "";
}

function getUserAvatar(user) {
  return (
    user?.profileImage ||
    user?.profile_image ||
    user?.avatar ||
    user?.avatarUrl ||
    user?.avatar_url ||
    null
  );
}

function AppHeader() {
  const navigate = useNavigate();
  const dropdownRef = useRef(null);

  const [profileOpen, setProfileOpen] = useState(false);
  const [liveUser, setLiveUser] = useState(() => getStoredUser());

  /*
    Keep the header profile synced with the backend.

    If GET /api/profile succeeds we refresh the user data.
    If it fails, localStorage data remains as fallback.
  */
  useEffect(() => {
    let cancelled = false;

    async function loadProfile() {
      try {
        const profile = await apiRequest("/profile", {
          method: "GET",
        });

        if (!cancelled && profile) {
          setLiveUser(profile);

          try {
            saveAuthSession({
              user: profile,
            });
          } catch {
            // Do not break the header if storage update fails.
          }
        }
      } catch {
        // Existing local user is kept as fallback.
      }
    }

    loadProfile();

    return () => {
      cancelled = true;
    };
  }, []);

  /*
    Keep header updated if another page modifies localStorage,
    for example after editing profile information.
  */
  useEffect(() => {
    function syncUser() {
      setLiveUser(getStoredUser());
    }

    window.addEventListener("storage", syncUser);
    window.addEventListener("focus", syncUser);

    return () => {
      window.removeEventListener("storage", syncUser);
      window.removeEventListener("focus", syncUser);
    };
  }, []);

  /*
    Close profile dropdown when clicking anywhere outside it.
  */
  useEffect(() => {
    if (!profileOpen) return undefined;

    function handleOutsideClick(event) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target)
      ) {
        setProfileOpen(false);
      }
    }

    function handleEscape(event) {
      if (event.key === "Escape") {
        setProfileOpen(false);
      }
    }

    document.addEventListener("mousedown", handleOutsideClick);
    document.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [profileOpen]);

  function handleLogoClick() {
    navigate("/dashboard");
  }

  function handleNotifications() {
    /*
      Keep this ready for when the notifications page/panel is built.
      For now it does not navigate anywhere.
    */
  }

  function handleOpenProfile() {
  setProfileOpen(false);
  navigate("/app/profile");
}

  function handleSignOut() {
    setProfileOpen(false);
    clearAuthSession();
    navigate("/", {
      replace: true,
    });
  }

  const fullName = getUserFullName(liveUser);
  const email = getUserEmail(liveUser);
  const avatar = getUserAvatar(liveUser);
  const initials = getInitials(fullName);

  return (
    <header className="anandam-app-header">
      <div className="anandam-app-header__inner">
        {/* LOGO */}
        <button
          type="button"
          className="anandam-app-header__logo-button"
          onClick={handleLogoClick}
          aria-label="Go to dashboard"
        >
          <img
            src={anandamLogo}
            alt="Anandam"
            className="anandam-app-header__logo"
          />
        </button>

        {/* RIGHT SIDE */}
        <div className="anandam-app-header__actions">
          <button
            type="button"
            className="anandam-app-header__notification"
            onClick={handleNotifications}
            aria-label="Notifications"
          >
            <Bell size={24} strokeWidth={1.5} />
          </button>

          <div
            className="anandam-app-header__profile-wrap"
            ref={dropdownRef}
          >
            <button
              type="button"
              className="anandam-app-header__profile-button"
              onClick={() => setProfileOpen((current) => !current)}
              aria-haspopup="menu"
              aria-expanded={profileOpen}
            >
              <span className="anandam-app-header__avatar">
                {avatar ? (
                  <img src={avatar} alt="" />
                ) : (
                  <span>{initials}</span>
                )}
              </span>

              <span className="anandam-app-header__identity">
                <span className="anandam-app-header__name">
                  {fullName}
                </span>

                <span className="anandam-app-header__email">
                  {email}
                </span>
              </span>
            </button>

            {profileOpen && (
              <div
                className="anandam-app-profile-menu"
                role="menu"
              >
                <div className="anandam-app-profile-menu__user">
                  <span className="anandam-app-profile-menu__avatar">
                    {avatar ? (
                      <img src={avatar} alt="" />
                    ) : (
                      initials
                    )}
                  </span>

                  <div>
                    <p className="anandam-app-profile-menu__label">
                      Welcome back
                    </p>

                    <p className="anandam-app-profile-menu__name">
                      {fullName}
                    </p>

                    {email && (
                      <p className="anandam-app-profile-menu__email">
                        {email}
                      </p>
                    )}
                  </div>
                </div>

                <div className="anandam-app-profile-menu__divider" />

                <button
                  type="button"
                  role="menuitem"
                  className="anandam-app-profile-menu__item"
                  onClick={handleOpenProfile}
                >
                  <User size={17} strokeWidth={1.7} />
                  <span>My Profile</span>
                </button>

                <button
                  type="button"
                  role="menuitem"
                  className="anandam-app-profile-menu__item anandam-app-profile-menu__item--danger"
                  onClick={handleSignOut}
                >
                  <LogOut size={17} strokeWidth={1.7} />
                  <span>Sign out</span>
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