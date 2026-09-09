import { useLocation, useNavigate } from "react-router-dom";

import homeIcon from "../../assets/navbar/home.png";
import calendarIcon from "../../assets/navbar/calendar.png";
import moodIcon from "../../assets/navbar/mood.png";
import workIcon from "../../assets/navbar/work.png";
import fitnessIcon from "../../assets/navbar/fitness.png";
import emergencyIcon from "../../assets/navbar/emergency.png";

const NAV_ITEMS = [
  {
    id: "home",
    label: "Home",
    icon: homeIcon,
    path: "/dashboard",
    matchPaths: ["/dashboard"],
  },
  {
    id: "day",
    label: "Day",
    icon: calendarIcon,
    path: "/app/perfect-day",
    matchPaths: ["/app/perfect-day"],
  },
  {
    id: "mood",
    label: "Mood",
    icon: moodIcon,

    // IMPORTANT:
    // Clicking Mood from the sidebar goes to the normal Mood page.
    path: "/mood",

    // Both mood pages show Mood as active.
    matchPaths: ["/mood", "/mood-quick"],
  },
  {
    id: "work-rest",
    label: "Work/rest",
    icon: workIcon,
    path: "/app/work-rest",
    matchPaths: ["/app/work-rest"],
  },
  {
    id: "fitness",
    label: "Fitness",
    icon: fitnessIcon,
    path: "/app/fitness",
    matchPaths: ["/app/fitness"],
  },
  {
    id: "emergency",
    label: "Emergency",
    icon: emergencyIcon,
    path: "/app/emergency",
    matchPaths: ["/app/emergency"],
  },
];

function isItemActive(item, pathname) {
  return item.matchPaths.some((path) => {
    return (
      pathname === path ||
      pathname.startsWith(`${path}/`)
    );
  });
}

function BottomNav() {
  const navigate = useNavigate();
  const location = useLocation();

  function handleNavigation(item) {
    if (!item.path) return;

    if (location.pathname !== item.path) {
      navigate(item.path);
    }
  }

  return (
    <nav
      className="anandam-side-nav"
      aria-label="Primary application navigation"
    >
      <div className="anandam-side-nav__items">
        {NAV_ITEMS.map((item, index) => {
          const active = isItemActive(
            item,
            location.pathname
          );

          return (
            <div
              key={item.id}
              className="anandam-side-nav__entry"
            >
              <button
                type="button"
                className={`anandam-side-nav__item${
                  active ? " is-active" : ""
                }`}
                onClick={() => handleNavigation(item)}
                aria-current={active ? "page" : undefined}
                title={item.label}
              >
                <span className="anandam-side-nav__icon-wrap">
                  <img
                    src={item.icon}
                    alt=""
                    aria-hidden="true"
                    className="anandam-side-nav__icon"
                  />
                </span>

                <span className="anandam-side-nav__label">
                  {item.label}
                </span>
              </button>

              {index < NAV_ITEMS.length - 1 && (
                <span
                  className="anandam-side-nav__divider"
                  aria-hidden="true"
                />
              )}
            </div>
          );
        })}
      </div>
    </nav>
  );
}

export default BottomNav;