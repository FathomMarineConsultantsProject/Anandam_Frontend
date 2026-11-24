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
// MOVEMENT / YOGA GIFS
// ============================================================

import cobraGif from "../../assets/fitness/cobra pose.gif";

import treeGif from "../../assets/fitness/Tree Pose (Vrikshasana).gif";

import bowGif from "../../assets/fitness/Bow Pose (Dhanurasana).gif";

import triangleGif from "../../assets/fitness/Triangle Pose (Trikonasana).gif";

import warriorGif from "../../assets/fitness/Warrior III (Virabhadrasana III).gif";

import extendedSideAngleGif from "../../assets/fitness/Extended Side Angle Pose (Utthita Parsvakonasana).gif";

import suryaGif from "../../assets/fitness/surya namaskar.gif";

import halfMoonGif from "../../assets/fitness/Half Moon Pose (Ardha Chandrasana).gif";


// ============================================================
// HYDRATION GIF
// ============================================================

import hydrationGif from "../../assets/fitness/man drinking water.gif";


import "../../styles/wellness-reminder.css";


// ============================================================
// TIMER SETTINGS
// ============================================================

// Movement / yoga reminder:
// every 50 minutes
const MOVEMENT_REMINDER_MS =
  50 * 60 * 1000;


// Hydration reminder:
// every 60 minutes
const HYDRATION_REMINDER_MS =
  60 * 60 * 1000;


// Movement "Remind me later":
// random between 5 and 10 minutes
const MOVEMENT_SNOOZE_MIN_MS =
  5 * 60 * 1000;

const MOVEMENT_SNOOZE_MAX_MS =
  10 * 60 * 1000;


// Hydration "Remind me later":
// fixed 10 minutes
const HYDRATION_SNOOZE_MS =
  10 * 60 * 1000;


// ============================================================
// STORAGE
// ============================================================

// Keep the old movement key so existing users do not lose
// their current movement reminder schedule.
const NEXT_MOVEMENT_REMINDER_KEY =
  "anandam:wellness-reminder:next-at";


const NEXT_HYDRATION_REMINDER_KEY =
  "anandam:hydration-reminder:next-at";


const RECENT_REMINDERS_KEY =
  "anandam:wellness-reminder:recent-ids";


const HYDRATION_BENEFIT_INDEX_KEY =
  "anandam:hydration-reminder:benefit-index";


// Do not repeat any of the last 4 yoga poses.
const RECENT_REMINDER_LIMIT =
  4;


// ============================================================
// MOVEMENT / YOGA REMINDERS
//
// IMPORTANT:
// poseId MUST exactly match the id inside guidedYogaData.js
// ============================================================

const MOVEMENT_REMINDERS = [
  {
    id:
      "reminder-cobra",

    poseId:
      "cobra-pose",

    type:
      "movement",

    image:
      cobraGif,

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
    id:
      "reminder-tree",

    poseId:
      "tree-pose",

    type:
      "movement",

    image:
      treeGif,

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
    id:
      "reminder-bow",

    poseId:
      "bow-pose",

    type:
      "movement",

    image:
      bowGif,

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
    id:
      "reminder-triangle",

    poseId:
      "triangle-pose",

    type:
      "movement",

    image:
      triangleGif,

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
    id:
      "reminder-warrior-three",

    poseId:
      "warrior-three",

    type:
      "movement",

    image:
      warriorGif,

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
    id:
      "reminder-extended-side-angle",

    poseId:
      "extended-side-angle",

    type:
      "movement",

    image:
      extendedSideAngleGif,

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
    id:
      "reminder-surya-namaskar",

    poseId:
      "surya-namaskar",

    type:
      "movement",

    image:
      suryaGif,

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
    id:
      "reminder-half-moon",

    poseId:
      "half-moon-pose",

    type:
      "movement",

    image:
      halfMoonGif,

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
// 25 HYDRATION BENEFITS / TIPS
//
// They rotate in order so the user sees a different one each
// time before the list starts again.
// ============================================================

const HYDRATION_BENEFITS = [
  "Keep your water bottle nearby and sip regularly.",

  "Staying hydrated helps your body maintain normal fluid balance.",

  "Regular water intake supports normal concentration and alertness.",

  "Hydration supports normal physical performance during daily activity.",

  "Drinking water regularly can help replace fluid lost through breathing and perspiration.",

  "Good hydration supports the normal transport of nutrients around the body.",

  "Water helps support normal digestion and everyday digestive function.",

  "Staying hydrated supports normal temperature regulation.",

  "Regular hydration helps keep your mouth and throat from feeling dry.",

  "Water supports normal kidney function and the body’s natural waste-removal processes.",

  "Taking a water break is also a useful moment to relax your eyes from the screen.",

  "Small, regular sips can be easier to maintain than waiting until you feel very thirsty.",

  "Hydration supports normal joint lubrication during everyday movement.",

  "Water supports normal blood volume and circulation.",

  "A regular drinking routine can make it easier to remember hydration during busy work periods.",

  "Keeping water visible on your desk can be a simple reminder to drink regularly.",

  "Hydration supports normal muscle function during movement and exercise.",

  "Drinking water with meals can contribute to your overall daily fluid intake.",

  "A short water break can give you a natural pause between focused tasks.",

  "Hydration needs can increase in warm environments or during physical activity.",

  "Regular fluid intake supports normal skin hydration from within.",

  "Water is a simple zero-calorie choice for maintaining everyday hydration.",

  "If you have been speaking for a long time, a few sips of water can help relieve a dry mouth.",

  "Building hydration into your routine can help prevent long periods without drinking.",

  "A consistent hydration habit supports overall day-to-day wellbeing.",
];


// ============================================================
// GENERIC TIMESTAMP HELPERS
// ============================================================

function readTimestamp(
  key
) {
  const raw =
    sessionStorage.getItem(
      key
    );


  const value =
    Number(
      raw
    );


  if (
    !Number.isFinite(
      value
    ) ||
    value <= 0
  ) {
    return null;
  }


  return value;
}


function saveTimestamp(
  key,
  timestamp
) {
  sessionStorage.setItem(
    key,
    String(
      timestamp
    )
  );
}


function createNextTimestamp(
  delay
) {
  return (
    Date.now() +
    delay
  );
}


// ============================================================
// MOVEMENT SNOOZE
// ============================================================

function getRandomMovementSnoozeDelay() {
  return (
    Math.floor(
      Math.random() *
        (
          MOVEMENT_SNOOZE_MAX_MS -
          MOVEMENT_SNOOZE_MIN_MS +
          1
        )
    ) +
    MOVEMENT_SNOOZE_MIN_MS
  );
}


// ============================================================
// RANDOM YOGA POSE
// Prevent last 4 poses from repeating
// ============================================================

function chooseRandomMovementReminder() {
  if (
    !MOVEMENT_REMINDERS.length
  ) {
    return null;
  }


  let recentIds =
    [];


  try {
    const stored =
      sessionStorage.getItem(
        RECENT_REMINDERS_KEY
      );


    recentIds =
      stored
        ? JSON.parse(
            stored
          )
        : [];


    if (
      !Array.isArray(
        recentIds
      )
    ) {
      recentIds =
        [];
    }
  } catch {
    recentIds =
      [];
  }


  let candidates =
    MOVEMENT_REMINDERS.filter(
      (item) =>
        !recentIds.includes(
          item.id
        )
    );


  if (
    !candidates.length
  ) {
    candidates =
      MOVEMENT_REMINDERS;

    recentIds =
      [];
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
        id !==
        selected.id
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
// HYDRATION BENEFIT ROTATION
// ============================================================

function getNextHydrationBenefit() {
  const rawIndex =
    Number(
      sessionStorage.getItem(
        HYDRATION_BENEFIT_INDEX_KEY
      )
    );


  const safeIndex =
    Number.isInteger(
      rawIndex
    ) &&
    rawIndex >= 0
      ? rawIndex %
        HYDRATION_BENEFITS.length
      : 0;


  const benefit =
    HYDRATION_BENEFITS[
      safeIndex
    ];


  const nextIndex =
    (
      safeIndex +
      1
    ) %
    HYDRATION_BENEFITS.length;


  sessionStorage.setItem(
    HYDRATION_BENEFIT_INDEX_KEY,
    String(
      nextIndex
    )
  );


  return benefit;
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
  ] = useState(
    false
  );


  const [
    imageOrientation,
    setImageOrientation,
  ] = useState(
    "normal"
  );


  const [
    activeReminder,
    setActiveReminder,
  ] = useState(
    null
  );


  const [
    scheduleVersion,
    setScheduleVersion,
  ] = useState(
    0
  );


  const token =
    getStoredToken?.();


  const authenticated =
    Boolean(
      token
    );


  // ==========================================================
  // OPEN MOVEMENT REMINDER
  // ==========================================================

  const showMovementReminder =
    useCallback(() => {
      const reminder =
        chooseRandomMovementReminder();


      if (
        !reminder
      ) {
        return;
      }


      setImageOrientation(
        "normal"
      );


      setActiveReminder(
        reminder
      );


      setIsOpen(
        true
      );
    }, []);


  // ==========================================================
  // OPEN HYDRATION REMINDER
  // ==========================================================

  const showHydrationReminder =
    useCallback(() => {
      setImageOrientation(
        "normal"
      );


      setActiveReminder({
        id:
          "hydration-reminder",

        type:
          "hydration",

        image:
          hydrationGif,

        title:
          "Time for a water break?",

        description:
          "You’ve been focused for a while. Take a moment to pause and drink some water.",

        tip:
          getNextHydrationBenefit(),

        actionLabel:
          "I’ve had some water",
      });


      setIsOpen(
        true
      );
    }, []);


  // ==========================================================
  // CLOSE CURRENT POPUP + FORCE TIMER RECALCULATION
  // ==========================================================

  const dismissPopup =
    useCallback(() => {
      setIsOpen(
        false
      );


      setActiveReminder(
        null
      );


      setScheduleVersion(
        (current) =>
          current +
          1
      );
    }, []);


  // ==========================================================
  // SCHEDULE NEXT MOVEMENT REMINDER
  // ==========================================================

  const scheduleNextMovement =
    useCallback(
      (delay) => {
        saveTimestamp(
          NEXT_MOVEMENT_REMINDER_KEY,

          createNextTimestamp(
            delay
          )
        );


        dismissPopup();
      },
      [
        dismissPopup,
      ]
    );


  // ==========================================================
  // SCHEDULE NEXT HYDRATION REMINDER
  // ==========================================================

  const scheduleNextHydration =
    useCallback(
      (delay) => {
        saveTimestamp(
          NEXT_HYDRATION_REMINDER_KEY,

          createNextTimestamp(
            delay
          )
        );


        dismissPopup();
      },
      [
        dismissPopup,
      ]
    );


  // ==========================================================
  // COMBINED TIMER ENGINE
  //
  // Movement and hydration each keep their OWN timestamp.
  // Only one modal is shown at a time.
  // If both become due, the oldest due reminder is shown first.
  // The other remains due and appears after the first is closed.
  // ==========================================================

  useEffect(() => {
    if (
      !authenticated
    ) {
      setIsOpen(
        false
      );


      setActiveReminder(
        null
      );


      sessionStorage.removeItem(
        NEXT_MOVEMENT_REMINDER_KEY
      );


      sessionStorage.removeItem(
        NEXT_HYDRATION_REMINDER_KEY
      );


      sessionStorage.removeItem(
        RECENT_REMINDERS_KEY
      );


      return undefined;
    }


    /*
      Never place one reminder
      on top of another.
    */
    if (
      isOpen
    ) {
      return undefined;
    }


    let nextMovementTimestamp =
      readTimestamp(
        NEXT_MOVEMENT_REMINDER_KEY
      );


    let nextHydrationTimestamp =
      readTimestamp(
        NEXT_HYDRATION_REMINDER_KEY
      );


    /*
      First movement reminder:
      50 minutes from now.
    */
    if (
      !nextMovementTimestamp
    ) {
      nextMovementTimestamp =
        createNextTimestamp(
          MOVEMENT_REMINDER_MS
        );


      saveTimestamp(
        NEXT_MOVEMENT_REMINDER_KEY,
        nextMovementTimestamp
      );
    }


    /*
      First hydration reminder:
      60 minutes from now.
    */
    if (
      !nextHydrationTimestamp
    ) {
      nextHydrationTimestamp =
        createNextTimestamp(
          HYDRATION_REMINDER_MS
        );


      saveTimestamp(
        NEXT_HYDRATION_REMINDER_KEY,
        nextHydrationTimestamp
      );
    }


    let timerId =
      null;


    function checkReminderTime() {
      const now =
        Date.now();


      const movementNext =
        readTimestamp(
          NEXT_MOVEMENT_REMINDER_KEY
        );


      const hydrationNext =
        readTimestamp(
          NEXT_HYDRATION_REMINDER_KEY
        );


      const dueReminders =
        [];


      if (
        movementNext &&
        now >=
          movementNext
      ) {
        dueReminders.push({
          type:
            "movement",

          timestamp:
            movementNext,
        });
      }


      if (
        hydrationNext &&
        now >=
          hydrationNext
      ) {
        dueReminders.push({
          type:
            "hydration",

          timestamp:
            hydrationNext,
        });
      }


      if (
        !dueReminders.length
      ) {
        return false;
      }


      dueReminders.sort(
        (
          first,
          second
        ) =>
          first.timestamp -
          second.timestamp
      );


      const nextDue =
        dueReminders[
          0
        ];


      if (
        nextDue.type ===
        "hydration"
      ) {
        showHydrationReminder();
      } else {
        showMovementReminder();
      }


      return true;
    }


    /*
      Browser may have been hidden,
      sleeping, or returned from another tab.
    */
    if (
      checkReminderTime()
    ) {
      return undefined;
    }


    const currentMovement =
      readTimestamp(
        NEXT_MOVEMENT_REMINDER_KEY
      );


    const currentHydration =
      readTimestamp(
        NEXT_HYDRATION_REMINDER_KEY
      );


    const nextTimestamp =
      Math.min(
        currentMovement ||
          Number.POSITIVE_INFINITY,

        currentHydration ||
          Number.POSITIVE_INFINITY
      );


    if (
      Number.isFinite(
        nextTimestamp
      )
    ) {
      const remainingTime =
        Math.max(
          0,

          nextTimestamp -
            Date.now()
        );


      timerId =
        window.setTimeout(
          () => {
            checkReminderTime();
          },

          remainingTime
        );
    }


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
      if (
        timerId
      ) {
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
    showHydrationReminder,
    showMovementReminder,
  ]);


  // ==========================================================
  // X BUTTON
  //
  // Movement -> next one in 50 minutes
  // Hydration -> next one in 60 minutes
  // ==========================================================

  const handleClose =
    useCallback(() => {
      if (
        activeReminder?.type ===
        "hydration"
      ) {
        scheduleNextHydration(
          HYDRATION_REMINDER_MS
        );

        return;
      }


      scheduleNextMovement(
        MOVEMENT_REMINDER_MS
      );
    }, [
      activeReminder,
      scheduleNextHydration,
      scheduleNextMovement,
    ]);


  // ==========================================================
  // ESC KEY + BODY SCROLL
  // ==========================================================

  useEffect(() => {
    if (
      !isOpen
    ) {
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
  // ==========================================================

  function handleRemindLater() {
    if (
      activeReminder?.type ===
      "hydration"
    ) {
      scheduleNextHydration(
        HYDRATION_SNOOZE_MS
      );

      return;
    }


    scheduleNextMovement(
      getRandomMovementSnoozeDelay()
    );
  }


  // ==========================================================
  // PRIMARY ACTION
  //
  // Movement:
  // go directly to the matching yoga pose.
  //
  // Hydration:
  // acknowledge water and schedule the next hydration
  // reminder for one hour later.
  // ==========================================================

  function handlePrimaryAction() {
    if (
      activeReminder?.type ===
      "hydration"
    ) {
      scheduleNextHydration(
        HYDRATION_REMINDER_MS
      );

      return;
    }


    if (
      !activeReminder?.poseId
    ) {
      return;
    }


    const poseId =
      activeReminder.poseId;


    scheduleNextMovement(
      MOVEMENT_REMINDER_MS
    );


    navigate(
      `/app/fitness?tab=yoga&pose=${encodeURIComponent(
        poseId
      )}`
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
          onClick={
            handleClose
          }
          aria-label="Close reminder"
        >
          <X
            size={28}
            strokeWidth={2}
          />
        </button>


        {/* GIF / ILLUSTRATION */}

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
              `wellness-reminder-gif wellness-reminder-gif--${imageOrientation}${
                activeReminder.type ===
                "hydration"
                  ? " wellness-reminder-gif--hydration"
                  : ""
              }`
            }

            onLoad={(event) => {
              const image =
                event.currentTarget;


              const width =
                image.naturalWidth;


              const height =
                image.naturalHeight;


              if (
                height >
                width * 1.2
              ) {
                setImageOrientation(
                  "vertical"
                );

                return;
              }


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


        {/* TIP / ROTATING HYDRATION BENEFIT */}

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
