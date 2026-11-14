import {
  useCallback,
  useEffect,
  useState,
} from "react";

import {
  createPortal,
} from "react-dom";

import {
  useLocation,
  useNavigate,
} from "react-router-dom";

import {
  X,
} from "lucide-react";

import {
  getStoredToken,
} from "../../utils/storage";


// ============================================================
// YOGA GIFS
// ============================================================

import cobraGif from "../../assets/fitness/cobra pose.gif";

import treeGif from "../../assets/fitness/Tree Pose (Vrikshasana).gif";

import bowGif from "../../assets/fitness/Bow Pose (Dhanurasana).gif";

import triangleGif from "../../assets/fitness/Triangle Pose (Trikonasana).gif";

import warriorGif from "../../assets/fitness/Warrior III (Virabhadrasana III).gif";

import extendedSideAngleGif from "../../assets/fitness/Extended Side Angle Pose (Utthita Parsvakonasana).gif";

import suryaGif from "../../assets/fitness/surya namaskar.gif";

import halfMoonGif from "../../assets/fitness/Half Moon Pose (Ardha Chandrasana).gif";


import "../../styles/wellness-reminder.css";


// ============================================================
// TIMER SETTINGS
// ============================================================

// Normal reminder:
// every 50 minutes
const REGULAR_REMINDER_MS =
  50 * 60 * 1000;


// Remind me later:
// random between 5 and 10 minutes
const SNOOZE_MIN_MS =
  5 * 60 * 1000;

const SNOOZE_MAX_MS =
  10 * 60 * 1000;


// ============================================================
// STORAGE
// ============================================================

const NEXT_REMINDER_KEY =
  "anandam:wellness-reminder:next-at";

const RECENT_REMINDERS_KEY =
  "anandam:wellness-reminder:recent-ids";


// Do not repeat any of the last 4 poses
const RECENT_REMINDER_LIMIT = 4;


// ============================================================
// REMINDER POSES
// IMPORTANT:
// poseId MUST exactly match the id inside guidedYogaData.js
// ============================================================

const REMINDERS = [
  {
    id: "reminder-cobra",
    poseId: "cobra-pose",

    type: "movement",

    image: cobraGif,

    title:
      "Time for a quick movement break?",

    description:
      "You’ve been focused for nearly 50 minutes. A short movement break can help you reset before continuing.",

    tip:
      "Take 2 minutes to stretch, move, or try a quick exercise.",

    actionLabel:
      "Start a quick exercise",
  },


  {
    id: "reminder-tree",
    poseId: "tree-pose",

    type: "movement",

    image: treeGif,

    title:
      "Time for a quick movement break?",

    description:
      "You’ve been focused for nearly 50 minutes. A short movement break can help you reset before continuing.",

    tip:
      "Take 2 minutes to stretch, move, or try a quick exercise.",

    actionLabel:
      "Start a quick exercise",
  },


  {
    id: "reminder-bow",
    poseId: "bow-pose",

    type: "movement",

    image: bowGif,

    title:
      "Time for a quick movement break?",

    description:
      "You’ve been focused for nearly 50 minutes. A short movement break can help you reset before continuing.",

    tip:
      "Take 2 minutes to stretch, move, or try a quick exercise.",

    actionLabel:
      "Start a quick exercise",
  },


  {
    id: "reminder-triangle",
    poseId: "triangle-pose",

    type: "movement",

    image: triangleGif,

    title:
      "Time for a quick movement break?",

    description:
      "You’ve been focused for nearly 50 minutes. A short movement break can help you reset before continuing.",

    tip:
      "Take 2 minutes to stretch, move, or try a quick exercise.",

    actionLabel:
      "Start a quick exercise",
  },


  {
    id: "reminder-warrior-three",
    poseId: "warrior-three",

    type: "movement",

    image: warriorGif,

    title:
      "Time for a quick movement break?",

    description:
      "You’ve been focused for nearly 50 minutes. A short movement break can help you reset before continuing.",

    tip:
      "Take 2 minutes to stretch, move, or try a quick exercise.",

    actionLabel:
      "Start a quick exercise",
  },


  {
    id: "reminder-extended-side-angle",
    poseId: "extended-side-angle",

    type: "movement",

    image: extendedSideAngleGif,

    title:
      "Time for a quick movement break?",

    description:
      "You’ve been focused for nearly 50 minutes. A short movement break can help you reset before continuing.",

    tip:
      "Take 2 minutes to stretch, move, or try a quick exercise.",

    actionLabel:
      "Start a quick exercise",
  },


  {
    id: "reminder-surya-namaskar",
    poseId: "surya-namaskar",

    type: "movement",

    image: suryaGif,

    title:
      "Time for a quick movement break?",

    description:
      "You’ve been focused for nearly 50 minutes. A short movement break can help you reset before continuing.",

    tip:
      "Take 2 minutes to stretch, move, or try a quick exercise.",

    actionLabel:
      "Start a quick exercise",
  },


  {
    id: "reminder-half-moon",
    poseId: "half-moon-pose",

    type: "movement",

    image: halfMoonGif,

    title:
      "Time for a quick movement break?",

    description:
      "You’ve been focused for nearly 50 minutes. A short movement break can help you reset before continuing.",

    tip:
      "Take 2 minutes to stretch, move, or try a quick exercise.",

    actionLabel:
      "Start a quick exercise",
  },
];


// ============================================================
// HELPERS
// ============================================================

function readTimestamp() {
  const raw =
    sessionStorage.getItem(
      NEXT_REMINDER_KEY
    );

  const value =
    Number(raw);

  if (
    !Number.isFinite(value) ||
    value <= 0
  ) {
    return null;
  }

  return value;
}


function saveTimestamp(
  timestamp
) {
  sessionStorage.setItem(
    NEXT_REMINDER_KEY,
    String(timestamp)
  );
}


function createNextTimestamp(
  delay
) {
  return Date.now() + delay;
}


// ============================================================
// RANDOM 5–10 MINUTE SNOOZE
// ============================================================

function getRandomSnoozeDelay() {
  return (
    Math.floor(
      Math.random() *
        (
          SNOOZE_MAX_MS -
          SNOOZE_MIN_MS +
          1
        )
    ) +
    SNOOZE_MIN_MS
  );
}


// ============================================================
// RANDOM POSE
// Prevent last 4 poses from repeating
// ============================================================

function chooseRandomReminder() {
  if (!REMINDERS.length) {
    return null;
  }

  let recentIds = [];


  try {
    const stored =
      sessionStorage.getItem(
        RECENT_REMINDERS_KEY
      );

    recentIds =
      stored
        ? JSON.parse(stored)
        : [];

    if (
      !Array.isArray(
        recentIds
      )
    ) {
      recentIds = [];
    }
  } catch {
    recentIds = [];
  }


  let candidates =
    REMINDERS.filter(
      (item) =>
        !recentIds.includes(
          item.id
        )
    );


  /*
    Safety fallback.
  */
  if (!candidates.length) {
    candidates = REMINDERS;

    recentIds = [];
  }


  const randomIndex =
    Math.floor(
      Math.random() *
        candidates.length
    );


  const selected =
    candidates[
      randomIndex
    ];


  const nextRecentIds = [
    selected.id,

    ...recentIds.filter(
      (id) =>
        id !== selected.id
    ),
  ].slice(
    0,
    RECENT_REMINDER_LIMIT
  );


  sessionStorage.setItem(
    RECENT_REMINDERS_KEY,

    JSON.stringify(
      nextRecentIds
    )
  );


  return selected;
}


// ============================================================
// COMPONENT
// ============================================================

export default function WellnessReminder() {
  const navigate =
    useNavigate();

  const location =
    useLocation();


  const [
    isOpen,
    setIsOpen,
  ] = useState(false);


  const [
    imageOrientation,
    setImageOrientation,
  ] = useState("normal");


  const [
    activeReminder,
    setActiveReminder,
  ] = useState(null);


  const [
    scheduleVersion,
    setScheduleVersion,
  ] = useState(0);


  const token =
    getStoredToken?.();


  const authenticated =
    Boolean(token);


  // ==========================================================
  // SHOW RANDOM REMINDER
  // ==========================================================

  const showReminder =
    useCallback(() => {
      const reminder =
        chooseRandomReminder();


      if (!reminder) {
        return;
      }


      setImageOrientation(
        "normal"
      );


      setActiveReminder(
        reminder
      );


      setIsOpen(true);
    }, []);


  // ==========================================================
  // SCHEDULE NEXT
  // ==========================================================

  const scheduleNext =
    useCallback(
      (delay) => {
        const nextTimestamp =
          createNextTimestamp(
            delay
          );


        saveTimestamp(
          nextTimestamp
        );


        setIsOpen(false);


        setActiveReminder(
          null
        );


        setScheduleVersion(
          (current) =>
            current + 1
        );
      },
      []
    );


  // ==========================================================
  // MAIN TIMER
  // ==========================================================

  useEffect(() => {
    if (!authenticated) {
      setIsOpen(false);

      setActiveReminder(
        null
      );


      sessionStorage.removeItem(
        NEXT_REMINDER_KEY
      );


      sessionStorage.removeItem(
        RECENT_REMINDERS_KEY
      );


      return undefined;
    }


    /*
      Do not create another timer
      while popup is currently visible.
    */
    if (isOpen) {
      return undefined;
    }


    let nextTimestamp =
      readTimestamp();


    /*
      First reminder after 50 minutes.
    */
    if (!nextTimestamp) {
      nextTimestamp =
        createNextTimestamp(
          REGULAR_REMINDER_MS
        );


      saveTimestamp(
        nextTimestamp
      );
    }


    let timerId = null;


    function checkReminderTime() {
      const currentNext =
        readTimestamp();


      if (!currentNext) {
        return false;
      }


      if (
        Date.now() >=
        currentNext
      ) {
        showReminder();

        return true;
      }


      return false;
    }


    /*
      Browser may have been hidden,
      sleeping, etc.
    */
    if (
      checkReminderTime()
    ) {
      return undefined;
    }


    const remainingTime =
      Math.max(
        0,

        nextTimestamp -
          Date.now()
      );


    timerId =
      window.setTimeout(
        () => {
          showReminder();
        },

        remainingTime
      );


    function handleWindowFocus() {
      checkReminderTime();
    }


    function handleVisibilityChange() {
      if (
        document.visibilityState ===
        "visible"
      ) {
        checkReminderTime();
      }
    }


    window.addEventListener(
      "focus",
      handleWindowFocus
    );


    document.addEventListener(
      "visibilitychange",
      handleVisibilityChange
    );


    return () => {
      if (timerId) {
        window.clearTimeout(
          timerId
        );
      }


      window.removeEventListener(
        "focus",
        handleWindowFocus
      );


      document.removeEventListener(
        "visibilitychange",
        handleVisibilityChange
      );
    };
  }, [
    authenticated,
    isOpen,
    location.pathname,
    scheduleVersion,
    showReminder,
  ]);


  // ==========================================================
  // X BUTTON
  //
  // Closing normally means:
  // next regular reminder after 50 minutes
  // ==========================================================

  const handleClose =
    useCallback(() => {
      scheduleNext(
        REGULAR_REMINDER_MS
      );
    }, [
      scheduleNext,
    ]);


  // ==========================================================
  // ESC KEY + BODY SCROLL
  // ==========================================================

  useEffect(() => {
    if (!isOpen) {
      return undefined;
    }


    const previousOverflow =
      document.body.style.overflow;


    document.body.style.overflow =
      "hidden";


    function handleKeyDown(
      event
    ) {
      if (
        event.key ===
        "Escape"
      ) {
        handleClose();
      }
    }


    window.addEventListener(
      "keydown",
      handleKeyDown
    );


    return () => {
      document.body.style.overflow =
        previousOverflow;


      window.removeEventListener(
        "keydown",
        handleKeyDown
      );
    };
  }, [
    isOpen,
    handleClose,
  ]);


  // ==========================================================
  // REMIND ME LATER
  //
  // Random 5–10 minutes
  // ==========================================================

  function handleRemindLater() {
    scheduleNext(
      getRandomSnoozeDelay()
    );
  }


  // ==========================================================
  // START QUICK EXERCISE
  //
  // Goes directly to matching yoga pose
  // ==========================================================

  function handlePrimaryAction() {
    if (!activeReminder) {
      return;
    }


    /*
      User started the exercise.

      Begin another normal
      50-minute cycle.
    */
    scheduleNext(
      REGULAR_REMINDER_MS
    );


    /*
      Navigate to Fitness and tell
      FitnessPage exactly which pose
      should open.
    */
    navigate(
      "/app/fitness",
      {
        state: {
          openFitnessTab:
            "yoga",

          yogaPoseId:
            activeReminder.poseId,
        },
      }
    );
  }


  // ==========================================================
  // NOTHING TO SHOW
  // ==========================================================

  if (
    !authenticated ||
    !isOpen ||
    !activeReminder
  ) {
    return null;
  }


  // ==========================================================
  // POPUP
  // ==========================================================

  return createPortal(
    <div
      className="wellness-reminder-overlay"
      role="presentation"
    >
      <div
        className={`wellness-reminder-modal wellness-reminder-modal--${activeReminder.type}`}
        role="dialog"
        aria-modal="true"
        aria-labelledby="wellness-reminder-title"
        aria-describedby="wellness-reminder-description"
      >

        {/* CLOSE */}

        <button
          type="button"
          className="wellness-reminder-close"
          onClick={handleClose}
          aria-label="Close reminder"
        >
          <X
            size={28}
            strokeWidth={2}
          />
        </button>


        {/* YOGA GIF */}

        <div className="wellness-reminder-visual">
          <img
            key={
              activeReminder.id
            }

            src={
              activeReminder.image
            }

            alt=""

            aria-hidden="true"

            className={
              `wellness-reminder-gif wellness-reminder-gif--${imageOrientation}`
            }

            onLoad={(event) => {
              const image =
                event.currentTarget;


              const width =
                image.naturalWidth;


              const height =
                image.naturalHeight;


              /*
                Tall yoga poses
              */
              if (
                height >
                width * 1.2
              ) {
                setImageOrientation(
                  "vertical"
                );

                return;
              }


              /*
                Wide poses
              */
              if (
                width >
                height * 1.25
              ) {
                setImageOrientation(
                  "horizontal"
                );

                return;
              }


              setImageOrientation(
                "normal"
              );
            }}
          />
        </div>


        {/* TITLE */}

        <h2
          id="wellness-reminder-title"
          className="wellness-reminder-title"
        >
          {
            activeReminder.title
          }
        </h2>


        {/* DIVIDER */}

        <div
          className="wellness-reminder-divider"
          aria-hidden="true"
        />


        {/* DESCRIPTION */}

        <p
          id="wellness-reminder-description"
          className="wellness-reminder-description"
        >
          {
            activeReminder.description
          }
        </p>


        {/* TIP */}

        <div className="wellness-reminder-tip">
          {
            activeReminder.tip
          }
        </div>


        {/* BUTTONS */}

        <div className="wellness-reminder-actions">

          <button
            type="button"
            className="wellness-reminder-button wellness-reminder-button--secondary"
            onClick={
              handleRemindLater
            }
          >
            Remind me later
          </button>


          <button
            type="button"
            className="wellness-reminder-button wellness-reminder-button--primary"
            onClick={
              handlePrimaryAction
            }
          >
            {
              activeReminder.actionLabel
            }
          </button>

        </div>

      </div>
    </div>,
    document.body
  );
}