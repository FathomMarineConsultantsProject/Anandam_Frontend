import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";

import { getMoodPageData, submitMoodCheck } from "../api/moodApi";
import { completeMoodGate } from "../utils/storage";

import headerLogo from "../assets/anandum logo.png";
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
  { value: 1, label: "Very low", image: veryLowMoodImage },
  { value: 2, label: "Low", image: lowMoodImage },
  { value: 3, label: "Okay", image: okayMoodImage },
  { value: 4, label: "Good", image: goodMoodImage },
  { value: 5, label: "Great", image: greatMoodImage },
];

const NAV_ITEMS = [
  { key: "home", label: "Home", path: "/dashboard" },
  { key: "day", label: "Day", path: "/perfect-day-schedule" },
  { key: "mood", label: "Mood", path: "/mood" },
  { key: "work-rest", label: "Work/rest", path: "/work-rest" },
  { key: "fitness", label: "Fitness", path: "/fitness" },
  { key: "emergency", label: "Emergency", path: "/emergency" },
];

const CLOVER_IMAGES = [cloverVector, cloverVectorOne, cloverVectorTwo];

/*
 * Smooth snowfall-style clover particles. Negative delays mean the
 * celebration starts with leaves already distributed through the viewport,
 * so there is no initial empty pause. Each particle falls continuously from
 * above the screen to below it with a gentle side-to-side sway.
 */
const CLOVER_PARTICLES = Array.from({ length: 34 }, (_, index) => {
  const pseudo = (multiplier, modulo) => (index * multiplier) % modulo;

  return {
    id: index,
    image: CLOVER_IMAGES[index % CLOVER_IMAGES.length],
    left: `${(index * 37 + 4) % 100}%`,
    delay: `-${(pseudo(19, 90) / 10).toFixed(1)}s`,
    duration: `${(7.2 + pseudo(11, 34) / 10).toFixed(1)}s`,
    size: `${28 + pseudo(13, 38)}px`,
    swayOne: `${-18 + pseudo(17, 37)}px`,
    swayTwo: `${-34 + pseudo(29, 69)}px`,
    swayThree: `${-20 + pseudo(23, 43)}px`,
    rotationEnd: `${240 + pseudo(31, 260)}deg`,
    opacity: `${(0.8 + pseudo(7, 18) / 100).toFixed(2)}`,
  };
});

function readStoredUser() {
  const possibleKeys = ["anandam_user", "user"];

  for (const key of possibleKeys) {
    try {
      const storedValue = window.localStorage.getItem(key);
      if (!storedValue) continue;

      const parsedValue = JSON.parse(storedValue);
      if (parsedValue && typeof parsedValue === "object") {
        return parsedValue;
      }
    } catch {
      // Ignore malformed legacy storage values and use the safe fallback below.
    }
  }

  return {};
}

function getDisplayProfile() {
  const user = readStoredUser();
  const fullName =
    user.fullName ||
    user.full_name ||
    user.name ||
    [user.firstName || user.first_name, user.lastName || user.last_name]
      .filter(Boolean)
      .join(" ") ||
    "Jason Statham";

  const firstName = fullName.trim().split(/\s+/)[0] || "Jason";
  const email = user.email || "Jasonstatham@gmail.com";
  const avatar =
    user.avatar ||
    user.avatarUrl ||
    user.avatar_url ||
    user.profileImage ||
    user.profile_image ||
    user.photoUrl ||
    user.photo_url ||
    "";

  return {
    fullName,
    firstName,
    email,
    avatar,
    initial: firstName.charAt(0).toUpperCase(),
  };
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
  if (Number.isInteger(numericValue) && numericValue >= 1 && numericValue <= 5) {
    return numericValue;
  }

  if (typeof rawValue === "string") {
    const normalized = rawValue.trim().toLowerCase().replace(/[_-]+/g, " ");
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
  if (Number.isNaN(date.getTime())) return String(value || "-");

  return new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  })
    .format(date)
    .replace(/\bat\b/i, ",");
}

function Icon({ name, size = 24 }) {
  const sharedProps = {
    width: size,
    height: size,
    viewBox: "0 0 24 24",
    fill: "none",
    "aria-hidden": true,
  };

  switch (name) {
    case "bell":
      return (
        <svg {...sharedProps}>
          <path
            d="M8 18.25h8M9.75 20.25h4.5M18 15.75H6l1.25-1.65V10a4.75 4.75 0 0 1 9.5 0v4.1L18 15.75Z"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      );
    case "home":
      return (
        <svg {...sharedProps}>
          <path
            d="M3.5 10.65 12 3.5l8.5 7.15V20a.5.5 0 0 1-.5.5h-5.25v-6.25h-5.5v6.25H4a.5.5 0 0 1-.5-.5v-9.35Z"
            stroke="currentColor"
            strokeWidth="1.4"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      );
    case "day":
      return (
        <svg {...sharedProps}>
          <rect
            x="3.5"
            y="5"
            width="17"
            height="15.5"
            rx="2.5"
            stroke="currentColor"
            strokeWidth="1.4"
          />
          <path
            d="M7.5 3.5V7M16.5 3.5V7M3.5 9.25h17"
            stroke="currentColor"
            strokeWidth="1.4"
            strokeLinecap="round"
          />
        </svg>
      );
    case "mood":
      return (
        <svg {...sharedProps}>
          <circle cx="12" cy="12" r="9.5" stroke="currentColor" strokeWidth="1.4" />
          <path
            d="M8.25 10h.01M15.75 10h.01M8.4 14.25c.9 1.2 2.1 1.8 3.6 1.8 1.5 0 2.7-.6 3.6-1.8"
            stroke="currentColor"
            strokeWidth="1.4"
            strokeLinecap="round"
          />
        </svg>
      );
    case "work-rest":
      return (
        <svg {...sharedProps}>
          <path
            d="M7.25 8.25 15.75 16.75M5.1 6.1l2.15 2.15-2.7 2.7-2.15-2.15 2.7-2.7ZM18.9 17.9l2.15 2.15-2.7 2.7-2.15-2.15 2.7-2.7ZM16.75 8.25 8.25 16.75M18.9 6.1l2.15 2.15-2.15 2.15-2.7-2.7 2.7-2.7ZM5.1 17.9l2.7 2.7-2.15 2.15-2.7-2.7 2.15-2.15Z"
            stroke="currentColor"
            strokeWidth="1.25"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      );
    case "fitness":
      return (
        <svg {...sharedProps}>
          <path
            d="M3 12h3.1l2.15-5.25 3.25 10.5 2.7-7 1.65 3.25H21"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      );
    case "emergency":
      return (
        <svg {...sharedProps}>
          <path
            d="M12 3.5 21 20H3L12 3.5Z"
            stroke="currentColor"
            strokeWidth="1.4"
            strokeLinejoin="round"
          />
          <path
            d="M12 9v5.25M12 17.25h.01"
            stroke="currentColor"
            strokeWidth="1.6"
            strokeLinecap="round"
          />
        </svg>
      );
    case "check":
      return (
        <svg {...sharedProps}>
          <circle cx="12" cy="12" r="9.5" stroke="currentColor" strokeWidth="1.5" />
          <path
            d="m7.75 12.2 2.7 2.7 5.8-6.1"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      );
    default:
      return null;
  }
}

function DashboardHeader({ profile, onLogoClick, onProfileClick }) {
  return (
    <header className="anandam-mood-header">
      <button
        type="button"
        className="anandam-mood-header__logo-button"
        onClick={onLogoClick}
        aria-label="Open dashboard"
      >
        <img src={headerLogo} alt="Anandam" className="anandam-mood-header__logo" />
      </button>

      <div className="anandam-mood-header__actions">
        <button
          type="button"
          className="anandam-mood-header__bell"
          aria-label="Open notifications"
        >
          <Icon name="bell" size={24} />
        </button>

        <button
          type="button"
          className="anandam-mood-header__profile"
          onClick={onProfileClick}
          aria-label="Open profile"
        >
          <span className="anandam-mood-header__avatar" aria-hidden="true">
            {profile.avatar ? (
              <img src={profile.avatar} alt="" />
            ) : (
              profile.initial
            )}
          </span>

          <span className="anandam-mood-header__identity">
            <span className="anandam-mood-header__name">{profile.fullName}</span>
            <span className="anandam-mood-header__email">{profile.email}</span>
          </span>
        </button>
      </div>
    </header>
  );
}

function DashboardNavigation({ navigate }) {
  return (
    <nav className="anandam-mood-navigation" aria-label="Main navigation">
      <div className="anandam-mood-navigation__items">
        {NAV_ITEMS.map((item, index) => {
          const isActive = item.key === "mood";

          return (
            <div className="anandam-mood-navigation__entry" key={item.key}>
              <button
                type="button"
                className={`anandam-mood-navigation__item${
                  isActive ? " is-active" : ""
                }`}
                onClick={() => navigate(item.path)}
                aria-current={isActive ? "page" : undefined}
              >
                <span className="anandam-mood-navigation__icon">
                  <Icon name={item.key} size={item.key === "home" || item.key === "day" ? 20 : 24} />
                </span>
                <span className="anandam-mood-navigation__label">{item.label}</span>
              </button>

              {index < NAV_ITEMS.length - 1 && (
                <span className="anandam-mood-navigation__separator" aria-hidden="true" />
              )}
            </div>
          );
        })}
      </div>
    </nav>
  );
}

function MoodOption({ mood, selected, disabled, onSelect }) {
  return (
    <button
      type="button"
      className={`anandam-mood-option${selected ? " is-selected" : ""}`}
      onClick={() => onSelect(mood.value)}
      aria-pressed={selected}
      disabled={disabled}
    >
      <img src={mood.image} alt="" aria-hidden="true" draggable="false" />
      <span>{mood.label}</span>
    </button>
  );
}

function MoodHistory({ history }) {
  const normalizedHistory = useMemo(
    () =>
      history.map((entry, index) => {
        const value = resolveMoodValue(entry);
        const mood = MOODS.find((item) => item.value === value) || MOODS[2];

        return {
          id: entry?.id || entry?.moodLogId || entry?.mood_log_id || `${resolveMoodDate(entry)}-${index}`,
          date: formatMoodDate(resolveMoodDate(entry)),
          mood,
        };
      }),
    [history],
  );

  if (normalizedHistory.length === 0) {
    return (
      <section className="anandam-mood-history-card is-empty" aria-labelledby="mood-history-title">
        <h2 id="mood-history-title" className="anandam-mood-history-card__title">
          Mood History
        </h2>

        <div className="anandam-mood-history-empty">
          <div className="anandam-mood-history-empty__icon" aria-hidden="true">
            <Icon name="mood" size={34} />
          </div>
          <h3>No mood check-ins yet</h3>
          <p>Your completed mood check-ins will appear here</p>
        </div>
      </section>
    );
  }

  return (
    <section className="anandam-mood-history-card" aria-labelledby="mood-history-title">
      <h2 id="mood-history-title" className="anandam-mood-history-card__title">
        Mood History
      </h2>

      <div className="anandam-mood-history-table-wrap">
        <div className="anandam-mood-history-table" role="table" aria-label="Mood check-in history">
          <div className="anandam-mood-history-table__header" role="row">
            <div role="columnheader">Date &amp; Time</div>
            <div role="columnheader">Mood</div>
          </div>

          <div className="anandam-mood-history-table__body" role="rowgroup">
            {normalizedHistory.slice(0, 20).map((entry, index) => (
              <div
                className={`anandam-mood-history-table__row${
                  index === normalizedHistory.slice(0, 20).length - 1 ? " is-last" : ""
                }`}
                role="row"
                key={entry.id}
              >
                <div className="anandam-mood-history-table__date" role="cell" data-label="Date & Time">
                  {entry.date}
                </div>
                <div className="anandam-mood-history-table__mood" role="cell" data-label="Mood">
                  <span>
                    <img src={entry.mood.image} alt="" aria-hidden="true" draggable="false" />
                    {entry.mood.label}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function CloverCelebration({ active, runId }) {
  if (!active) return null;

  return (
    <div
      key={runId}
      className="anandam-mood-clover-rain"
      aria-hidden="true"
    >
      {CLOVER_PARTICLES.map((particle) => (
        <span
          key={`${runId}-${particle.id}`}
          className="anandam-mood-clover"
          style={{
            "--clover-left": particle.left,
            "--clover-delay": particle.delay,
            "--clover-duration": particle.duration,
            "--clover-size": particle.size,
            "--clover-sway-1": particle.swayOne,
            "--clover-sway-2": particle.swayTwo,
            "--clover-sway-3": particle.swayThree,
            "--clover-rotation-end": particle.rotationEnd,
            "--clover-opacity": particle.opacity,
          }}
        >
          <img src={particle.image} alt="" draggable="false" />
        </span>
      ))}
    </div>
  );
}

function MoodPageLoading({ profile, navigate }) {
  return (
    <div className="anandam-mood-page">
      <DashboardHeader
        profile={profile}
        onLogoClick={() => navigate("/dashboard")}
        onProfileClick={() => navigate("/profile")}
      />
      <DashboardNavigation navigate={navigate} />

      <main className="anandam-mood-main" aria-busy="true">
        <div className="anandam-mood-greeting">
          <span className="anandam-mood-skeleton anandam-mood-skeleton--heading" />
          <span className="anandam-mood-skeleton anandam-mood-skeleton--subheading" />
        </div>
        <div className="anandam-mood-skeleton anandam-mood-skeleton--card" />
        <div className="anandam-mood-skeleton anandam-mood-skeleton--history" />
      </main>
    </div>
  );
}

function MoodPage() {
  const navigate = useNavigate();
  const redirectTimerRef = useRef(null);
  const cloverTimerRef = useRef(null);

  const profile = useMemo(() => getDisplayProfile(), []);

  const [pageData, setPageData] = useState(null);
  const [selectedMood, setSelectedMood] = useState(null);
  const [history, setHistory] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const [showCloverRain, setShowCloverRain] = useState(false);
  const [cloverRunId, setCloverRunId] = useState(0);
  const [loadError, setLoadError] = useState("");
  const [submitError, setSubmitError] = useState("");

  useEffect(() => {
    let isMounted = true;

    async function loadMoodPage() {
      try {
        const data = await getMoodPageData();
        if (!isMounted) return;

        setPageData(data || {});
        setHistory(Array.isArray(data?.history) ? data.history : []);
      } catch (error) {
        if (!isMounted) return;

        console.error("Failed to load mood page:", error);
        setPageData({ submitLabel: "Submit Mood Check" });
        setHistory([]);
        setLoadError("We could not load your previous mood check-ins. You can still complete today’s check-in.");
      } finally {
        if (isMounted) setIsLoading(false);
      }
    }

    loadMoodPage();

    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(
    () => () => {
      if (redirectTimerRef.current) window.clearTimeout(redirectTimerRef.current);
      if (cloverTimerRef.current) window.clearTimeout(cloverTimerRef.current);
    },
    [],
  );

  async function handleSubmit() {
    if (!selectedMood || isSubmitting || isComplete) return;

    setSubmitError("");
    setIsSubmitting(true);

    try {
      const response = await submitMoodCheck(selectedMood);
      const responseHistory = response?.history || response?.data?.history;

      if (Array.isArray(responseHistory)) {
        setHistory(responseHistory);
      } else {
        setHistory((currentHistory) => [
          {
            id: `local-${Date.now()}`,
            moodValue: selectedMood,
            createdAt: new Date().toISOString(),
          },
          ...currentHistory,
        ]);
      }

      setIsComplete(true);
      completeMoodGate();

      const isBestMood = selectedMood === 5;

      /*
       * Celebrate only after the API has successfully saved mood value 5.
       * Selecting Great alone, or a failed request, never starts the leaves.
       */
      if (isBestMood) {
        if (cloverTimerRef.current) {
          window.clearTimeout(cloverTimerRef.current);
        }

        setCloverRunId((currentRun) => currentRun + 1);
        setShowCloverRain(true);

        cloverTimerRef.current = window.setTimeout(() => {
          setShowCloverRain(false);
        }, CLOVER_DURATION_MS);
      } else {
        setShowCloverRain(false);
      }

      redirectTimerRef.current = window.setTimeout(
        () => navigate("/dashboard", { replace: true }),
        isBestMood ? CLOVER_DURATION_MS : DEFAULT_REDIRECT_MS,
      );
    } catch (error) {
      console.error("Mood submit failed:", error);
      setSubmitError(error?.message || "Failed to submit your mood check. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  }

  if (isLoading) {
    return <MoodPageLoading profile={profile} navigate={navigate} />;
  }

  return (
    <div className="anandam-mood-page">
      <img
        src={backgroundWave}
        alt=""
        aria-hidden="true"
        draggable="false"
        className="anandam-mood-page__background-wave"
      />

      <CloverCelebration active={showCloverRain} runId={cloverRunId} />

      <DashboardHeader
        profile={profile}
        onLogoClick={() => navigate("/dashboard")}
        onProfileClick={() => navigate("/profile")}
      />

      <DashboardNavigation navigate={navigate} />

      <main className="anandam-mood-main">
        <header className="anandam-mood-greeting">
          <h1>Good morning, {profile.firstName}</h1>
          <p>Take a moment for yourself today</p>
        </header>

        {loadError && (
          <div className="anandam-mood-notice" role="status">
            {loadError}
          </div>
        )}

        <div className="anandam-mood-content-stack">
          <section
            className={`anandam-mood-checkin-card${isComplete ? " is-complete" : ""}`}
            aria-labelledby="daily-checkin-title"
          >
            {!isComplete ? (
              <>
                <div className="anandam-mood-checkin-card__body">
                  <div className="anandam-mood-checkin-card__heading">
                    <span>Daily Check-In</span>
                    <h2 id="daily-checkin-title">How are you feeling today?</h2>
                  </div>

                  <div className="anandam-mood-options" role="group" aria-label="Select your current mood">
                    {MOODS.map((mood) => (
                      <MoodOption
                        key={mood.value}
                        mood={mood}
                        selected={selectedMood === mood.value}
                        disabled={isSubmitting}
                        onSelect={(value) => {
                          setSelectedMood(value);
                          setSubmitError("");
                        }}
                      />
                    ))}
                  </div>
                </div>

                <div className="anandam-mood-checkin-card__footer">
                  <button
                    type="button"
                    className="anandam-mood-submit"
                    onClick={handleSubmit}
                    disabled={!selectedMood || isSubmitting}
                  >
                    {isSubmitting ? (
                      <>
                        <span className="anandam-mood-submit__spinner" aria-hidden="true" />
                        Submitting...
                      </>
                    ) : (
                      pageData?.submitLabel || "Submit Mood Check"
                    )}
                  </button>

                  {submitError && (
                    <p className="anandam-mood-submit-error" role="alert">
                      {submitError}
                    </p>
                  )}
                </div>
              </>
            ) : (
              <div className="anandam-mood-complete-state">
                <div className="anandam-mood-checkin-card__heading">
                  <span>Daily Check-In</span>
                  <h2 id="daily-checkin-title">How are you feeling today?</h2>
                </div>

                <div className="anandam-mood-complete-state__message">
                  <span className="anandam-mood-complete-state__icon">
                    <Icon name="check" size={42} />
                  </span>
                  <h3>Check-in Complete</h3>
                  <p>Thank you for checking in with yourself</p>
                </div>
              </div>
            )}
          </section>

          <MoodHistory history={history} />
        </div>
      </main>
    </div>
  );
}

export default MoodPage;
