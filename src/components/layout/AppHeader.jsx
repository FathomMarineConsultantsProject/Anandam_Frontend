import {
  useEffect,
  useRef,
  useState,
} from "react";

import {
  LogOut,
  User,
} from "lucide-react";

import { useNavigate } from "react-router-dom";

import {
  clearAuthSession,
  getStoredUser,
  saveAuthSession,
} from "../../utils/storage";

import { apiRequest } from "../../api/client";

import anandamLogo from "../../assets/anandum logo.png";
import bellIcon from "../../assets/navbar/bell icon.png";

import avatar1 from "../../assets/profile/avatar 1.png";
import avatar2 from "../../assets/profile/avatar 2.png";
import avatar3 from "../../assets/profile/avatar 3.png";
import avatar4 from "../../assets/profile/avatar 4.png";
import avatar5 from "../../assets/profile/avatar 5.png";
import avatar6 from "../../assets/profile/avatar 6.png";
import avatar7 from "../../assets/profile/avatar 7.png";
import avatar8 from "../../assets/profile/avatar 8.png";

const AVATAR_MAP = {
  "1": avatar1,
  "2": avatar2,
  "3": avatar3,
  "4": avatar4,
  "5": avatar5,
  "6": avatar6,
  "7": avatar7,
  "8": avatar8,
};

function unwrapProfileResponse(
  response
) {
  return (
    response?.data ||
    response?.user ||
    response
  );
}

function getInitials(
  fullName = ""
) {
  return (
    fullName
      .trim()
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((part) =>
        part
          .charAt(0)
          .toUpperCase()
      )
      .join("") || "U"
  );
}

function getUserFullName(user) {
  return (
    user?.fullName ||
    user?.full_name ||
    user?.name ||
    [
      user?.firstName,
      user?.lastName,
    ]
      .filter(Boolean)
      .join(" ") ||
    [
      user?.first_name,
      user?.last_name,
    ]
      .filter(Boolean)
      .join(" ") ||
    "User"
  );
}

function getUserEmail(user) {
  return user?.email || "";
}

function getUserAvatar(user) {
  /*
    NEW backend avatar system
  */
  if (
    user?.avatarMode ===
    "AVATAR" &&
    user?.avatarId
  ) {
    return (
      AVATAR_MAP[
      String(user.avatarId)
      ] || null
    );
  }

  /*
    Legacy fallback in case old
    accounts/storage still contain URL.
  */
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
  const navigate =
    useNavigate();

  const dropdownRef =
    useRef(null);

  const [
    profileOpen,
    setProfileOpen,
  ] = useState(false);

  const [
    liveUser,
    setLiveUser,
  ] = useState(() =>
    getStoredUser()
  );

  /* ================================================
     LOAD FRESH PROFILE
     ================================================ */

  useEffect(() => {
    let cancelled = false;

    async function loadProfile() {
      try {
        const response =
          await apiRequest(
            "/profile",
            {
              method: "GET",
            }
          );

        const profile =
          unwrapProfileResponse(
            response
          );

        if (
          !cancelled &&
          profile
        ) {
          setLiveUser(profile);

          try {
            saveAuthSession({
              user: profile,
            });
          } catch {
            // Ignore storage error.
          }
        }
      } catch {
        // Stored user remains fallback.
      }
    }

    loadProfile();

    return () => {
      cancelled = true;
    };
  }, []);

  /* ================================================
     SYNC PROFILE CHANGES
     ================================================ */

  useEffect(() => {
    function syncStoredUser() {
      setLiveUser(
        getStoredUser()
      );
    }

    function handleProfileUpdate(
      event
    ) {
      const updatedProfile =
        event?.detail;

      if (updatedProfile) {
        setLiveUser(
          updatedProfile
        );
      } else {
        syncStoredUser();
      }
    }

    window.addEventListener(
      "storage",
      syncStoredUser
    );

    window.addEventListener(
      "focus",
      syncStoredUser
    );

    window.addEventListener(
      "anandam:profile-updated",
      handleProfileUpdate
    );

    return () => {
      window.removeEventListener(
        "storage",
        syncStoredUser
      );

      window.removeEventListener(
        "focus",
        syncStoredUser
      );

      window.removeEventListener(
        "anandam:profile-updated",
        handleProfileUpdate
      );
    };
  }, []);

  /* ================================================
     CLOSE DROPDOWN
     ================================================ */

  useEffect(() => {
    if (!profileOpen) {
      return;
    }

    function handleOutside(
      event
    ) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(
          event.target
        )
      ) {
        setProfileOpen(false);
      }
    }

    function handleEscape(
      event
    ) {
      if (
        event.key ===
        "Escape"
      ) {
        setProfileOpen(false);
      }
    }

    document.addEventListener(
      "mousedown",
      handleOutside
    );

    document.addEventListener(
      "keydown",
      handleEscape
    );

    return () => {
      document.removeEventListener(
        "mousedown",
        handleOutside
      );

      document.removeEventListener(
        "keydown",
        handleEscape
      );
    };
  }, [profileOpen]);

  function handleLogoClick() {
    navigate("/");
  }

  function handleNotifications() { }

  function handleOpenProfile() {
    setProfileOpen(false);

    navigate(
      "/app/profile"
    );
  }

  function handleSignOut() {
    setProfileOpen(false);

    clearAuthSession();

    navigate("/", {
      replace: true,
    });
  }

  const fullName =
    getUserFullName(
      liveUser
    );

  const email =
    getUserEmail(
      liveUser
    );

  const avatar =
    getUserAvatar(
      liveUser
    );

  const initials =
    getInitials(
      fullName
    );

  return (
    <header className="anandam-app-header">
      <div className="anandam-app-header__inner">
        <button
          type="button"
          className="anandam-app-header__logo-button"
          onClick={
            handleLogoClick
          }
          aria-label="Go to dashboard"
        >
          <img
            src={anandamLogo}
            alt="Anandam"
            className="anandam-app-header__logo"
          />
        </button>

        <div className="anandam-app-header__actions">
          <button
            type="button"
            className="anandam-app-header__notification"
            onClick={handleNotifications}
            aria-label="Notifications"
          >
            <img
              src={bellIcon}
              alt=""
              aria-hidden="true"
              className="anandam-app-header__notification-icon"
            />
          </button>

          <div
            className="anandam-app-header__profile-wrap"
            ref={
              dropdownRef
            }
          >
            <button
              type="button"
              className="anandam-app-header__profile-button"
              onClick={() =>
                setProfileOpen(
                  (current) =>
                    !current
                )
              }
            >
              <span className="anandam-app-header__avatar">
                {avatar ? (
                  <img
                    src={avatar}
                    alt=""
                  />
                ) : (
                  <span>
                    {initials}
                  </span>
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
                      <img
                        src={
                          avatar
                        }
                        alt=""
                      />
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
                  onClick={
                    handleOpenProfile
                  }
                >
                  <User
                    size={17}
                    strokeWidth={
                      1.7
                    }
                  />

                  <span>
                    My Profile
                  </span>
                </button>

                <button
                  type="button"
                  role="menuitem"
                  className="anandam-app-profile-menu__item anandam-app-profile-menu__item--danger"
                  onClick={
                    handleSignOut
                  }
                >
                  <LogOut
                    size={17}
                    strokeWidth={
                      1.7
                    }
                  />

                  <span>
                    Sign out
                  </span>
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