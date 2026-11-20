import {
  useCallback,
  useEffect,
  useMemo,
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
  BriefcaseBusiness,
  Check,
  Clock3,
  MapPin,
  X,
} from "lucide-react";

import {
  clockInToWork,
  clockOutOfWork,
  getActiveWorkSession,
  getWorkRestDay,
  getWorkRestErrorMessage,
  updateWorkRestSlots,
} from "../../api/workRestApi";

import {
  getStoredAuthUser,
} from "../../api/authApi";

import {
  getStoredToken,
  hasCompletedMoodGate,
} from "../../utils/storage";

import {
  WORK_REST_PROMPT_EVENT,
  releaseReminder,
  tryAcquireReminder,
} from "../../utils/reminderCoordinator";

import "../../styles/work-rest-reminder.css";


// ============================================================
// SETTINGS
// ============================================================

const IDLE_REMINDER_MS =
  60 * 60 * 1000;

const BLOCKED_RETRY_MS =
  60 * 1000;

const MINUTES_PER_SLOT = 30;

const WORK_REST_REMINDER_OWNER =
  "work-rest";

const SHIP_LOCATIONS = [
  "Bridge (Navigation)",
  "Engine Room",
  "Main Deck",
  "Galley",
  "Cargo Hold",
  "Crew Quarters",
  "Medical Bay",
  "Accommodation",
];

const PUBLIC_OR_GATE_PATHS = [
  "/",
  "/login",
  "/signup",
  "/forgot-password",
  "/mood-quick",
  "/practitioner/onboarding",
];


// ============================================================
// DATE / TIME HELPERS
// ============================================================

function getLocalDateKey(
  date = new Date()
) {
  const year =
    date.getFullYear();

  const month =
    String(
      date.getMonth() + 1
    ).padStart(2, "0");

  const day =
    String(
      date.getDate()
    ).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function formatTime(value) {
  const date =
    value instanceof Date
      ? value
      : new Date(value);

  if (
    Number.isNaN(
      date.getTime()
    )
  ) {
    return "—";
  }

  return date.toLocaleTimeString(
    "en-US",
    {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    }
  );
}

function formatPlannedOption(
  timestamp,
  now = new Date()
) {
  const date =
    new Date(timestamp);

  const sameDay =
    getLocalDateKey(date) ===
    getLocalDateKey(now);

  if (sameDay) {
    return formatTime(date);
  }

  return `Tomorrow, ${formatTime(
    date
  )}`;
}

function buildPlannedUntilOptions(
  now = new Date()
) {
  const first =
    new Date(now);

  first.setSeconds(0, 0);

  const minutes =
    first.getMinutes();

  const nextBoundary =
    minutes < 30 ? 30 : 60;

  first.setMinutes(
    nextBoundary
  );

  return Array.from(
    {
      length: 24,
    },
    (_, index) => {
      const date =
        new Date(
          first.getTime() +
            index *
              MINUTES_PER_SLOT *
              60 *
              1000
        );

      return {
        value: date.getTime(),
        label:
          formatPlannedOption(
            date.getTime(),
            now
          ),
      };
    }
  );
}

function getCompletedBoundaryIndex(
  now = new Date()
) {
  return Math.floor(
    (
      now.getHours() * 60 +
      now.getMinutes()
    ) /
      MINUTES_PER_SLOT
  );
}

function getSlotIndex(
  date
) {
  return Math.floor(
    (
      date.getHours() * 60 +
      date.getMinutes()
    ) /
      MINUTES_PER_SLOT
  );
}


// ============================================================
// LOCAL REMINDER STATE
// Backend remains the source of truth for actual work sessions.
// This local state stores only reminder scheduling information.
// ============================================================

function safeUserKey(user) {
  return encodeURIComponent(
    String(
      user?.id ??
        user?.userId ??
        user?.email ??
        "current-user"
    )
  );
}

function buildStorageKey(
  user,
  dateKey
) {
  return (
    "anandam:work-rest-reminder:" +
    safeUserKey(user) +
    ":" +
    dateKey
  );
}

function createDefaultState(
  dateKey
) {
  return {
    date: dateKey,
    firstPromptHandled: false,
    plannedUntil: null,
    nextPromptAt: null,
    restSinceAt: null,
  };
}

function readReminderState(
  storageKey,
  dateKey
) {
  try {
    const raw =
      localStorage.getItem(
        storageKey
      );

    if (!raw) {
      return createDefaultState(
        dateKey
      );
    }

    const parsed =
      JSON.parse(raw);

    if (
      !parsed ||
      parsed.date !== dateKey
    ) {
      return createDefaultState(
        dateKey
      );
    }

    return {
      ...createDefaultState(
        dateKey
      ),
      ...parsed,
    };
  } catch {
    return createDefaultState(
      dateKey
    );
  }
}

function saveReminderState(
  storageKey,
  state
) {
  localStorage.setItem(
    storageKey,
    JSON.stringify(state)
  );

  return state;
}

function isEligiblePath(pathname) {
  if (
    pathname.startsWith(
      "/blog/"
    )
  ) {
    return false;
  }

  return !PUBLIC_OR_GATE_PATHS.includes(
    pathname
  );
}


// ============================================================
// COMPONENT
// ============================================================

export default function WorkRestReminder() {
  const location =
    useLocation();

  const navigate =
    useNavigate();

  const user =
    getStoredAuthUser?.();

  const token =
    getStoredToken?.();

  const authenticated =
    Boolean(token);

  const normalUser =
    user?.role !== "PRACTITIONER";

  const todayKey =
    getLocalDateKey();

  const storageKey =
    buildStorageKey(
      user,
      todayKey
    );

  const [
    isOpen,
    setIsOpen,
  ] = useState(false);

  const [
    promptMode,
    setPromptMode,
  ] = useState("start");

  const [
    activeSession,
    setActiveSession,
  ] = useState(null);

  const [
    workLocation,
    setWorkLocation,
  ] = useState("");

  const [
    customWorkLocation,
    setCustomWorkLocation,
  ] = useState("");

  const [
    plannedUntil,
    setPlannedUntil,
  ] = useState("");

  const [
    extending,
    setExtending,
  ] = useState(false);

  const [
    saving,
    setSaving,
  ] = useState(false);

  const [
    error,
    setError,
  ] = useState("");

  const [
    scheduleVersion,
    setScheduleVersion,
  ] = useState(0);

  const plannedOptions =
    useMemo(
      () =>
        buildPlannedUntilOptions(
          new Date()
        ),
      [isOpen, promptMode, extending]
    );

  const resolvedLocation =
    workLocation === "Other"
      ? customWorkLocation.trim()
      : workLocation.trim();

  const eligible =
    authenticated &&
    normalUser &&
    isEligiblePath(
      location.pathname
    ) &&
    hasCompletedMoodGate();


  // ==========================================================
  // MODAL LOCK
  // Prevent Work/Rest and Wellness reminders from stacking.
  // ==========================================================

  const closeVisualOnly =
    useCallback(() => {
      releaseReminder(
        WORK_REST_REMINDER_OWNER
      );

      setIsOpen(false);
      setExtending(false);
      setError("");
    }, []);

  const openPrompt =
    useCallback(
      (mode, session = null) => {
        if (
          !tryAcquireReminder(
            WORK_REST_REMINDER_OWNER
          )
        ) {
          return false;
        }

        setPromptMode(mode);
        setActiveSession(
          session || null
        );
        setExtending(false);
        setError("");
        setWorkLocation(
          session?.shipLocation ||
            ""
        );
        setCustomWorkLocation("");

        const options =
          buildPlannedUntilOptions(
            new Date()
          );

        setPlannedUntil(
          options[0]
            ? String(
                options[0].value
              )
            : ""
        );

        setIsOpen(true);

        return true;
      },
      []
    );


  // ==========================================================
  // REST BACKFILL
  // Only completed UNRECORDED half-hour blocks are changed.
  // Existing WORK / REST / MEAL is never overwritten.
  // ==========================================================

  const flushRestPeriod =
    useCallback(
      async (
        reminderState,
        now = new Date()
      ) => {
        const restSince =
          Number(
            reminderState
              ?.restSinceAt
          );

        if (
          !Number.isFinite(
            restSince
          ) ||
          restSince <= 0
        ) {
          return;
        }

        const restStart =
          new Date(restSince);

        if (
          getLocalDateKey(
            restStart
          ) !== todayKey
        ) {
          return;
        }

        const day =
          await getWorkRestDay(
            todayKey
          );

        const blocks =
          Array.isArray(
            day?.statusBlocks
          )
            ? day.statusBlocks
            : [];

        const startIndex =
          Math.max(
            0,
            Math.min(
              47,
              getSlotIndex(
                restStart
              )
            )
          );

        const completedBoundary =
          Math.max(
            0,
            Math.min(
              48,
              getCompletedBoundaryIndex(
                now
              )
            )
          );

        if (
          completedBoundary <=
          startIndex
        ) {
          return;
        }

        const updates = [];

        for (
          let index = startIndex;
          index <
          completedBoundary;
          index += 1
        ) {
          if (
            String(
              blocks[index] ||
                "UNRECORDED"
            ).toUpperCase() ===
            "UNRECORDED"
          ) {
            updates.push({
              slotIndex: index,
              status: "REST",
            });
          }
        }

        if (!updates.length) {
          return;
        }

        await updateWorkRestSlots(
          todayKey,
          updates
        );
      },
      [todayKey]
    );


  // ==========================================================
  // SYNCHRONISE WITH BACKEND + SCHEDULE NEXT PROMPT
  // ==========================================================

  useEffect(() => {
    if (!eligible) {
      closeVisualOnly();
      return undefined;
    }

    if (isOpen) {
      return undefined;
    }

    let cancelled = false;
    let timerId = null;
    let syncing = false;

    function scheduleSyncAt(
      timestamp
    ) {
      if (timerId) {
        window.clearTimeout(
          timerId
        );
      }

      const delay =
        Math.max(
          0,
          timestamp - Date.now()
        );

      timerId =
        window.setTimeout(
          () => {
            synchronise();
          },
          delay
        );
    }

    async function synchronise() {
      if (
        cancelled ||
        syncing
      ) {
        return;
      }

      syncing = true;

      try {
        const now =
          new Date();

        const reminderState =
          readReminderState(
            storageKey,
            todayKey
          );

        const session =
          await getActiveWorkSession();

        if (cancelled) {
          return;
        }

        setActiveSession(
          session || null
        );

        // -----------------------------------------------
        // ACTIVE WORK SESSION
        // -----------------------------------------------

        if (session?.id) {
          let dueAt =
            Number(
              reminderState
                .plannedUntil
            );

          if (
            !Number.isFinite(
              dueAt
            ) ||
            dueAt <= 0
          ) {
            const startedAt =
              new Date(
                session.startedAt
              );

            dueAt =
              startedAt.getTime() +
              IDLE_REMINDER_MS;

            saveReminderState(
              storageKey,
              {
                ...reminderState,
                firstPromptHandled:
                  true,
                plannedUntil:
                  dueAt,
                nextPromptAt:
                  null,
                restSinceAt:
                  null,
              }
            );
          }

          if (
            dueAt <= Date.now()
          ) {
            const opened =
              openPrompt(
                "confirm",
                session
              );

            if (!opened) {
              scheduleSyncAt(
                Date.now() +
                  BLOCKED_RETRY_MS
              );
            }

            return;
          }

          scheduleSyncAt(
            dueAt
          );

          return;
        }

        // -----------------------------------------------
        // NO ACTIVE SESSION
        // -----------------------------------------------

        if (
          !reminderState
            .firstPromptHandled
        ) {
          const opened =
            openPrompt(
              "start",
              null
            );

          if (!opened) {
            scheduleSyncAt(
              Date.now() +
                BLOCKED_RETRY_MS
            );
          }

          return;
        }

        let nextPromptAt =
          Number(
            reminderState
              .nextPromptAt
          );

        if (
          !Number.isFinite(
            nextPromptAt
          ) ||
          nextPromptAt <= 0
        ) {
          nextPromptAt =
            Date.now() +
            IDLE_REMINDER_MS;

          saveReminderState(
            storageKey,
            {
              ...reminderState,
              plannedUntil: null,
              nextPromptAt,
              restSinceAt:
                reminderState
                  .restSinceAt ||
                Date.now(),
            }
          );
        }

        if (
          nextPromptAt <=
          Date.now()
        ) {
          try {
            await flushRestPeriod(
              reminderState,
              now
            );
          } catch (restError) {
            console.error(
              "Unable to backfill rest before reminder:",
              restError
            );
          }

          if (cancelled) {
            return;
          }

          const opened =
            openPrompt(
              "start",
              null
            );

          if (!opened) {
            scheduleSyncAt(
              Date.now() +
                BLOCKED_RETRY_MS
            );
          }

          return;
        }

        scheduleSyncAt(
          nextPromptAt
        );
      } catch (syncError) {
        console.error(
          "Work/Rest reminder sync failed:",
          syncError
        );

        scheduleSyncAt(
          Date.now() +
            BLOCKED_RETRY_MS
        );
      } finally {
        syncing = false;
      }
    }

    function handleWindowFocus() {
      synchronise();
    }

    function handleVisibilityChange() {
      if (
        document.visibilityState ===
        "visible"
      ) {
        synchronise();
      }
    }

    synchronise();

    window.addEventListener(
      "focus",
      handleWindowFocus
    );

    document.addEventListener(
      "visibilitychange",
      handleVisibilityChange
    );

    return () => {
      cancelled = true;

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
    closeVisualOnly,
    eligible,
    flushRestPeriod,
    isOpen,
    location.pathname,
    openPrompt,
    scheduleVersion,
    storageKey,
    todayKey,
  ]);


  // ==========================================================
  // FULL MOOD CHECK-IN EVENT
  // The quick login mood gate is handled automatically when
  // /mood-quick redirects to /dashboard and hasCompletedMoodGate()
  // becomes true.
  // ==========================================================

  useEffect(() => {
    function handleMoodCompleted() {
      setScheduleVersion(
        (value) => value + 1
      );
    }

    window.addEventListener(
      WORK_REST_PROMPT_EVENT,
      handleMoodCompleted
    );

    return () => {
      window.removeEventListener(
        WORK_REST_PROMPT_EVENT,
        handleMoodCompleted
      );
    };
  }, []);


  // ==========================================================
  // CLEANUP GLOBAL REMINDER LOCK
  // ==========================================================

  useEffect(
    () => () => {
      releaseReminder(
        WORK_REST_REMINDER_OWNER
      );
    },
    []
  );


  // ==========================================================
  // CLOSE / IDLE
  // Start prompt X = not working right now.
  // Confirm prompt X = stop current work session.
  // ==========================================================

  const handleIdle =
    useCallback(
      async () => {
        if (saving) {
          return;
        }

        setSaving(true);
        setError("");

        try {
          const now =
            new Date();

          const reminderState =
            readReminderState(
              storageKey,
              todayKey
            );

          try {
            await flushRestPeriod(
              reminderState,
              now
            );
          } catch (restError) {
            console.error(
              "Unable to update previous rest blocks:",
              restError
            );
          }

          saveReminderState(
            storageKey,
            {
              ...reminderState,
              firstPromptHandled:
                true,
              plannedUntil:
                null,
              nextPromptAt:
                now.getTime() +
                IDLE_REMINDER_MS,
              restSinceAt:
                reminderState
                  .restSinceAt ||
                now.getTime(),
            }
          );

          closeVisualOnly();

          setScheduleVersion(
            (value) => value + 1
          );
        } finally {
          setSaving(false);
        }
      },
      [
        closeVisualOnly,
        flushRestPeriod,
        saving,
        storageKey,
        todayKey,
      ]
    );

  const handleStopWorking =
    useCallback(
      async () => {
        if (saving) {
          return;
        }

        setSaving(true);
        setError("");

        try {
          await clockOutOfWork();

          const now =
            new Date();

          const reminderState =
            readReminderState(
              storageKey,
              todayKey
            );

          saveReminderState(
            storageKey,
            {
              ...reminderState,
              firstPromptHandled:
                true,
              plannedUntil:
                null,
              nextPromptAt:
                now.getTime() +
                IDLE_REMINDER_MS,
              restSinceAt:
                now.getTime(),
            }
          );

          setActiveSession(null);
          closeVisualOnly();

          setScheduleVersion(
            (value) => value + 1
          );
        } catch (stopError) {
          console.error(
            "Work/Rest clock-out failed:",
            stopError
          );

          setError(
            getWorkRestErrorMessage(
              stopError,
              "clock-out"
            )
          );
        } finally {
          setSaving(false);
        }
      },
      [
        closeVisualOnly,
        saving,
        storageKey,
        todayKey,
      ]
    );

  const handleClose =
    useCallback(() => {
      if (
        promptMode ===
        "confirm"
      ) {
        handleStopWorking();
        return;
      }

      handleIdle();
    }, [
      handleIdle,
      handleStopWorking,
      promptMode,
    ]);


  // ==========================================================
  // START WORK
  // ==========================================================

  async function handleStartWork() {
    if (
      saving ||
      !resolvedLocation ||
      !plannedUntil
    ) {
      return;
    }

    const dueAt =
      Number(plannedUntil);

    if (
      !Number.isFinite(dueAt) ||
      dueAt <= Date.now()
    ) {
      setError(
        "Choose a working-until time later than the current time."
      );
      return;
    }

    setSaving(true);
    setError("");

    try {
      const now =
        new Date();

      const reminderState =
        readReminderState(
          storageKey,
          todayKey
        );

      try {
        await flushRestPeriod(
          reminderState,
          now
        );
      } catch (restError) {
        console.error(
          "Unable to update rest before clock-in:",
          restError
        );
      }

      const session =
        await clockInToWork(
          resolvedLocation
        );

      saveReminderState(
        storageKey,
        {
          ...reminderState,
          firstPromptHandled: true,
          plannedUntil: dueAt,
          nextPromptAt: null,
          restSinceAt: null,
        }
      );

      setActiveSession(
        session || null
      );

      closeVisualOnly();

      setScheduleVersion(
        (value) => value + 1
      );
    } catch (startError) {
      console.error(
        "Work/Rest clock-in failed:",
        startError
      );

      setError(
        getWorkRestErrorMessage(
          startError,
          "clock-in"
        )
      );
    } finally {
      setSaving(false);
    }
  }


  // ==========================================================
  // CONTINUE CURRENT WORK
  // ==========================================================

  function handleContinueWorking() {
    const dueAt =
      Number(plannedUntil);

    if (
      !Number.isFinite(dueAt) ||
      dueAt <= Date.now()
    ) {
      setError(
        "Choose a new working-until time later than the current time."
      );
      return;
    }

    const reminderState =
      readReminderState(
        storageKey,
        todayKey
      );

    saveReminderState(
      storageKey,
      {
        ...reminderState,
        firstPromptHandled: true,
        plannedUntil: dueAt,
        nextPromptAt: null,
        restSinceAt: null,
      }
    );

    closeVisualOnly();

    setScheduleVersion(
      (value) => value + 1
    );
  }


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

    function handleKeyDown(event) {
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
    handleClose,
    isOpen,
  ]);


  // ==========================================================
  // NOTHING TO SHOW
  // ==========================================================

  if (
    !eligible ||
    !isOpen
  ) {
    return null;
  }

  const reminderState =
    readReminderState(
      storageKey,
      todayKey
    );

  const firstPrompt =
    !reminderState
      .firstPromptHandled;

  const title =
    promptMode === "confirm"
      ? "Are you still working?"
      : firstPrompt
      ? "What are you working on?"
      : "What are you working on next?";

  const description =
    promptMode === "confirm"
      ? "You’ve reached the time you expected to finish. Update your Work & Rest record with one quick check."
      : "Keep your Work & Rest record updated while you go, without having to remember it later.";


  // ==========================================================
  // POPUP
  // ==========================================================

  return createPortal(
    <div
      className="work-rest-reminder-overlay"
      role="presentation"
    >
      <section
        className="work-rest-reminder-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="work-rest-reminder-title"
        aria-describedby="work-rest-reminder-description"
      >
        <button
          type="button"
          className="work-rest-reminder-close"
          onClick={handleClose}
          disabled={saving}
          aria-label="Close Work and Rest reminder"
        >
          <X
            size={25}
            strokeWidth={2}
          />
        </button>

        <div className="work-rest-reminder-icon">
          <BriefcaseBusiness
            size={28}
            strokeWidth={1.8}
          />
        </div>

        <h2
          id="work-rest-reminder-title"
          className="work-rest-reminder-title"
        >
          {title}
        </h2>

        <p
          id="work-rest-reminder-description"
          className="work-rest-reminder-description"
        >
          {description}
        </p>

        <div className="work-rest-reminder-divider" />

        {error ? (
          <div
            className="work-rest-reminder-message is-error"
            role="alert"
          >
            {error}
          </div>
        ) : null}

        {promptMode === "start" ? (
          <>
            <div className="work-rest-reminder-form">
              <div className="work-rest-reminder-field">
                <span className="work-rest-reminder-field__label">
                  <Clock3 size={16} />
                  Start time
                </span>

                <div className="work-rest-reminder-readonly">
                  {formatTime(
                    new Date()
                  )}
                </div>
              </div>

              <label className="work-rest-reminder-field">
                <span className="work-rest-reminder-field__label">
                  <Clock3 size={16} />
                  Working until
                </span>

                <select
                  value={plannedUntil}
                  onChange={(event) =>
                    setPlannedUntil(
                      event.target.value
                    )
                  }
                >
                  {plannedOptions.map(
                    (option) => (
                      <option
                        key={option.value}
                        value={option.value}
                      >
                        {option.label}
                      </option>
                    )
                  )}
                </select>
              </label>

              <label className="work-rest-reminder-field work-rest-reminder-field--full">
                <span className="work-rest-reminder-field__label">
                  <MapPin size={16} />
                  Work location
                </span>

                <select
                  value={workLocation}
                  onChange={(event) => {
                    const value =
                      event.target.value;

                    setWorkLocation(
                      value
                    );

                    if (
                      value !== "Other"
                    ) {
                      setCustomWorkLocation(
                        ""
                      );
                    }
                  }}
                >
                  <option value="">
                    Choose work location
                  </option>

                  {SHIP_LOCATIONS.map(
                    (place) => (
                      <option
                        key={place}
                        value={place}
                      >
                        {place}
                      </option>
                    )
                  )}

                  <option value="Other">
                    Other
                  </option>
                </select>
              </label>

              {workLocation ===
              "Other" ? (
                <label className="work-rest-reminder-field work-rest-reminder-field--full">
                  <span className="work-rest-reminder-field__label">
                    Other location
                  </span>

                  <input
                    type="text"
                    value={customWorkLocation}
                    onChange={(event) =>
                      setCustomWorkLocation(
                        event.target.value.slice(
                          0,
                          100
                        )
                      )
                    }
                    placeholder="e.g. Port office, shipyard, training centre"
                    maxLength={100}
                  />
                </label>
              ) : null}
            </div>

            <div className="work-rest-reminder-tip">
              <Check
                size={16}
                strokeWidth={2.2}
              />
              Your actual work time is saved through the same Work & Rest record used on the full page.
            </div>

            <div className="work-rest-reminder-actions">
              <button
                type="button"
                className="work-rest-reminder-button work-rest-reminder-button--secondary"
                onClick={handleIdle}
                disabled={saving}
              >
                Not working right now
              </button>

              <button
                type="button"
                className="work-rest-reminder-button work-rest-reminder-button--primary"
                onClick={handleStartWork}
                disabled={
                  saving ||
                  !resolvedLocation ||
                  !plannedUntil
                }
              >
                {saving
                  ? "Starting..."
                  : "Start work"}
              </button>
            </div>
          </>
        ) : (
          <>
            <div className="work-rest-reminder-session">
              <div>
                <span>Started</span>
                <strong>
                  {formatTime(
                    activeSession
                      ?.startedAt
                  )}
                </strong>
              </div>

              <div>
                <span>Location</span>
                <strong>
                  {activeSession
                    ?.shipLocation ||
                    "—"}
                </strong>
              </div>
            </div>

            {!extending ? (
              <div className="work-rest-reminder-actions">
                <button
                  type="button"
                  className="work-rest-reminder-button work-rest-reminder-button--secondary"
                  onClick={handleStopWorking}
                  disabled={saving}
                >
                  {saving
                    ? "Saving..."
                    : "No, I’m done"}
                </button>

                <button
                  type="button"
                  className="work-rest-reminder-button work-rest-reminder-button--primary"
                  onClick={() => {
                    setError("");
                    setExtending(true);
                  }}
                  disabled={saving}
                >
                  Yes, still working
                </button>
              </div>
            ) : (
              <>
                <label className="work-rest-reminder-field work-rest-reminder-field--extension">
                  <span className="work-rest-reminder-field__label">
                    <Clock3 size={16} />
                    Continue until
                  </span>

                  <select
                    value={plannedUntil}
                    onChange={(event) =>
                      setPlannedUntil(
                        event.target.value
                      )
                    }
                  >
                    {plannedOptions.map(
                      (option) => (
                        <option
                          key={option.value}
                          value={option.value}
                        >
                          {option.label}
                        </option>
                      )
                    )}
                  </select>
                </label>

                <div className="work-rest-reminder-actions">
                  <button
                    type="button"
                    className="work-rest-reminder-button work-rest-reminder-button--secondary"
                    onClick={() =>
                      setExtending(false)
                    }
                    disabled={saving}
                  >
                    Back
                  </button>

                  <button
                    type="button"
                    className="work-rest-reminder-button work-rest-reminder-button--primary"
                    onClick={handleContinueWorking}
                    disabled={
                      saving ||
                      !plannedUntil
                    }
                  >
                    Continue working
                  </button>
                </div>
              </>
            )}
          </>
        )}

        <button
          type="button"
          className="work-rest-reminder-record-link"
          onClick={() => {
            closeVisualOnly();
            navigate(
              "/app/work-rest"
            );
          }}
        >
          Open full Work & Rest record
        </button>
      </section>
    </div>,
    document.body
  );
}
