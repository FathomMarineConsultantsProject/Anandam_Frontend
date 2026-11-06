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

import legExerciseGif from "../../assets/exercise popup/leg exercise.gif";
import legRaisingGif from "../../assets/exercise popup/leg raising.gif";
import drinkingWaterGif from "../../assets/exercise popup/man drinking water.gif";
import runningGif from "../../assets/exercise popup/running.gif";
import shoulderWorkoutGif from "../../assets/exercise popup/shoulder workout.gif";
import yoga1Gif from "../../assets/exercise popup/yoga 1.gif";
import yoga3Gif from "../../assets/exercise popup/yoga 3.gif";
import yoga4Gif from "../../assets/exercise popup/yoga 4.gif";
import yoga5Gif from "../../assets/exercise popup/yoga 5.gif";
import yoga2Gif from "../../assets/exercise popup/yyoga 2.gif";

import "../../styles/wellness-reminder.css";


// ============================================================
// TIMER SETTINGS
// ============================================================

const REGULAR_REMINDER_MS =
    50 * 60 * 1000;
// 10 * 1000;

const SNOOZE_REMINDER_MS =
    10 * 60 * 1000;
//   5 * 1000;


/*
  sessionStorage is intentional.

  This means:

  - route changes DO NOT reset the timer
  - refreshing the page DOES NOT reset the timer
  - closing the browser tab DOES reset the timer

  This matches the idea of a reminder while the current
  Anandam session is open.
*/

const NEXT_REMINDER_KEY =
    "anandam:wellness-reminder:next-at";

const RECENT_REMINDERS_KEY =
    "anandam:wellness-reminder:recent-ids";

const RECENT_REMINDER_LIMIT = 4;


// ============================================================
// REMINDER VARIANTS
// ============================================================

const REMINDERS = [
    // ----------------------------------------------------------
    // MOVEMENT
    // ----------------------------------------------------------

    {
        id: "movement-leg-exercise",
        type: "movement",
        image: legExerciseGif,

        title:
            "Time for a quick movement break?",

        description:
            "You’ve been focused for nearly 50 minutes. A short movement break can help you reset before continuing.",

        tip:
            "Take 2 minutes to stretch, move, or try a quick exercise.",

        actionLabel:
            "Start a quick exercise",

        actionType: "fitness",
    },

    {
        id: "movement-leg-raising",
        type: "movement",
        image: legRaisingGif,

        title:
            "Time for a quick movement break?",

        description:
            "You’ve been focused for nearly 50 minutes. A short movement break can help you reset before continuing.",

        tip:
            "Take 2 minutes to stretch, move, or try a quick exercise.",

        actionLabel:
            "Start a quick exercise",

        actionType: "fitness",
    },

    {
        id: "movement-running",
        type: "movement",
        image: runningGif,

        title:
            "Time for a quick movement break?",

        description:
            "You’ve been focused for nearly 50 minutes. A short movement break can help you reset before continuing.",

        tip:
            "Take 2 minutes to stretch, move, or try a quick exercise.",

        actionLabel:
            "Start a quick exercise",

        actionType: "fitness",
    },

    {
        id: "movement-shoulder",
        type: "movement",
        image: shoulderWorkoutGif,

        title:
            "Time for a quick movement break?",

        description:
            "You’ve been focused for nearly 50 minutes. A short movement break can help you reset before continuing.",

        tip:
            "Take 2 minutes to stretch, move, or try a quick exercise.",

        actionLabel:
            "Start a quick exercise",

        actionType: "fitness",
    },


    // ----------------------------------------------------------
    // WATER
    // ----------------------------------------------------------

    {
        id: "water-break",
        type: "water",
        image: drinkingWaterGif,

        title:
            "Time for a water break?",

        description:
            "You’ve been focused for a while. Take a moment to pause and drink some water.",

        tip:
            "Keep your water bottle nearby and sip regularly.",

        actionLabel:
            "I’ve had some water",

        actionType: "water",
    },


    // ----------------------------------------------------------
    // YOGA
    // ----------------------------------------------------------

    {
        id: "yoga-1",
        type: "yoga",
        image: yoga1Gif,

        title:
            "Time for a little yoga?",

        description:
            "You’ve been focused for nearly 50 minutes. Take a short yoga break to stretch, breathe, and unwind.",

        tip:
            "Take 2 minutes for a gentle yoga session.",

        actionLabel:
            "Start yoga",

        actionType: "fitness",
    },

    {
        id: "yoga-2",
        type: "yoga",
        image: yoga2Gif,

        title:
            "Time for a little yoga?",

        description:
            "You’ve been focused for nearly 50 minutes. Take a short yoga break to stretch, breathe, and unwind.",

        tip:
            "Take 2 minutes for a gentle yoga session.",

        actionLabel:
            "Start yoga",

        actionType: "fitness",
    },

    {
        id: "yoga-3",
        type: "yoga",
        image: yoga3Gif,

        title:
            "Time for a little yoga?",

        description:
            "You’ve been focused for nearly 50 minutes. Take a short yoga break to stretch, breathe, and unwind.",

        tip:
            "Take 2 minutes for a gentle yoga session.",

        actionLabel:
            "Start yoga",

        actionType: "fitness",
    },

    {
        id: "yoga-4",
        type: "yoga",
        image: yoga4Gif,

        title:
            "Time for a little yoga?",

        description:
            "You’ve been focused for nearly 50 minutes. Take a short yoga break to stretch, breathe, and unwind.",

        tip:
            "Take 2 minutes for a gentle yoga session.",

        actionLabel:
            "Start yoga",

        actionType: "fitness",
    },

    {
        id: "yoga-5",
        type: "yoga",
        image: yoga5Gif,

        title:
            "Time for a little yoga?",

        description:
            "You’ve been focused for nearly 50 minutes. Take a short yoga break to stretch, breathe, and unwind.",

        tip:
            "Take 2 minutes for a gentle yoga session.",

        actionLabel:
            "Start yoga",

        actionType: "fitness",
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


function saveTimestamp(timestamp) {
    sessionStorage.setItem(
        NEXT_REMINDER_KEY,
        String(timestamp)
    );
}


function createNextTimestamp(delay) {
    return Date.now() + delay;
}


/*
  Choose a random reminder while avoiding the exact same
  GIF twice in a row when possible.
*/
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

        recentIds = stored
            ? JSON.parse(stored)
            : [];

        if (!Array.isArray(recentIds)) {
            recentIds = [];
        }
    } catch {
        recentIds = [];
    }

    /*
      Do not show any of the last 4 reminders again.
    */
    let candidates =
        REMINDERS.filter(
            (item) =>
                !recentIds.includes(
                    item.id
                )
        );

    /*
      Safety fallback.
  
      If for some reason every reminder
      is currently excluded, allow them again.
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
        candidates[randomIndex];

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

    const [isOpen, setIsOpen] =
        useState(false);

    const [
        imageOrientation,
        setImageOrientation,
    ] = useState("normal");

    const [
        activeReminder,
        setActiveReminder,
    ] = useState(null);

    /*
      Incrementing this forces the timer effect
      to create the newly scheduled timer.
    */
    const [
        scheduleVersion,
        setScheduleVersion,
    ] = useState(0);


    const token =
        getStoredToken?.();

    const authenticated =
        Boolean(token);


    // ==========================================================
    // SHOW REMINDER
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
    // SCHEDULE NEXT REMINDER
    // ==========================================================

    const scheduleNext =
        useCallback((delay) => {
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
        }, []);


    // ==========================================================
    // MAIN TIMER
    // ==========================================================

    useEffect(() => {
        /*
          User isn't logged in.
    
          Do not run wellbeing reminders on login/signup/public
          sessions.
        */
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
          While the popup itself is displayed, don't create
          another countdown underneath it.
        */
        if (isOpen) {
            return undefined;
        }


        let nextTimestamp =
            readTimestamp();


        /*
          First authenticated visit in this browser-tab session.
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
          If browser was suspended/backgrounded and the scheduled
          time has already passed, show immediately.
        */
        if (checkReminderTime()) {
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


        /*
          Browsers can throttle timers in hidden tabs.
    
          Therefore when the user returns to Anandam,
          compare the actual timestamp again.
        */
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
    // CLOSE / ESCAPE / BODY SCROLL
    // ==========================================================

    const handleClose =
        useCallback(() => {
            /*
              X means dismiss this reminder.
      
              The normal 50-minute interval starts again.
            */
            scheduleNext(
                REGULAR_REMINDER_MS
            );
        }, [scheduleNext]);


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
                event.key === "Escape"
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
        scheduleNext(
            SNOOZE_REMINDER_MS
        );
    }


    // ==========================================================
    // PRIMARY BUTTON
    // ==========================================================

    function handlePrimaryAction() {
        if (!activeReminder) {
            return;
        }


        /*
          User acknowledged the reminder.
    
          Start another normal 50-minute cycle.
        */
        scheduleNext(
            REGULAR_REMINDER_MS
        );


        /*
          Water reminder doesn't need navigation.
        */
        if (
            activeReminder.actionType ===
            "water"
        ) {
            return;
        }


        /*
          Movement + Yoga -> Fitness page.
        */
        navigate(
            "/app/fitness"
        );
    }


    // ==========================================================
    // NOTHING TO DISPLAY
    // ==========================================================

    if (
        !authenticated ||
        !isOpen ||
        !activeReminder
    ) {
        return null;
    }


    // ==========================================================
    // PORTAL
    //
    // Rendering directly under document.body prevents the
    // popup from being affected by AppLayout/sidebar/page
    // positioning or overflow.
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


                {/* GIF */}

                <div className="wellness-reminder-visual">
                    <img
                        key={activeReminder.id}
                        src={activeReminder.image}
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
                    {activeReminder.title}
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
                    {activeReminder.tip}
                </div>


                {/* ACTIONS */}

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