import {
  Fragment,
} from "react";

import {
  useLocation,
  useNavigate,
} from "react-router-dom";

import homeIcon from "../../assets/navbar/home.png";
import calendarIcon from "../../assets/navbar/calendar.png";
import moodIcon from "../../assets/navbar/mood.png";
import workIcon from "../../assets/navbar/work.png";
import fitnessIcon from "../../assets/navbar/fitness.png";
import blogIcon from "../../assets/navbar/write-blog-icon-1px 1.png";
import emergencyIcon from "../../assets/navbar/emergency.png";


const NAV_ITEMS = [
  {
    id: "home",
    label: "Home",
    icon: homeIcon,
    path: "/dashboard",

    // Figma artwork is visually around 20px
    iconSize: 20,
    iconScale: 1,

    matchPaths: [
  "/dashboard",
  "/app/breathing",
  "/app/brain-games",
  "/app/sleep-stories",
],
  },

  {
    id: "day",
    label: "Day",
    icon: calendarIcon,
    path: "/app/perfect-day",

    // Figma calendar = around 20px
    iconSize: 20,
    iconScale: 1,

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

    matchPaths: [
      "/app/work-rest",
    ],
  },

  {
    id: "fitness",
    label: "Fitness",
    icon: fitnessIcon,
    path: "/app/fitness",

    /*
      The Fitness PNG contains more empty transparent
      space around the actual line artwork.

      Slightly enlarge only the artwork, NOT its wrapper.
    */
    iconSize: 24,
    iconScale: 1.28,

    matchPaths: [
      "/app/fitness",
    ],
  },

  {
    id: "blogs",
    label: "Blogs",
    icon: blogIcon,
    path: "/app/blogs",

    /*
      Blog artwork visually occupies more of its PNG,
      so reduce it slightly.
    */
    iconSize: 24,
    iconScale: 0.92,

    matchPaths: [
      "/app/blogs",
    ],
  },

  {
    id: "emergency",
    label: "Emergency",
    icon: emergencyIcon,
    path: "/app/emergency",

    iconSize: 24,
    iconScale: 1,

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


  function handleNavigation(
    item
  ) {
    if (!item.path) {
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

            const active =
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
                        active
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
                      active
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