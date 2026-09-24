import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import AppLayout from "../components/layout/AppLayout";

import {
  ArrowLeft,
  ArrowUpRight,
  Check,
  ChevronDown,
  Clock3,
  Dumbbell,
  Gamepad2,
  Info,
  Moon,
  Play,
  RefreshCw,
  TrendingUp,
} from "lucide-react";

import {
  completeFitnessSession,
  endFitnessSession,
  getFitnessErrorMessage,
  getFitnessHistory,
  getFitnessOverview,
  getFitnessWorkoutById,
  getFitnessWorkouts,
  startFitnessWorkout,
  updateFitnessProgress,
} from "../api/fitnessApi";

import "../styles/fitness.css";

const FITNESS_TABS = [
  { id: "overview", label: "Overview" },
  { id: "guided", label: "Guided Workout" },
  { id: "vr", label: "VR Workouts" },
  { id: "history", label: "Activity History" },
];

const GUIDED_CATEGORIES = [
  "ALL",
  "STRENGTH",
  "MOBILITY",
  "CARDIO",
  "BALANCE",
  "YOGA",
  "RECOVERY",
];

const DIFFICULTIES = [
  "BEGINNER",
  "INTERMEDIATE",
  "ADVANCED",
];

const DURATION_OPTIONS = [
  { value: "", label: "Duration" },
  { value: "0-15", label: "Up to 15 min" },
  { value: "16-20", label: "16–20 min" },
  { value: "21-30", label: "21–30 min" },
  { value: "31-999", label: "30+ min" },
];

let youtubeApiPromise = null;

function loadYouTubeIframeApi() {
  if (window.YT?.Player) {
    return Promise.resolve(window.YT);
  }

  if (youtubeApiPromise) {
    return youtubeApiPromise;
  }

  youtubeApiPromise = new Promise((resolve, reject) => {
    let settled = false;

    const finishResolve = () => {
      if (settled) return;
      settled = true;
      window.clearTimeout(timeoutId);

      if (window.YT?.Player) {
        resolve(window.YT);
      } else {
        reject(new Error("YouTube player API did not initialise."));
      }
    };

    const finishReject = () => {
      if (settled) return;
      settled = true;
      window.clearTimeout(timeoutId);
      reject(new Error("Unable to load the YouTube player."));
    };

    const previousReady = window.onYouTubeIframeAPIReady;

    window.onYouTubeIframeAPIReady = () => {
      if (typeof previousReady === "function") {
        try {
          previousReady();
        } catch {
          // Do not block this player if another callback fails.
        }
      }

      finishResolve();
    };

    const timeoutId = window.setTimeout(() => {
      if (window.YT?.Player) {
        finishResolve();
      } else {
        finishReject();
      }
    }, 15000);

    const existingScript = document.querySelector(
      'script[src="https://www.youtube.com/iframe_api"]'
    );

    if (existingScript) {
      existingScript.addEventListener("error", finishReject, { once: true });
      return;
    }

    const script = document.createElement("script");
    script.src = "https://www.youtube.com/iframe_api";
    script.async = true;
    script.addEventListener("error", finishReject, { once: true });
    document.head.appendChild(script);
  });

  return youtubeApiPromise;
}

function formatEnum(value) {
  if (!value) return "—";

  return String(value)
    .toLowerCase()
    .split("_")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

function formatDate(value) {
  if (!value) return "—";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";

  return date.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function formatNumber(value, fallback = "—") {
  if (value === null || value === undefined || value === "") {
    return fallback;
  }

  const number = Number(value);
  if (!Number.isFinite(number)) return fallback;

  return Number.isInteger(number)
    ? String(number)
    : number.toFixed(1).replace(/\.0$/, "");
}

function getDurationFilter(value) {
  if (!value) return {};

  const [min, max] = value.split("-").map(Number);

  return {
    minDuration: Number.isFinite(min) ? min : undefined,
    maxDuration: Number.isFinite(max) ? max : undefined,
  };
}

function getChallengeTone(themeKey, index) {
  const normalized = String(themeKey || "").toLowerCase();

  if (normalized.includes("green")) return "green";
  if (normalized.includes("purple")) return "purple";
  if (normalized.includes("blue")) return "blue";
  if (
    normalized.includes("gold") ||
    normalized.includes("yellow") ||
    normalized.includes("amber")
  ) {
    return "gold";
  }

  return ["gold", "green", "purple"][index % 3];
}

function DifficultyBadge({ difficulty }) {
  const normalized = String(difficulty || "BEGINNER").toLowerCase();

  return (
    <span
      className={`fitness-difficulty fitness-difficulty--${normalized}`}
    >
      {formatEnum(difficulty)}
    </span>
  );
}

function FitnessImage({ src, alt, className = "" }) {
  const [failed, setFailed] = useState(false);

  if (!src || failed) {
    return (
      <div
        className={`fitness-media-fallback ${className}`}
        role="img"
        aria-label={alt || "Workout"}
      >
        <Dumbbell size={34} strokeWidth={1.35} />
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={alt || "Workout"}
      className={className}
      loading="lazy"
      onError={() => setFailed(true)}
    />
  );
}

function FitnessHeader({ activeTab, onTabChange }) {
  return (
    <>
      <div className="fitness-heading">
        <h1>Fitness</h1>
        <p>Move, stretch and stay active ~ wherever you are.</p>
      </div>

      <nav className="fitness-tabs" aria-label="Fitness sections">
        {FITNESS_TABS.map((tab) => (
          <button
            key={tab.id}
            type="button"
            className={`fitness-tab${
              activeTab === tab.id ? " is-active" : ""
            }`}
            onClick={() => onTabChange(tab.id)}
          >
            {tab.label}
          </button>
        ))}
      </nav>
    </>
  );
}

function PageLoader({ label = "Loading fitness..." }) {
  return (
    <div className="fitness-loader" role="status">
      <RefreshCw size={20} className="fitness-spin" />
      <span>{label}</span>
    </div>
  );
}

function PageError({ message, onRetry }) {
  return (
    <div className="fitness-error-panel" role="alert">
      <strong>We couldn&apos;t load this section.</strong>
      <span>{message}</span>

      {onRetry ? (
        <button type="button" onClick={onRetry}>
          Try again
        </button>
      ) : null}
    </div>
  );
}

function StatCard({ id, label, value }) {
  let icon = <Dumbbell size={22} strokeWidth={1.5} />;
  let tone = "blue";

  if (id === "sleep") {
    icon = <Moon size={22} strokeWidth={1.5} />;
    tone = "green";
  }

  if (id === "vr") {
    icon = <Gamepad2 size={22} strokeWidth={1.5} />;
    tone = "purple";
  }

  return (
    <article className="fitness-stat-card">
      <div className={`fitness-stat-icon fitness-stat-icon--${tone}`}>
        {icon}
      </div>

      <span>{label}</span>
      <strong>{formatNumber(value)}</strong>
    </article>
  );
}

function WorkoutBreakdown({ breakdown }) {
  const guided = breakdown?.guidedWorkouts || {};
  const vr = breakdown?.vrWorkouts || {};

  const guidedPercent = Math.max(
    0,
    Math.min(100, Number(guided.percent) || 0)
  );

  const vrPercent = Math.max(
    0,
    Math.min(100, Number(vr.percent) || 0)
  );

  return (
    <aside className="fitness-breakdown-card">
      <div className="fitness-section-line-title">
        <strong>Workout Breakdown</strong>
        <span />
      </div>

      <div
        className="fitness-donut"
        style={{ "--guided-angle": `${guidedPercent * 3.6}deg` }}
        aria-label={`Guided workouts ${guidedPercent} percent, VR workouts ${vrPercent} percent`}
      >
        <span className="fitness-donut__hole" />
      </div>

      <div className="fitness-breakdown-legend">
        <div>
          <span className="fitness-breakdown-dot is-guided" />
          <span>Guided workouts</span>
          <strong>{guidedPercent}%</strong>
        </div>

        <div>
          <span className="fitness-breakdown-dot is-vr" />
          <span>VR workouts</span>
          <strong>{vrPercent}%</strong>
        </div>
      </div>
    </aside>
  );
}

function ContinueWorkout({ session, ending, onResume, onEnd }) {
  if (!session?.workout) {
    return (
      <article className="fitness-continue-card fitness-continue-card--empty">
        <h2>Continue workout</h2>

        <div className="fitness-empty-inline">
          <span>No workout is currently in progress.</span>
        </div>
      </article>
    );
  }

  const workout = session.workout;

  return (
    <article className="fitness-continue-card">
      <h2>Continue workout</h2>

      <div className="fitness-continue-content">
        <FitnessImage
          src={workout.thumbnailUrl}
          alt={workout.title}
          className="fitness-continue-image"
        />

        <div className="fitness-continue-info">
          <div className="fitness-continue-copy">
            <div className="fitness-tag-row">
              <span className="fitness-soft-tag is-blue">
                {formatEnum(workout.category)}
              </span>

              <DifficultyBadge difficulty={workout.difficulty} />
            </div>

            <h3>{workout.title}</h3>

            <div className="fitness-workout-meta">
              <span>
                <Clock3 size={14} />
                {workout.durationMinutes} min
              </span>

              <span>
                <TrendingUp size={14} />
                {formatNumber(session.progressPercent, "0")}% completed
              </span>
            </div>

            <p>{workout.shortDescription}</p>
          </div>

          <div className="fitness-continue-actions">
            <button
              type="button"
              className="fitness-text-action"
              onClick={onEnd}
              disabled={ending}
            >
              {ending ? "Ending..." : "End Workout"}
            </button>

            <button
              type="button"
              className="fitness-primary-button"
              onClick={onResume}
              disabled={ending}
            >
              Resume Workout
            </button>
          </div>
        </div>
      </div>
    </article>
  );
}

function ChallengeSection({ challenges = [] }) {
  return (
    <section className="fitness-challenge-card">
      <div className="fitness-section-line-title fitness-section-line-title--wide">
        <strong>Active Challenges</strong>
        <span />
      </div>

      {challenges.length ? (
        <div className="fitness-challenge-list">
          {challenges.map((challenge, index) => {
            const tone = getChallengeTone(challenge.themeKey, index);
            const current = Number(challenge.currentValue) || 0;
            const target = Number(challenge.targetValue) || 0;
            const remaining = Number(challenge.remaining) || 0;
            const percent = Math.max(
              0,
              Math.min(100, Number(challenge.progressPercent) || 0)
            );

            return (
              <div className="fitness-challenge-row" key={challenge.id}>
                <div className="fitness-challenge-copy">
                  <div>
                    <strong>{challenge.title}</strong>
                    <span>{challenge.description}</span>
                  </div>

                  <div className="fitness-challenge-count">
                    <strong>
                      {current}/{target}
                    </strong>
                    <span>
                      {remaining} {challenge.unit || "workouts"} left
                    </span>
                  </div>
                </div>

                <div className="fitness-progress-track">
                  <span
                    className={`fitness-progress-fill is-${tone}`}
                    style={{ width: `${percent}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="fitness-empty-inline">
          <span>No active challenges right now.</span>
        </div>
      )}
    </section>
  );
}

function ActivityTable({ rows = [] }) {
  return (
    <div className="fitness-table-wrap">
      <table className="fitness-activity-table">
        <thead>
          <tr>
            <th>Activity</th>
            <th>Activity Type</th>
            <th>Duration</th>
            <th>Completed On</th>
            <th>Difficulty</th>
          </tr>
        </thead>

        <tbody>
          {rows.map((row) => (
            <tr key={row.sessionId || row.id}>
              <td>{row.activity}</td>
              <td>{row.activityType}</td>
              <td>{row.durationMinutes} Min</td>
              <td>{formatDate(row.completedOn)}</td>
              <td>
                <DifficultyBadge difficulty={row.difficulty} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {!rows.length ? (
        <div className="fitness-table-empty">
          No completed workouts yet.
        </div>
      ) : null}
    </div>
  );
}

function RecentActivities({ rows = [], onViewAll }) {
  return (
    <section className="fitness-recent-card">
      <div className="fitness-recent-heading">
        <h2>Recent Activities</h2>

        <button type="button" onClick={onViewAll}>
          View All Activity
          <ArrowUpRight size={16} />
        </button>
      </div>

      <ActivityTable rows={rows} />
    </section>
  );
}

function OverviewTab({
  overview,
  loading,
  error,
  ending,
  onRetry,
  onResume,
  onEnd,
  onViewAll,
}) {
  if (loading && !overview) {
    return <PageLoader label="Loading your fitness overview..." />;
  }

  if (error && !overview) {
    return <PageError message={error} onRetry={onRetry} />;
  }

  const metrics = overview?.metrics || {};

  return (
    <div className="fitness-tab-panel">
      {error ? (
        <div className="fitness-inline-error">{error}</div>
      ) : null}

      <div className="fitness-overview-grid">
        <div className="fitness-overview-main">
          <div className="fitness-stats-grid">
            <StatCard
              id="workouts"
              label="Workouts completed"
              value={metrics.workoutsCompleted}
            />

            <StatCard
              id="sleep"
              label="Sleep hours"
              value={metrics.sleepHours}
            />

            <StatCard
              id="vr"
              label="VR Sessions"
              value={metrics.vrSessions}
            />
          </div>

          <ContinueWorkout
            session={overview?.continueWorkout}
            ending={ending}
            onResume={onResume}
            onEnd={onEnd}
          />
        </div>

        <WorkoutBreakdown breakdown={overview?.workoutBreakdown} />
      </div>

      <ChallengeSection challenges={overview?.activeChallenges || []} />

      <RecentActivities
        rows={overview?.recentActivities || []}
        onViewAll={onViewAll}
      />
    </div>
  );
}

function GuidedFilters({
  category,
  onCategoryChange,
  duration,
  onDurationChange,
  difficulty,
  onDifficultyChange,
}) {
  return (
    <div className="fitness-filter-row">
      <div className="fitness-category-filters">
        {GUIDED_CATEGORIES.map((item) => (
          <button
            key={item}
            type="button"
            className={`fitness-filter-pill${
              category === item ? " is-active" : ""
            }`}
            onClick={() => onCategoryChange(item)}
          >
            {formatEnum(item)}
          </button>
        ))}
      </div>

      <div className="fitness-select-filters">
        <label className="fitness-select-shell">
          <select
            value={duration}
            onChange={(event) => onDurationChange(event.target.value)}
            aria-label="Workout duration"
          >
            {DURATION_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          <ChevronDown size={15} />
        </label>

        <label className="fitness-select-shell">
          <select
            value={difficulty}
            onChange={(event) => onDifficultyChange(event.target.value)}
            aria-label="Workout difficulty"
          >
            <option value="">Difficulty</option>

            {DIFFICULTIES.map((item) => (
              <option key={item} value={item}>
                {formatEnum(item)}
              </option>
            ))}
          </select>
          <ChevronDown size={15} />
        </label>
      </div>
    </div>
  );
}

function GuidedWorkoutCard({ workout, onOpen }) {
  return (
    <article className="fitness-workout-card">
      <div className="fitness-workout-card__media-wrap">
        <FitnessImage
          src={workout.thumbnailUrl}
          alt={workout.title}
          className="fitness-workout-card__image"
        />
      </div>

      <div className="fitness-workout-card__body">
        <div className="fitness-workout-card__meta-row">
          <span>{workout.durationMinutes} min</span>
          <DifficultyBadge difficulty={workout.difficulty} />
        </div>

        <h3>{workout.title}</h3>
        <p>{workout.shortDescription}</p>

        <button
          type="button"
          className="fitness-primary-button fitness-workout-card__button"
          onClick={() => onOpen(workout)}
        >
          Open Workout
        </button>
      </div>
    </article>
  );
}

function GuidedWorkoutTab({
  workouts,
  loading,
  error,
  filters,
  onFiltersChange,
  onRetry,
  onOpen,
}) {
  return (
    <div className="fitness-tab-panel">
      <GuidedFilters
        category={filters.category}
        onCategoryChange={(category) =>
          onFiltersChange({ ...filters, category })
        }
        duration={filters.duration}
        onDurationChange={(duration) =>
          onFiltersChange({ ...filters, duration })
        }
        difficulty={filters.difficulty}
        onDifficultyChange={(difficulty) =>
          onFiltersChange({ ...filters, difficulty })
        }
      />

      {loading ? (
        <PageLoader label="Loading guided workouts..." />
      ) : null}

      {!loading && error ? (
        <PageError message={error} onRetry={onRetry} />
      ) : null}

      {!loading && !error && workouts.length ? (
        <div className="fitness-workout-grid">
          {workouts.map((workout) => (
            <GuidedWorkoutCard
              key={workout.id}
              workout={workout}
              onOpen={onOpen}
            />
          ))}
        </div>
      ) : null}

      {!loading && !error && !workouts.length ? (
        <div className="fitness-empty-state">
          <Dumbbell size={30} strokeWidth={1.4} />
          <strong>No workouts match these filters.</strong>
          <span>Try another category, duration or difficulty.</span>
        </div>
      ) : null}
    </div>
  );
}

function VrWorkoutCard({ workout, onOpen }) {
  return (
    <article className="fitness-workout-card fitness-vr-card">
      <div className="fitness-workout-card__media-wrap">
        <FitnessImage
          src={workout.thumbnailUrl}
          alt={workout.title}
          className="fitness-workout-card__image"
        />
      </div>

      <div className="fitness-workout-card__body">
        <div className="fitness-workout-card__meta-row">
          <span>{workout.durationMinutes} min</span>
          <DifficultyBadge difficulty={workout.difficulty} />
        </div>

        <h3>{workout.title}</h3>
        <p>{workout.shortDescription}</p>

        <div className="fitness-equipment-tags">
          {(workout.requiredEquipment || []).slice(0, 3).map((item) => (
            <span key={item}>{item}</span>
          ))}
        </div>

        <button
          type="button"
          className="fitness-primary-button fitness-workout-card__button"
          onClick={() => onOpen(workout)}
        >
          Open VR Workout
        </button>
      </div>
    </article>
  );
}

function VrWorkoutTab({ workouts, loading, error, onRetry, onOpen }) {
  return (
    <div className="fitness-tab-panel">
      <div className="fitness-vr-notice">
        Check the required equipment before beginning a VR workout.
      </div>

      {loading ? <PageLoader label="Loading VR workouts..." /> : null}

      {!loading && error ? (
        <PageError message={error} onRetry={onRetry} />
      ) : null}

      {!loading && !error && workouts.length ? (
        <div className="fitness-workout-grid">
          {workouts.map((workout) => (
            <VrWorkoutCard
              key={workout.id}
              workout={workout}
              onOpen={onOpen}
            />
          ))}
        </div>
      ) : null}

      {!loading && !error && !workouts.length ? (
        <div className="fitness-empty-state">
          <Gamepad2 size={30} strokeWidth={1.4} />
          <strong>No VR workouts are available yet.</strong>
          <span>
            VR workouts will appear here automatically when active VR records
            are added to the backend.
          </span>
        </div>
      ) : null}
    </div>
  );
}

function ActivityHistoryTab({
  rows,
  pagination,
  loading,
  error,
  onRetry,
  onPageChange,
}) {
  return (
    <div className="fitness-tab-panel">
      <section className="fitness-history-card">
        <h2>Activity History</h2>

        {loading ? (
          <PageLoader label="Loading activity history..." />
        ) : null}

        {!loading && error ? (
          <PageError message={error} onRetry={onRetry} />
        ) : null}

        {!loading && !error ? <ActivityTable rows={rows} /> : null}

        {!loading &&
        !error &&
        Number(pagination?.totalPages) > 1 ? (
          <div className="fitness-pagination">
            <button
              type="button"
              disabled={Number(pagination.page) <= 1}
              onClick={() => onPageChange(Number(pagination.page) - 1)}
            >
              Previous
            </button>

            <span>
              Page {pagination.page} of {pagination.totalPages}
            </span>

            <button
              type="button"
              disabled={
                Number(pagination.page) >= Number(pagination.totalPages)
              }
              onClick={() => onPageChange(Number(pagination.page) + 1)}
            >
              Next
            </button>
          </div>
        ) : null}
      </section>
    </div>
  );
}

function BackButton({ onClick }) {
  return (
    <button
      type="button"
      className="fitness-back-button"
      onClick={onClick}
    >
      <ArrowLeft size={18} />
      Back
    </button>
  );
}

function YouTubeWorkoutPlayer({
  videoId,
  initialSeconds = 0,
  durationMinutes = 0,
  onProgress,
  onEnded,
}) {
  const mountRef = useRef(null);
  const playerRef = useRef(null);
  const intervalRef = useRef(null);
  const onProgressRef = useRef(onProgress);
  const onEndedRef = useRef(onEnded);
  const lastSavedSecondRef = useRef(-1);
  const endedRef = useRef(false);

  const [playerError, setPlayerError] = useState("");

  useEffect(() => {
    onProgressRef.current = onProgress;
  }, [onProgress]);

  useEffect(() => {
    onEndedRef.current = onEnded;
  }, [onEnded]);

  useEffect(() => {
    let cancelled = false;

    function stopProgressTimer() {
      if (intervalRef.current) {
        window.clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    }

    function emitProgress(force = false) {
      const player = playerRef.current;
      if (!player?.getCurrentTime) return;

      const positionSeconds = Math.max(
        0,
        Math.floor(Number(player.getCurrentTime()) || 0)
      );

      if (
        !force &&
        Math.abs(positionSeconds - lastSavedSecondRef.current) < 5
      ) {
        return;
      }

      lastSavedSecondRef.current = positionSeconds;

      const youtubeDuration = Number(player.getDuration?.()) || 0;
      const fallbackDuration = Math.max(Number(durationMinutes) * 60, 1);
      const totalSeconds =
        youtubeDuration > 0 ? youtubeDuration : fallbackDuration;

      const progressPercent = Math.min(
        99.9,
        Math.max(0, (positionSeconds / totalSeconds) * 100)
      );

      onProgressRef.current?.({
        positionSeconds,
        progressPercent,
      });
    }

    async function createPlayer() {
      try {
        const YT = await loadYouTubeIframeApi();

        if (cancelled || !mountRef.current) return;

        playerRef.current = new YT.Player(mountRef.current, {
          videoId,
          width: "100%",
          height: "100%",
          playerVars: {
            autoplay: 1,
            controls: 1,
            rel: 0,
            playsinline: 1,
            enablejsapi: 1,
            origin: window.location.origin,
          },
          events: {
            onReady: (event) => {
              const resumeAt = Math.max(0, Number(initialSeconds) || 0);

              if (resumeAt > 0) {
                event.target.seekTo(resumeAt, true);
              }

              event.target.playVideo();
            },

            onStateChange: (event) => {
              if (event.data === YT.PlayerState.PLAYING) {
                stopProgressTimer();

                intervalRef.current = window.setInterval(() => {
                  emitProgress(false);
                }, 10000);
              }

              if (event.data === YT.PlayerState.PAUSED) {
                stopProgressTimer();
                emitProgress(true);
              }

              if (event.data === YT.PlayerState.ENDED) {
                endedRef.current = true;
                stopProgressTimer();
                onEndedRef.current?.();
              }
            },

            onError: () => {
              stopProgressTimer();
              setPlayerError(
                "This workout video could not be played inside Anandam. Please try another workout."
              );
            },
          },
        });
      } catch (error) {
        if (!cancelled) {
          setPlayerError(
            error?.message || "Unable to initialise the YouTube player."
          );
        }
      }
    }

    createPlayer();

    return () => {
      cancelled = true;
      stopProgressTimer();

      if (!endedRef.current) {
        try {
          emitProgress(true);
        } catch {
          // Progress saving on unmount is best effort.
        }
      }

      try {
        playerRef.current?.destroy?.();
      } catch {
        // Ignore YouTube cleanup errors.
      }

      playerRef.current = null;
    };
  }, [videoId, initialSeconds, durationMinutes]);

  if (playerError) {
    return <div className="fitness-video-error">{playerError}</div>;
  }

  return (
    <div
      ref={mountRef}
      className="fitness-youtube-player"
      aria-label="Workout video player"
    />
  );
}

function GuidedWorkoutDetail({
  workout,
  activeSession,
  onBack,
  onSessionUpdate,
  onCompleted,
}) {
  const [session, setSession] = useState(activeSession || null);
  const sessionRef = useRef(activeSession || null);

  const [playing, setPlaying] = useState(false);
  const [starting, setStarting] = useState(false);
  const [completing, setCompleting] = useState(false);
  const [error, setError] = useState("");

  const completingRef = useRef(false);

  useEffect(() => {
    const nextSession = activeSession || null;
    setSession(nextSession);
    sessionRef.current = nextSession;
    setPlaying(false);
    setError("");
    completingRef.current = false;
  }, [activeSession, workout?.id]);

  const setLiveSession = useCallback(
    (nextSession) => {
      sessionRef.current = nextSession;
      setSession(nextSession);
      onSessionUpdate?.(nextSession);
    },
    [onSessionUpdate]
  );

  const ensureSession = useCallback(async () => {
    if (sessionRef.current?.id) {
      return sessionRef.current;
    }

    setStarting(true);
    setError("");

    try {
      const created = await startFitnessWorkout(workout.id, []);
      setLiveSession(created);
      return created;
    } finally {
      setStarting(false);
    }
  }, [workout?.id, setLiveSession]);

  async function handlePlay() {
    if (!workout?.youtubeVideoId || starting) return;

    try {
      await ensureSession();
      setPlaying(true);
    } catch (startError) {
      setError(
        getFitnessErrorMessage(
          startError,
          "We couldn't start this workout."
        )
      );
    }
  }

  async function handleProgress(progress) {
    const currentSession = sessionRef.current;
    if (!currentSession?.id) return;

    try {
      const updated = await updateFitnessProgress(
        currentSession.id,
        progress
      );

      setLiveSession(updated);
    } catch (progressError) {
      console.error("Fitness progress save failed:", progressError);
    }
  }

  async function handleEnded() {
    if (completingRef.current) return;

    completingRef.current = true;
    setCompleting(true);
    setError("");

    try {
      const currentSession =
        sessionRef.current?.id
          ? sessionRef.current
          : await ensureSession();

      const completed = await completeFitnessSession(currentSession.id);
      setLiveSession(completed);
      onCompleted(completed);
    } catch (completeError) {
      completingRef.current = false;

      setError(
        getFitnessErrorMessage(
          completeError,
          "The video ended, but we couldn't save workout completion. Please try again."
        )
      );
    } finally {
      setCompleting(false);
    }
  }

  const hasVideo = Boolean(workout?.youtubeVideoId);

  return (
    <div className="fitness-detail-page">
      <BackButton onClick={onBack} />

      <div className="fitness-detail-heading">
        <h1>{workout.title}</h1>
        <p>{workout.shortDescription}</p>
      </div>

      {error ? (
        <div className="fitness-inline-error">{error}</div>
      ) : null}

      <div className="fitness-guided-hero">
        {playing && hasVideo ? (
          <YouTubeWorkoutPlayer
            videoId={workout.youtubeVideoId}
            initialSeconds={sessionRef.current?.positionSeconds || 0}
            durationMinutes={workout.durationMinutes}
            onProgress={handleProgress}
            onEnded={handleEnded}
          />
        ) : (
          <>
            <FitnessImage
              src={workout.thumbnailUrl}
              alt={workout.title}
              className="fitness-guided-hero__media"
            />

            {hasVideo ? (
              <button
                type="button"
                className="fitness-play-button"
                onClick={handlePlay}
                disabled={starting}
                aria-label={
                  session?.id
                    ? "Resume workout video"
                    : "Start workout video"
                }
              >
                <span>
                  {starting ? (
                    <RefreshCw size={25} className="fitness-spin" />
                  ) : (
                    <Play size={25} fill="currentColor" />
                  )}
                </span>
              </button>
            ) : (
              <div className="fitness-video-unavailable">
                No YouTube video is configured for this workout.
              </div>
            )}
          </>
        )}

        {completing ? (
          <div className="fitness-video-saving">
            Saving workout completion...
          </div>
        ) : null}
      </div>

      <div className="fitness-detail-meta-row">
        <div>
          <span className="fitness-soft-tag is-blue">
            {formatEnum(workout.category)}
          </span>
          <DifficultyBadge difficulty={workout.difficulty} />
        </div>

        <strong>{workout.durationMinutes} Min</strong>
      </div>

      <section className="fitness-detail-copy">
        <h2>About the exercise</h2>
        <p>{workout.about}</p>
      </section>

      <section className="fitness-benefits-section">
        <h2>Benefits</h2>

        <div className="fitness-benefits-grid">
          {(workout.benefits || []).map((benefit) => (
            <div key={benefit} className="fitness-benefit-item">
              <span className="fitness-check-circle">
                <Check size={15} />
              </span>
              <span>{benefit}</span>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

function VrWorkoutDetail({ workout, activeSession, onBack, onBegin }) {
  const [checkedItems, setCheckedItems] = useState(
    () => new Set(activeSession?.confirmedEquipment || [])
  );

  const [starting, setStarting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    setCheckedItems(
      new Set(activeSession?.confirmedEquipment || [])
    );
    setError("");
  }, [activeSession, workout?.id]);

  const required = workout.requiredEquipment || [];
  const allChecked = required.every((item) => checkedItems.has(item));

  function toggleEquipment(item) {
    setCheckedItems((current) => {
      const next = new Set(current);

      if (next.has(item)) next.delete(item);
      else next.add(item);

      return next;
    });
  }

  async function handleBegin() {
    if (!allChecked || starting) return;

    setStarting(true);
    setError("");

    try {
      const session = await startFitnessWorkout(
        workout.id,
        [...checkedItems]
      );

      onBegin(session);
    } catch (startError) {
      setError(
        getFitnessErrorMessage(
          startError,
          "We couldn't start this VR workout."
        )
      );
    } finally {
      setStarting(false);
    }
  }

  return (
    <div className="fitness-detail-page fitness-vr-detail-page">
      <BackButton onClick={onBack} />

      <div className="fitness-detail-heading">
        <h1>{workout.title}</h1>
        <p>{workout.shortDescription}</p>
      </div>

      {error ? (
        <div className="fitness-inline-error">{error}</div>
      ) : null}

      <div className="fitness-vr-detail-layout">
        <section className="fitness-vr-detail-main">
          <FitnessImage
            src={workout.thumbnailUrl}
            alt={workout.title}
            className="fitness-vr-detail-image"
          />

          <div className="fitness-vr-about">
            <h2>About the exercise</h2>
            <p>{workout.about}</p>
          </div>

          {(workout.beforeYouBegin || []).length ? (
            <div className="fitness-before-you-begin">
              <strong>Before you begin</strong>

              <ul>
                {(workout.beforeYouBegin || []).map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </div>
          ) : null}
        </section>

        <aside className="fitness-equipment-card">
          <h2>Equipment checklist</h2>
          <p>
            Confirm that each required item is available before beginning.
          </p>

          {required.length ? (
            <div className="fitness-checklist">
              {required.map((item) => {
                const checked = checkedItems.has(item);

                return (
                  <label className="fitness-equipment-option" key={item}>
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={() => toggleEquipment(item)}
                    />

                    <span
                      className={`fitness-checkbox${
                        checked ? " is-checked" : ""
                      }`}
                    >
                      {checked ? <Check size={13} /> : null}
                    </span>

                    <span>{item}</span>
                  </label>
                );
              })}
            </div>
          ) : (
            <div className="fitness-no-equipment">
              No special equipment is required.
            </div>
          )}

          <div className="fitness-equipment-hint">
            <Info size={16} />
            <span>
              {required.length
                ? "Confirm all required equipment to continue."
                : "You can begin when you are ready."}
            </span>
          </div>

          <button
            type="button"
            className="fitness-primary-button fitness-begin-vr-button"
            disabled={!allChecked || starting}
            onClick={handleBegin}
          >
            {starting ? "Starting..." : "Begin VR Workout"}
          </button>
        </aside>
      </div>
    </div>
  );
}

function VrSessionView({ workout, session, onBack, onComplete }) {
  const [working, setWorking] = useState(false);
  const [error, setError] = useState("");

  async function handleComplete() {
    if (!session?.id || working) return;

    setWorking(true);
    setError("");

    try {
      const completed = await completeFitnessSession(session.id);
      onComplete(completed);
    } catch (completeError) {
      setError(
        getFitnessErrorMessage(
          completeError,
          "We couldn't complete this VR session."
        )
      );
    } finally {
      setWorking(false);
    }
  }

  return (
    <div className="fitness-detail-page">
      <BackButton onClick={onBack} />

      <div className="fitness-detail-heading">
        <h1>{workout.title}</h1>
        <p>Complete the VR workout without leaving the Anandam flow.</p>
      </div>

      {error ? (
        <div className="fitness-inline-error">{error}</div>
      ) : null}

      <section className="fitness-vr-launch-card">
        {workout.vrLaunchUrl ? (
          <iframe
            title={workout.title}
            src={workout.vrLaunchUrl}
            className="fitness-vr-iframe"
            allow="fullscreen; xr-spatial-tracking; autoplay"
          />
        ) : (
          <div className="fitness-empty-state fitness-empty-state--embedded">
            <Gamepad2 size={34} />
            <strong>VR launch URL is not configured.</strong>
            <span>
              Add vrLaunchUrl to this workout in the backend to launch the VR
              experience here.
            </span>
          </div>
        )}

        <div className="fitness-vr-session-actions">
          <button
            type="button"
            className="fitness-primary-button"
            onClick={handleComplete}
            disabled={working}
          >
            {working ? "Saving..." : "Complete VR Session"}
          </button>
        </div>
      </section>
    </div>
  );
}

function CompleteScreen({ type, title, onBackToList }) {
  const guided = type === "GUIDED";

  return (
    <div className="fitness-complete-card">
      <div className="fitness-complete-icon" aria-hidden="true">
        <Check size={34} strokeWidth={2} />
      </div>

      <h1>
        {guided ? "Guided Workout Complete" : "VR Session Complete"}
      </h1>

      <p>
        Great work—you completed <strong>{title}</strong>.
      </p>

      <button
        type="button"
        className="fitness-primary-button fitness-complete-primary"
        onClick={onBackToList}
      >
        {guided ? "Back to Guided Workouts" : "Back to VR Workouts"}
      </button>
    </div>
  );
}

function FitnessPage() {
  const [activeTab, setActiveTab] = useState("overview");
  const [view, setView] = useState("main");

  const [overview, setOverview] = useState(null);
  const [overviewLoading, setOverviewLoading] = useState(true);
  const [overviewError, setOverviewError] = useState("");
  const [endingSession, setEndingSession] = useState(false);

  const [guidedWorkouts, setGuidedWorkouts] = useState([]);
  const [guidedLoading, setGuidedLoading] = useState(false);
  const [guidedError, setGuidedError] = useState("");
  const [guidedFilters, setGuidedFilters] = useState({
    category: "ALL",
    duration: "",
    difficulty: "",
  });

  const [vrWorkouts, setVrWorkouts] = useState([]);
  const [vrLoading, setVrLoading] = useState(false);
  const [vrError, setVrError] = useState("");

  const [historyRows, setHistoryRows] = useState([]);
  const [historyPagination, setHistoryPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 1,
  });
  const [historyLoading, setHistoryLoading] = useState(false);
  const [historyError, setHistoryError] = useState("");

  const [detailLoading, setDetailLoading] = useState(false);
  const [detailError, setDetailError] = useState("");
  const [selectedWorkout, setSelectedWorkout] = useState(null);
  const [selectedSession, setSelectedSession] = useState(null);
  const [completedSession, setCompletedSession] = useState(null);

  const loadOverview = useCallback(async () => {
    setOverviewLoading(true);
    setOverviewError("");

    try {
      const data = await getFitnessOverview();
      setOverview(data);
    } catch (error) {
      setOverviewError(
        getFitnessErrorMessage(
          error,
          "We couldn't load your fitness overview."
        )
      );
    } finally {
      setOverviewLoading(false);
    }
  }, []);

  const loadGuidedWorkouts = useCallback(async () => {
    setGuidedLoading(true);
    setGuidedError("");

    const duration = getDurationFilter(guidedFilters.duration);

    try {
      const data = await getFitnessWorkouts({
        type: "GUIDED",
        category: guidedFilters.category,
        difficulty: guidedFilters.difficulty,
        ...duration,
      });

      setGuidedWorkouts(Array.isArray(data) ? data : []);
    } catch (error) {
      setGuidedError(
        getFitnessErrorMessage(
          error,
          "We couldn't load guided workouts."
        )
      );
    } finally {
      setGuidedLoading(false);
    }
  }, [guidedFilters]);

  const loadVrWorkouts = useCallback(async () => {
    setVrLoading(true);
    setVrError("");

    try {
      const data = await getFitnessWorkouts({ type: "VR" });
      setVrWorkouts(Array.isArray(data) ? data : []);
    } catch (error) {
      setVrError(
        getFitnessErrorMessage(
          error,
          "We couldn't load VR workouts."
        )
      );
    } finally {
      setVrLoading(false);
    }
  }, []);

  const loadHistory = useCallback(async (page = 1) => {
    setHistoryLoading(true);
    setHistoryError("");

    try {
      const response = await getFitnessHistory({
        page,
        limit: 20,
      });

      setHistoryRows(
        Array.isArray(response?.data) ? response.data : []
      );

      setHistoryPagination(
        response?.pagination || {
          page,
          limit: 20,
          total: 0,
          totalPages: 1,
        }
      );
    } catch (error) {
      setHistoryError(
        getFitnessErrorMessage(
          error,
          "We couldn't load activity history."
        )
      );
    } finally {
      setHistoryLoading(false);
    }
  }, []);

  useEffect(() => {
    loadOverview();
  }, [loadOverview]);

  useEffect(() => {
    if (activeTab === "guided" && view === "main") {
      loadGuidedWorkouts();
    }
  }, [activeTab, view, loadGuidedWorkouts]);

  useEffect(() => {
    if (activeTab === "vr" && view === "main") {
      loadVrWorkouts();
    }
  }, [activeTab, view, loadVrWorkouts]);

  useEffect(() => {
    if (activeTab === "history" && view === "main") {
      loadHistory(historyPagination.page || 1);
    }
  }, [
    activeTab,
    view,
    historyPagination.page,
    loadHistory,
  ]);

  async function openWorkout(workout, type) {
    const key = workout?.id || workout?.slug;
    if (!key) return;

    setDetailLoading(true);
    setDetailError("");

    try {
      const detail = await getFitnessWorkoutById(key);

      setSelectedWorkout(detail?.workout || workout);
      setSelectedSession(detail?.activeSession || null);
      setCompletedSession(null);
      setView(type === "VR" ? "vr-detail" : "guided-detail");
    } catch (error) {
      setDetailError(
        getFitnessErrorMessage(
          error,
          "We couldn't open this workout."
        )
      );
    } finally {
      setDetailLoading(false);
    }
  }

  async function handleResumeOverview() {
    const session = overview?.continueWorkout;
    if (!session?.workout) return;

    await openWorkout(session.workout, session.workout.type);
  }

  async function handleEndOverview() {
    const sessionId = overview?.continueWorkout?.id;
    if (!sessionId || endingSession) return;

    setEndingSession(true);
    setOverviewError("");

    try {
      await endFitnessSession(sessionId);
      await loadOverview();
    } catch (error) {
      setOverviewError(
        getFitnessErrorMessage(
          error,
          "We couldn't end this workout."
        )
      );
    } finally {
      setEndingSession(false);
    }
  }

  function handleMainTabChange(tabId) {
    setView("main");
    setActiveTab(tabId);
    setDetailError("");

    if (tabId === "history") {
      setHistoryPagination((current) => ({
        ...current,
        page: 1,
      }));
    }
  }

  async function handleGuidedCompleted(session) {
    setCompletedSession(session);
    setSelectedSession(session);
    setView("guided-complete");

    await Promise.all([
      loadOverview(),
      loadHistory(1),
    ]);
  }

  function handleVrBegin(session) {
    setSelectedSession(session);
    setView("vr-session");
  }

  async function handleVrCompleted(session) {
    setCompletedSession(session);
    setSelectedSession(session);
    setView("vr-complete");

    await Promise.all([
      loadOverview(),
      loadHistory(1),
    ]);
  }

  const completionTitle = useMemo(() => {
    return (
      completedSession?.workout?.title ||
      selectedWorkout?.title ||
      "Workout"
    );
  }, [completedSession, selectedWorkout]);

  if (detailLoading) {
    return (
      <AppLayout>
        <div className="fitness-page">
          <PageLoader label="Opening workout..." />
        </div>
      </AppLayout>
    );
  }

  if (detailError && view === "main") {
    return (
      <AppLayout>
        <div className="fitness-page">
          <FitnessHeader
            activeTab={activeTab}
            onTabChange={handleMainTabChange}
          />

          <div className="fitness-tab-panel">
            <PageError
              message={detailError}
              onRetry={() => setDetailError("")}
            />
          </div>
        </div>
      </AppLayout>
    );
  }

  if (view === "guided-detail" && selectedWorkout) {
    return (
      <AppLayout>
        <div className="fitness-page">
          <GuidedWorkoutDetail
            workout={selectedWorkout}
            activeSession={selectedSession}
            onBack={() => {
              setView("main");
              setActiveTab("guided");
              loadOverview();
            }}
            onSessionUpdate={setSelectedSession}
            onCompleted={handleGuidedCompleted}
          />
        </div>
      </AppLayout>
    );
  }

  if (view === "guided-complete") {
    return (
      <AppLayout>
        <div className="fitness-page fitness-page--completion">
          <CompleteScreen
            type="GUIDED"
            title={completionTitle}
            onBackToList={() => {
              setView("main");
              setActiveTab("guided");
            }}
          />
        </div>
      </AppLayout>
    );
  }

  if (view === "vr-detail" && selectedWorkout) {
    return (
      <AppLayout>
        <div className="fitness-page">
          <VrWorkoutDetail
            workout={selectedWorkout}
            activeSession={selectedSession}
            onBack={() => {
              setView("main");
              setActiveTab("vr");
            }}
            onBegin={handleVrBegin}
          />
        </div>
      </AppLayout>
    );
  }

  if (
    view === "vr-session" &&
    selectedWorkout &&
    selectedSession
  ) {
    return (
      <AppLayout>
        <div className="fitness-page">
          <VrSessionView
            workout={selectedWorkout}
            session={selectedSession}
            onBack={() => {
              setView("main");
              setActiveTab("vr");
              loadOverview();
            }}
            onComplete={handleVrCompleted}
          />
        </div>
      </AppLayout>
    );
  }

  if (view === "vr-complete") {
    return (
      <AppLayout>
        <div className="fitness-page fitness-page--completion">
          <CompleteScreen
            type="VR"
            title={completionTitle}
            onBackToList={() => {
              setView("main");
              setActiveTab("vr");
            }}
          />
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="fitness-page">
        <FitnessHeader
          activeTab={activeTab}
          onTabChange={handleMainTabChange}
        />

        {activeTab === "overview" ? (
          <OverviewTab
            overview={overview}
            loading={overviewLoading}
            error={overviewError}
            ending={endingSession}
            onRetry={loadOverview}
            onResume={handleResumeOverview}
            onEnd={handleEndOverview}
            onViewAll={() => handleMainTabChange("history")}
          />
        ) : null}

        {activeTab === "guided" ? (
          <GuidedWorkoutTab
            workouts={guidedWorkouts}
            loading={guidedLoading}
            error={guidedError}
            filters={guidedFilters}
            onFiltersChange={setGuidedFilters}
            onRetry={loadGuidedWorkouts}
            onOpen={(workout) => openWorkout(workout, "GUIDED")}
          />
        ) : null}

        {activeTab === "vr" ? (
          <VrWorkoutTab
            workouts={vrWorkouts}
            loading={vrLoading}
            error={vrError}
            onRetry={loadVrWorkouts}
            onOpen={(workout) => openWorkout(workout, "VR")}
          />
        ) : null}

        {activeTab === "history" ? (
          <ActivityHistoryTab
            rows={historyRows}
            pagination={historyPagination}
            loading={historyLoading}
            error={historyError}
            onRetry={() =>
              loadHistory(historyPagination.page || 1)
            }
            onPageChange={(page) =>
              setHistoryPagination((current) => ({
                ...current,
                page,
              }))
            }
          />
        ) : null}
      </div>
    </AppLayout>
  );
}

export default FitnessPage;
