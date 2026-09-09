import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";

import AppLayout from "../components/layout/AppLayout";

import { getMoodPageData, submitMoodCheck } from "../api/moodApi";
import {
  completeMoodGate,
  getStoredUser,
} from "../utils/storage";

import backgroundWave from "../assets/landing/about-wave.png";

import cloverVector from "../assets/moodpage/Vector.png";
import cloverVectorOne from "../assets/moodpage/Vector (1).png";
import cloverVectorTwo from "../assets/moodpage/Vector (2).png";

import veryLowMoodImage from "../assets/moodpage/Group 81.png";
import lowMoodImage from "../assets/moodpage/Group 82.png";
import okayMoodImage from "../assets/moodpage/Group 83.png";
import goodMoodImage from "../assets/moodpage/Group 85.png";
import greatMoodImage from "../assets/moodpage/Group 86.png";

import "../styles/mood.css";

const CLOVER_DURATION_MS = 4200;
const DEFAULT_REDIRECT_MS = 1400;

const MOODS = [
  {
    value: 1,
    label: "Very low",
    image: veryLowMoodImage,
  },
  {
    value: 2,
    label: "Low",
    image: lowMoodImage,
  },
  {
    value: 3,
    label: "Okay",
    image: okayMoodImage,
  },
  {
    value: 4,
    label: "Good",
    image: goodMoodImage,
  },
  {
    value: 5,
    label: "Great",
    image: greatMoodImage,
  },
];

const CLOVER_IMAGES = [
  cloverVector,
  cloverVectorOne,
  cloverVectorTwo,
];

/*
 * Smooth snowfall-style celebration.
 * Negative delays distribute clovers vertically as soon as
 * the animation begins.
 */
const CLOVER_PARTICLES = Array.from(
  { length: 34 },
  (_, index) => {
    const pseudo = (multiplier, modulo) =>
      (index * multiplier) % modulo;

    return {
      id: index,

      image:
        CLOVER_IMAGES[
          index % CLOVER_IMAGES.length
        ],

      left: `${(index * 37 + 4) % 100}%`,

      delay: `-${(
        pseudo(19, 90) / 10
      ).toFixed(1)}s`,

      duration: `${(
        7.2 +
        pseudo(11, 34) / 10
      ).toFixed(1)}s`,

      size: `${
        28 + pseudo(13, 38)
      }px`,

      swayOne: `${
        -18 + pseudo(17, 37)
      }px`,

      swayTwo: `${
        -34 + pseudo(29, 69)
      }px`,

      swayThree: `${
        -20 + pseudo(23, 43)
      }px`,

      rotationEnd: `${
        240 + pseudo(31, 260)
      }deg`,

      opacity: `${(
        0.8 +
        pseudo(7, 18) / 100
      ).toFixed(2)}`,
    };
  }
);

function getFirstName() {
  const user = getStoredUser() || {};

  const fullName =
    user.fullName ||
    user.full_name ||
    user.name ||
    [
      user.firstName || user.first_name,
      user.lastName || user.last_name,
    ]
      .filter(Boolean)
      .join(" ") ||
    "User";

  return (
    fullName
      .trim()
      .split(/\s+/)[0] || "User"
  );
}

function resolveMoodValue(entry) {
  const rawValue =
    entry?.moodValue ??
    entry?.mood_value ??
    entry?.moodScore ??
    entry?.mood_score ??
    entry?.score ??
    entry?.value ??
    entry?.mood;

  const numericValue = Number(rawValue);

  if (
    Number.isInteger(numericValue) &&
    numericValue >= 1 &&
    numericValue <= 5
  ) {
    return numericValue;
  }

  if (typeof rawValue === "string") {
    const normalized = rawValue
      .trim()
      .toLowerCase()
      .replace(/[_-]+/g, " ");

    const labels = {
      "very low": 1,
      "very bad": 1,
      awful: 1,

      low: 2,
      bad: 2,

      okay: 3,
      ok: 3,
      neutral: 3,

      good: 4,
      happy: 4,

      great: 5,
      excellent: 5,
    };

    return labels[normalized] || 3;
  }

  return 3;
}

function resolveMoodDate(entry) {
  return (
    entry?.createdAt ||
    entry?.created_at ||
    entry?.checkedAt ||
    entry?.checked_at ||
    entry?.recordedAt ||
    entry?.recorded_at ||
    entry?.timestamp ||
    entry?.date ||
    new Date().toISOString()
  );
}

function formatMoodDate(value) {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return String(value || "-");
  }

  return new Intl.DateTimeFormat(
    "en-GB",
    {
      day: "numeric",
      month: "long",
      year: "numeric",
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    }
  )
    .format(date)
    .replace(/\bat\b/i, ",");
}

/*
 * Only icons that belong to the actual Mood content remain here.
 *
 * Header icons and navbar icons are now controlled by:
 * AppHeader.jsx
 * BottomNav.jsx
 */
function MoodIcon({
  type,
  size = 24,
}) {
  if (type === "check") {
    return (
      <svg
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        aria-hidden="true"
      >
        <circle
          cx="12"
          cy="12"
          r="9.5"
          stroke="currentColor"
          strokeWidth="1.5"
        />

        <path
          d="m7.75 12.2 2.7 2.7 5.8-6.1"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    );
  }

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
    >
      <circle
        cx="12"
        cy="12"
        r="9.5"
        stroke="currentColor"
        strokeWidth="1.4"
      />

      <path
        d="
          M8.25 10h.01
          M15.75 10h.01
          M8.4 14.25
          c.9 1.2 2.1 1.8 3.6 1.8
          1.5 0 2.7-.6 3.6-1.8
        "
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinecap="round"
      />
    </svg>
  );
}

function MoodOption({
  mood,
  selected,
  disabled,
  onSelect,
}) {
  return (
    <button
      type="button"
      className={`anandam-mood-option${
        selected ? " is-selected" : ""
      }`}
      onClick={() =>
        onSelect(mood.value)
      }
      aria-pressed={selected}
      disabled={disabled}
    >
      <img
        src={mood.image}
        alt=""
        aria-hidden="true"
        draggable="false"
      />

      <span>
        {mood.label}
      </span>
    </button>
  );
}

function MoodHistory({ history }) {
  const normalizedHistory = useMemo(
    () =>
      history.map(
        (entry, index) => {
          const value =
            resolveMoodValue(entry);

          const mood =
            MOODS.find(
              (item) =>
                item.value === value
            ) || MOODS[2];

          return {
            id:
              entry?.id ||
              entry?.moodLogId ||
              entry?.mood_log_id ||
              `${resolveMoodDate(
                entry
              )}-${index}`,

            date: formatMoodDate(
              resolveMoodDate(entry)
            ),

            mood,
          };
        }
      ),
    [history]
  );

  if (
    normalizedHistory.length === 0
  ) {
    return (
      <section
        className="anandam-mood-history-card is-empty"
        aria-labelledby="mood-history-title"
      >
        <h2
          id="mood-history-title"
          className="anandam-mood-history-card__title"
        >
          Mood History
        </h2>

        <div className="anandam-mood-history-empty">
          <div
            className="anandam-mood-history-empty__icon"
            aria-hidden="true"
          >
            <MoodIcon size={34} />
          </div>

          <h3>
            No mood check-ins yet
          </h3>

          <p>
            Your completed mood
            check-ins will appear here
          </p>
        </div>
      </section>
    );
  }

  const visibleHistory =
    normalizedHistory.slice(0, 20);

  return (
    <section
      className="anandam-mood-history-card"
      aria-labelledby="mood-history-title"
    >
      <h2
        id="mood-history-title"
        className="anandam-mood-history-card__title"
      >
        Mood History
      </h2>

      <div className="anandam-mood-history-table-wrap">
        <div
          className="anandam-mood-history-table"
          role="table"
          aria-label="Mood check-in history"
        >
          <div
            className="anandam-mood-history-table__header"
            role="row"
          >
            <div role="columnheader">
              Date &amp; Time
            </div>

            <div role="columnheader">
              Mood
            </div>
          </div>

          <div
            className="anandam-mood-history-table__body"
            role="rowgroup"
          >
            {visibleHistory.map(
              (entry, index) => (
                <div
                  className={`anandam-mood-history-table__row${
                    index ===
                    visibleHistory.length -
                      1
                      ? " is-last"
                      : ""
                  }`}
                  role="row"
                  key={entry.id}
                >
                  <div
                    className="anandam-mood-history-table__date"
                    role="cell"
                    data-label="Date & Time"
                  >
                    {entry.date}
                  </div>

                  <div
                    className="anandam-mood-history-table__mood"
                    role="cell"
                    data-label="Mood"
                  >
                    <span>
                      <img
                        src={
                          entry.mood
                            .image
                        }
                        alt=""
                        aria-hidden="true"
                        draggable="false"
                      />

                      {
                        entry.mood
                          .label
                      }
                    </span>
                  </div>
                </div>
              )
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

function CloverCelebration({
  active,
  runId,
}) {
  if (!active) {
    return null;
  }

  return (
    <div
      key={runId}
      className="anandam-mood-clover-rain"
      aria-hidden="true"
    >
      {CLOVER_PARTICLES.map(
        (particle) => (
          <span
            key={`${runId}-${particle.id}`}
            className="anandam-mood-clover"
            style={{
              "--clover-left":
                particle.left,

              "--clover-delay":
                particle.delay,

              "--clover-duration":
                particle.duration,

              "--clover-size":
                particle.size,

              "--clover-sway-1":
                particle.swayOne,

              "--clover-sway-2":
                particle.swayTwo,

              "--clover-sway-3":
                particle.swayThree,

              "--clover-rotation-end":
                particle.rotationEnd,

              "--clover-opacity":
                particle.opacity,
            }}
          >
            <img
              src={particle.image}
              alt=""
              draggable="false"
            />
          </span>
        )
      )}
    </div>
  );
}

function MoodPageLoading() {
  return (
    <AppLayout>
      <div className="anandam-mood-page">
        <div
          className="anandam-mood-main"
          aria-busy="true"
        >
          <div className="anandam-mood-greeting">
            <span className="anandam-mood-skeleton anandam-mood-skeleton--heading" />

            <span className="anandam-mood-skeleton anandam-mood-skeleton--subheading" />
          </div>

          <div className="anandam-mood-content-stack">
            <div className="anandam-mood-skeleton anandam-mood-skeleton--card" />

            <div className="anandam-mood-skeleton anandam-mood-skeleton--history" />
          </div>
        </div>
      </div>
    </AppLayout>
  );
}

function MoodPage() {
  const navigate = useNavigate();

  const redirectTimerRef =
    useRef(null);

  const cloverTimerRef =
    useRef(null);

  const firstName = useMemo(
    () => getFirstName(),
    []
  );

  const [pageData, setPageData] =
    useState(null);

  const [
    selectedMood,
    setSelectedMood,
  ] = useState(null);

  const [history, setHistory] =
    useState([]);

  const [isLoading, setIsLoading] =
    useState(true);

  const [
    isSubmitting,
    setIsSubmitting,
  ] = useState(false);

  const [
    isComplete,
    setIsComplete,
  ] = useState(false);

  const [
    showCloverRain,
    setShowCloverRain,
  ] = useState(false);

  const [
    cloverRunId,
    setCloverRunId,
  ] = useState(0);

  const [
    loadError,
    setLoadError,
  ] = useState("");

  const [
    submitError,
    setSubmitError,
  ] = useState("");

  useEffect(() => {
    let isMounted = true;

    async function loadMoodPage() {
      try {
        const data =
          await getMoodPageData();

        if (!isMounted) {
          return;
        }

        setPageData(data || {});

        setHistory(
          Array.isArray(
            data?.history
          )
            ? data.history
            : []
        );
      } catch (error) {
        if (!isMounted) {
          return;
        }

        console.error(
          "Failed to load mood page:",
          error
        );

        setPageData({
          submitLabel:
            "Submit Mood Check",
        });

        setHistory([]);

        setLoadError(
          "We could not load your previous mood check-ins. You can still complete today's check-in."
        );
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    loadMoodPage();

    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(
    () => () => {
      if (
        redirectTimerRef.current
      ) {
        window.clearTimeout(
          redirectTimerRef.current
        );
      }

      if (
        cloverTimerRef.current
      ) {
        window.clearTimeout(
          cloverTimerRef.current
        );
      }
    },
    []
  );

  async function handleSubmit() {
    if (
      !selectedMood ||
      isSubmitting ||
      isComplete
    ) {
      return;
    }

    setSubmitError("");
    setIsSubmitting(true);

    try {
      const response =
        await submitMoodCheck(
          selectedMood
        );

      const responseHistory =
        response?.history ||
        response?.data?.history;

      if (
        Array.isArray(
          responseHistory
        )
      ) {
        setHistory(
          responseHistory
        );
      } else {
        setHistory(
          (currentHistory) => [
            {
              id: `local-${Date.now()}`,

              moodValue:
                selectedMood,

              createdAt:
                new Date().toISOString(),
            },

            ...currentHistory,
          ]
        );
      }

      setIsComplete(true);

      completeMoodGate();

      const isBestMood =
        selectedMood === 5;

      /*
       * Clover animation happens only
       * after mood 5 has been successfully
       * saved by the backend.
       */
      if (isBestMood) {
        if (
          cloverTimerRef.current
        ) {
          window.clearTimeout(
            cloverTimerRef.current
          );
        }

        setCloverRunId(
          (currentRun) =>
            currentRun + 1
        );

        setShowCloverRain(true);

        cloverTimerRef.current =
          window.setTimeout(
            () => {
              setShowCloverRain(
                false
              );
            },
            CLOVER_DURATION_MS
          );
      } else {
        setShowCloverRain(false);
      }

      redirectTimerRef.current =
        window.setTimeout(
          () =>
            navigate(
              "/dashboard",
              {
                replace: true,
              }
            ),

          isBestMood
            ? CLOVER_DURATION_MS
            : DEFAULT_REDIRECT_MS
        );
    } catch (error) {
      console.error(
        "Mood submit failed:",
        error
      );

      setSubmitError(
        error?.message ||
          "Failed to submit your mood check. Please try again."
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  if (isLoading) {
    return <MoodPageLoading />;
  }

  return (
    <AppLayout>
      <div className="anandam-mood-page">
        <img
          src={backgroundWave}
          alt=""
          aria-hidden="true"
          draggable="false"
          className="anandam-mood-page__background-wave"
        />

        <CloverCelebration
          active={showCloverRain}
          runId={cloverRunId}
        />

        <div className="anandam-mood-main">
          <header className="anandam-mood-greeting">
            <h1>
              Good morning,{" "}
              {firstName}
            </h1>

            <p>
              Take a moment for
              yourself today
            </p>
          </header>

          {loadError && (
            <div
              className="anandam-mood-notice"
              role="status"
            >
              {loadError}
            </div>
          )}

          <div className="anandam-mood-content-stack">
            <section
              className={`anandam-mood-checkin-card${
                isComplete
                  ? " is-complete"
                  : ""
              }`}
              aria-labelledby="daily-checkin-title"
            >
              {!isComplete ? (
                <>
                  <div className="anandam-mood-checkin-card__body">
                    <div className="anandam-mood-checkin-card__heading">
                      <span>
                        Daily Check-In
                      </span>

                      <h2 id="daily-checkin-title">
                        How are you
                        feeling today?
                      </h2>
                    </div>

                    <div
                      className="anandam-mood-options"
                      role="group"
                      aria-label="Select your current mood"
                    >
                      {MOODS.map(
                        (mood) => (
                          <MoodOption
                            key={
                              mood.value
                            }
                            mood={
                              mood
                            }
                            selected={
                              selectedMood ===
                              mood.value
                            }
                            disabled={
                              isSubmitting
                            }
                            onSelect={(
                              value
                            ) => {
                              setSelectedMood(
                                value
                              );

                              setSubmitError(
                                ""
                              );
                            }}
                          />
                        )
                      )}
                    </div>
                  </div>

                  <div className="anandam-mood-checkin-card__footer">
                    <button
                      type="button"
                      className="anandam-mood-submit"
                      onClick={
                        handleSubmit
                      }
                      disabled={
                        !selectedMood ||
                        isSubmitting
                      }
                    >
                      {isSubmitting ? (
                        <>
                          <span
                            className="anandam-mood-submit__spinner"
                            aria-hidden="true"
                          />

                          Submitting...
                        </>
                      ) : (
                        pageData?.submitLabel ||
                        "Submit Mood Check"
                      )}
                    </button>

                    {submitError && (
                      <p
                        className="anandam-mood-submit-error"
                        role="alert"
                      >
                        {
                          submitError
                        }
                      </p>
                    )}
                  </div>
                </>
              ) : (
                <div className="anandam-mood-complete-state">
                  <div className="anandam-mood-checkin-card__heading">
                    <span>
                      Daily Check-In
                    </span>

                    <h2 id="daily-checkin-title">
                      How are you
                      feeling today?
                    </h2>
                  </div>

                  <div className="anandam-mood-complete-state__message">
                    <span className="anandam-mood-complete-state__icon">
                      <MoodIcon
                        type="check"
                        size={42}
                      />
                    </span>

                    <h3>
                      Check-in Complete
                    </h3>

                    <p>
                      Thank you for
                      checking in with
                      yourself
                    </p>
                  </div>
                </div>
              )}
            </section>

            <MoodHistory
              history={history}
            />
          </div>
        </div>
      </div>
    </AppLayout>
  );
}

export default MoodPage;