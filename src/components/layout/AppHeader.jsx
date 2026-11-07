import {
  useEffect,
  useRef,
  useState,
} from "react";

import {
  LogOut,
  Minus,
  Plus,
  User,
} from "lucide-react";

import {
  useLocation,
  useNavigate,
} from "react-router-dom";

import {
  clearAuthSession,
  getStoredUser,
  saveAuthSession,
} from "../../utils/storage";

import {
  apiRequest,
} from "../../api/client";

import anandamLogo
  from "../../assets/anandum logo.png";

import bellIcon
  from "../../assets/navbar/bell icon.png";

import tokenCoin
  from "../../assets/token coin.png";

import avatar1
  from "../../assets/profile/avatar 1.png";

import avatar2
  from "../../assets/profile/avatar 2.png";

import avatar3
  from "../../assets/profile/avatar 3.png";

import avatar4
  from "../../assets/profile/avatar 4.png";

import avatar5
  from "../../assets/profile/avatar 5.png";

import avatar6
  from "../../assets/profile/avatar 6.png";

import avatar7
  from "../../assets/profile/avatar 7.png";

import avatar8
  from "../../assets/profile/avatar 8.png";


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


function unwrapTokenResponse(
  response
) {
  const data =
    response?.data ??
    response ??
    {};


  return {
    balance:
      Number(
        data?.balance ??
        0
      ),

    tokenPriceInr:
      Number(
        data?.tokenPriceInr ??
        100
      ),

    currency:
      data?.currency ||
      "INR",

    contactEmail:
      data?.contactEmail ||
      "",

    hasTokenHistory:
      typeof data?.hasTokenHistory ===
        "boolean"
        ? data.hasTokenHistory
        : null,
  };
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
      .map(
        (part) =>
          part
            .charAt(0)
            .toUpperCase()
      )
      .join("") ||
    "U"
  );
}


function getUserFullName(
  user
) {
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


function getUserEmail(
  user
) {
  return (
    user?.email ||
    ""
  );
}


function getUserAvatar(
  user
) {
  if (
    user?.avatarMode ===
      "AVATAR" &&
    user?.avatarId
  ) {
    return (
      AVATAR_MAP[
        String(
          user.avatarId
        )
      ] ||
      null
    );
  }


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

  const location =
    useLocation();


  const profileDropdownRef =
    useRef(null);

  const tokenDropdownRef =
    useRef(null);


  const [
    profileOpen,
    setProfileOpen,
  ] = useState(false);

  const [
    tokenOpen,
    setTokenOpen,
  ] = useState(false);

  const [
    tokenSummary,
    setTokenSummary,
  ] = useState(null);

  const [
    tokenLoading,
    setTokenLoading,
  ] = useState(true);

  const [
    tokenError,
    setTokenError,
  ] = useState("");

  const [
    requestedTokens,
    setRequestedTokens,
  ] = useState(4);

  const [
    liveUser,
    setLiveUser,
  ] = useState(
    () =>
      getStoredUser()
  );


  // =====================================================
  // LOAD PROFILE
  // =====================================================

  useEffect(() => {
    let cancelled =
      false;


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
          setLiveUser(
            profile
          );


          try {
            saveAuthSession({
              user: profile,
            });
          } catch {
            // Keep current session.
          }
        }
      } catch {
        // Stored user remains fallback.
      }
    }


    loadProfile();


    return () => {
      cancelled =
        true;
    };
  }, []);


  // =====================================================
  // LOAD TOKEN BALANCE
  // =====================================================

  useEffect(() => {
    let cancelled =
      false;


    async function loadTokens() {
      setTokenLoading(
        true
      );

      setTokenError(
        ""
      );


      try {
        const response =
          await apiRequest(
            "/tokens/me",
            {
              method: "GET",
            }
          );


        const summary =
          unwrapTokenResponse(
            response
          );


        if (
          !cancelled
        ) {
          setTokenSummary(
            summary
          );
        }
      } catch {
        if (
          !cancelled
        ) {
          setTokenError(
            "Unable to load token balance."
          );
        }
      } finally {
        if (
          !cancelled
        ) {
          setTokenLoading(
            false
          );
        }
      }
    }


    loadTokens();


    function handleTokenUpdate() {
      loadTokens();
    }


    window.addEventListener(
      "anandam:tokens-updated",
      handleTokenUpdate
    );


    return () => {
      cancelled =
        true;


      window.removeEventListener(
        "anandam:tokens-updated",
        handleTokenUpdate
      );
    };
  }, [
    location.pathname,
  ]);


  // =====================================================
  // PROFILE SYNC
  // =====================================================

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


      if (
        updatedProfile
      ) {
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


  // =====================================================
  // CLOSE POPUPS ON OUTSIDE CLICK / ESCAPE
  // =====================================================

  useEffect(() => {
    if (
      !profileOpen &&
      !tokenOpen
    ) {
      return;
    }


    function handleOutside(
      event
    ) {
      if (
        tokenOpen &&
        tokenDropdownRef.current &&
        !tokenDropdownRef
          .current
          .contains(
            event.target
          )
      ) {
        setTokenOpen(
          false
        );
      }


      if (
        profileOpen &&
        profileDropdownRef.current &&
        !profileDropdownRef
          .current
          .contains(
            event.target
          )
      ) {
        setProfileOpen(
          false
        );
      }
    }


    function handleEscape(
      event
    ) {
      if (
        event.key ===
        "Escape"
      ) {
        setTokenOpen(
          false
        );

        setProfileOpen(
          false
        );
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
  }, [
    profileOpen,
    tokenOpen,
  ]);


  // =====================================================
  // TOKEN ACTIONS
  // =====================================================

  function handleTokenToggle() {
    setProfileOpen(
      false
    );

    setTokenOpen(
      (current) =>
        !current
    );
  }


  function decreaseRequestedTokens() {
    setRequestedTokens(
      (current) =>
        Math.max(
          1,
          current - 1
        )
    );
  }


  function increaseRequestedTokens() {
    setRequestedTokens(
      (current) =>
        current + 1
    );
  }


  function handleContactForTokens() {
  const contactEmail =
    "contact@fathommarineconsultants.com";


  const username =
    liveUser?.username ||
    liveUser?.userName ||
    liveUser?.name ||
    liveUser?.fullName ||
    liveUser?.full_name ||
    fullName ||
    "User";


  const registeredEmail =
    email ||
    liveUser?.email ||
    "Not available";


  const currentTokenPrice =
    Number(
      tokenSummary
        ?.tokenPriceInr ??
        100
    );


  const totalAmount =
    requestedTokens *
    currentTokenPrice;


  const subject =
    `Anandam Token Request - ${username} - ${requestedTokens} ${
      requestedTokens === 1
        ? "Token"
        : "Tokens"
    }`;


  const body = [
    "Hello Fathom Marine Consultants Team,",
    "",
    "I would like to request additional Anandam tokens.",
    "",
    `Username: ${username}`,
    `Registered Email: ${registeredEmail}`,
    `Tokens Requested: ${requestedTokens}`,
    `Price Per Token: ₹${currentTokenPrice.toLocaleString("en-IN")}`,
    `Total Estimated Amount: ₹${totalAmount.toLocaleString("en-IN")}`,
    "",
    `I would like to purchase ${requestedTokens} ${
      requestedTokens === 1
        ? "token"
        : "tokens"
    } for my Anandam account.`,
    "",
    "Please provide the payment instructions.",
    "",
    "Once payment has been completed and verified, please add the requested tokens to my account.",
    "",
    "Thank you,",
    username,
  ].join("\n");


  const mailto =
    `mailto:${contactEmail}` +
    `?subject=${encodeURIComponent(
      subject
    )}` +
    `&body=${encodeURIComponent(
      body
    )}`;


  window.location.href =
    mailto;
}


  // =====================================================
  // HEADER ACTIONS
  // =====================================================

  function handleLogoClick() {
    navigate("/");
  }


  function handleNotifications() {
    // Notification behaviour can be connected later.
  }


  function handleOpenProfile() {
    setProfileOpen(
      false
    );

    navigate(
      "/app/profile"
    );
  }


  function handleSignOut() {
    setProfileOpen(
      false
    );

    setTokenOpen(
      false
    );

    clearAuthSession();

    navigate(
      "/",
      {
        replace: true,
      }
    );
  }


  // =====================================================
  // DISPLAY DATA
  // =====================================================

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


  const tokenBalance =
    Number(
      tokenSummary
        ?.balance ??
        0
    );


  const tokenPrice =
    Number(
      tokenSummary
        ?.tokenPriceInr ??
        100
    );


  const requestedValue =
    requestedTokens *
    tokenPrice;


  const hasNoTokens =
    !tokenLoading &&
    tokenBalance <= 0;


  let zeroTokenMessage =
    "You don't have any tokens available";

  let zeroTokenHeading =
    "Need more tokens?";


  if (
    tokenSummary
      ?.hasTokenHistory ===
    true
  ) {
    zeroTokenMessage =
      "You have used all your available tokens";
  }


  if (
    tokenSummary
      ?.hasTokenHistory ===
    false
  ) {
    zeroTokenMessage =
      "You don't have any tokens yet";

    zeroTokenHeading =
      "Need tokens to get started";
  }


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

          {/* TOKEN */}

          <div
            ref={tokenDropdownRef}
            className="anandam-token-control"
          >
            <button
              type="button"
              className="anandam-token-control__button"
              onClick={handleTokenToggle}
              aria-expanded={tokenOpen}
              aria-haspopup="dialog"
            >
              <img
                src={tokenCoin}
                alt=""
                aria-hidden="true"
                className="anandam-token-control__coin"
              />

              <span className="anandam-token-control__label">
                {tokenLoading
                  ? "..."
                  : tokenBalance}

                {" "}

                {!tokenLoading &&
                tokenBalance === 1
                  ? "Token"
                  : "Tokens"}
              </span>
            </button>


            {/* TOKEN POPUP */}

            {tokenOpen && (
              <div
                className="anandam-token-menu"
                role="dialog"
                aria-label="Your tokens"
              >
                <button
                  type="button"
                  className="anandam-token-menu__close"
                  onClick={() =>
                    setTokenOpen(
                      false
                    )
                  }
                  aria-label="Close token menu"
                >
                  ×
                </button>


                <h3 className="anandam-token-menu__title">
                  Your Tokens
                </h3>


                <div className="anandam-token-menu__balance">
                  <img
                    src={tokenCoin}
                    alt=""
                    aria-hidden="true"
                  />

                  <strong>
                    {tokenLoading
                      ? "..."
                      : tokenBalance}
                  </strong>

                  <span>
                    Tokens Remaining
                  </span>
                </div>


                <p className="anandam-token-menu__price">
                  1 token = ₹
                  {tokenPrice.toLocaleString(
                    "en-IN"
                  )}
                </p>


                {hasNoTokens && (
                  <div className="anandam-token-menu__warning">
                    <span className="anandam-token-menu__warning-icon">
                      i
                    </span>

                    <span>
                      {zeroTokenMessage}
                    </span>
                  </div>
                )}


                <div className="anandam-token-menu__divider" />


                {tokenBalance > 0 && (
                  <p className="anandam-token-menu__hint">
                    Use tokens across supported Anandam features.
                  </p>
                )}


                <div className="anandam-token-menu__divider anandam-token-menu__divider--small" />


                <div className="anandam-token-menu__request-copy">
                  <strong>
                    {zeroTokenHeading}
                  </strong>

                  <span>
                    Select the number of tokens to calculate the estimated amount.
                  </span>
                </div>


                <div className="anandam-token-menu__counter">
                  <button
                    type="button"
                    onClick={
                      decreaseRequestedTokens
                    }
                    disabled={
                      requestedTokens <= 1
                    }
                    aria-label="Decrease tokens"
                  >
                    <Minus
                      size={14}
                      strokeWidth={1.5}
                    />
                  </button>

                  <strong>
                    {requestedTokens}
                  </strong>

                  <button
                    type="button"
                    onClick={
                      increaseRequestedTokens
                    }
                    aria-label="Increase tokens"
                  >
                    <Plus
                      size={14}
                      strokeWidth={1.5}
                    />
                  </button>
                </div>


                <div className="anandam-token-menu__estimate">
                  <span>
                    Estimated value
                  </span>

                  <strong>
                    ₹
                    {requestedValue.toLocaleString(
                      "en-IN"
                    )}
                  </strong>
                </div>


                {tokenError && (
                  <p className="anandam-token-menu__error">
                    {tokenError}
                  </p>
                )}


                <button
                  type="button"
                  className="anandam-token-menu__contact"
                  onClick={
                    handleContactForTokens
                  }
                >
                  Contact Anandam
                </button>
              </div>
            )}
          </div>


          {/* NOTIFICATION */}

          <button
            type="button"
            className="anandam-app-header__notification"
            onClick={
              handleNotifications
            }
            aria-label="Notifications"
          >
            <img
              src={bellIcon}
              alt=""
              aria-hidden="true"
              className="anandam-app-header__notification-icon"
            />
          </button>


          {/* PROFILE */}

          <div
            ref={profileDropdownRef}
            className="anandam-app-header__profile-wrap"
          >
            <button
              type="button"
              className="anandam-app-header__profile-button"
              aria-expanded={
                profileOpen
              }
              onClick={() => {
                setTokenOpen(
                  false
                );

                setProfileOpen(
                  (current) =>
                    !current
                );
              }}
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
                        src={avatar}
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
                    strokeWidth={1.7}
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
                    strokeWidth={1.7}
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