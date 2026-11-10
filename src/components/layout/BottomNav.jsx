import {
  Fragment,
} from "react";

import {
  useLocation,
  useNavigate,
} from "react-router-dom";

import {
  useSiteAccess,
} from "../../context/SiteAccessContext";

import homeIcon from "../../assets/navbar/home.png";
import calendarIcon from "../../assets/navbar/calendar.png";
import moodIcon from "../../assets/navbar/mood.png";
import workIcon from "../../assets/navbar/work.png";
import fitnessIcon from "../../assets/navbar/fitness.png";
import blogIcon from "../../assets/navbar/write-blog-icon-1px 1.png";
import emergencyIcon from "../../assets/navbar/emergency.png";
import marketplaceIcon from "../../assets/navbar/hugeicons_store-02.png";


const NAV_ITEMS = [
  {
    id: "home",
    label: "Home",
    icon: homeIcon,
    path: "/dashboard",
    iconSize: 20,
    iconScale: 1,
    freeAccess: true,

    matchPaths: [
      "/dashboard",
      "/app/breathing",
      "/app/brain-games",
      "/app/sleep-stories",
      "/app/daily-wisdom",
      "/app/wellbeing",
    ],
  },

  {
    id: "day",
    label: "Day",
    icon: calendarIcon,
    path: "/app/perfect-day",
    iconSize: 20,
    iconScale: 1,
    freeAccess: false,

    matchPaths: [
      "/app/perfect-day",
    ],
  },

  {
    id: "mood",
    label: "Mood",
    icon: moodIcon,
    path: "/mood",
    iconSize: 24,
    iconScale: 1,
    freeAccess: false,

    matchPaths: [
      "/mood",
      "/mood-quick",
    ],
  },

  {
    id: "work-rest",
    label: "Work/rest",
    icon: workIcon,
    path: "/app/work-rest",
    iconSize: 24,
    iconScale: 1,
    freeAccess: false,

    matchPaths: [
      "/app/work-rest",
    ],
  },

  {
    id: "fitness",
    label: "Fitness",
    icon: fitnessIcon,
    path: "/app/fitness",
    iconSize: 24,
    iconScale: 1.58,
    freeAccess: false,

    matchPaths: [
      "/app/fitness",
    ],
  },

  {
    id: "blogs",
    label: "Blogs",
    icon: blogIcon,
    path: "/app/blogs",
    iconSize: 24,
    iconScale: 0.92,
    freeAccess: true,

    matchPaths: [
      "/app/blogs",
    ],
  },

  {
    id: "marketplace",
    label: "Marketplace",
    icon: marketplaceIcon,
    path: "/marketplace",
    iconSize: 25,
    iconScale: 0.92,
    freeAccess: false,

    matchPaths: [
      "/marketplace",
    ],
  },

  {
    id: "emergency",
    label: "Emergency",
    icon: emergencyIcon,
    path: "/app/emergency",
    iconSize: 24,
    iconScale: 1,
    freeAccess: false,

    matchPaths: [
      "/app/emergency",
    ],
  },
];


function isItemActive(
  item,
  pathname
) {
  return item.matchPaths.some(
    (path) =>
      pathname === path ||
      pathname.startsWith(
        `${path}/`
      )
  );
}


function BottomNav() {
  const navigate =
    useNavigate();

  const location =
    useLocation();

  const {
    active,
    loading,
    requestAccess,
  } = useSiteAccess();


  function handleNavigation(
    item
  ) {
    if (!item.path) {
      return;
    }

    if (item.freeAccess) {
      if (
        location.pathname !==
        item.path
      ) {
        navigate(
          item.path
        );
      }

      return;
    }

    if (loading) {
      return;
    }

    if (!active) {
      requestAccess(
        item.path
      );

      return;
    }

    if (
      location.pathname !==
      item.path
    ) {
      navigate(
        item.path
      );
    }
  }


  return (
    <nav
      className="anandam-side-nav"
      aria-label="Primary application navigation"
    >
      <div className="anandam-side-nav__items">

        {NAV_ITEMS.map(
          (
            item,
            index
          ) => {
            const activeItem =
              isItemActive(
                item,
                location.pathname
              );

            return (
              <Fragment
                key={item.id}
              >
                <div
                  className="anandam-side-nav__entry"
                >
                  <button
                    type="button"
                    className={
                      `anandam-side-nav__item${
                        activeItem
                          ? " is-active"
                          : ""
                      }`
                    }
                    onClick={() =>
                      handleNavigation(
                        item
                      )
                    }
                    aria-current={
                      activeItem
                        ? "page"
                        : undefined
                    }
                    title={
                      item.label
                    }
                  >
                    <span
                      className="anandam-side-nav__icon-wrap"
                    >
                      <img
                        src={item.icon}
                        alt=""
                        aria-hidden="true"
                        className="anandam-side-nav__icon"
                        style={{
                          "--nav-icon-size":
                            `${item.iconSize}px`,

                          "--nav-icon-scale":
                            item.iconScale,
                        }}
                      />
                    </span>


                    <span
                      className="anandam-side-nav__label"
                    >
                      {item.label}
                    </span>
                  </button>
                </div>


                {index <
                  NAV_ITEMS.length -
                    1 && (
                  <span
                    className="anandam-side-nav__divider"
                    aria-hidden="true"
                  />
                )}

              </Fragment>
            );
          }
        )}

      </div>
    </nav>
  );
}


export default BottomNav;
