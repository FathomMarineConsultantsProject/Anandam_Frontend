import {
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  Clock3,
  Play,
  Search,
  RefreshCw,
} from "lucide-react";

import {
  useLocation,
  useNavigate,
} from "react-router-dom";

import AppLayout from "../components/layout/AppLayout";

import {
  getSleepAudioTracks,
  getSleepAudioErrorMessage,
} from "../api/sleepAudioApi";

import {
  getSavedSleepProgress,
  getSleepProgressPercent,
} from "../utils/sleepPlayback";

import "../styles/sleep-stories.css";

import {
  getSleepTrackIllustration,
} from "../utils/sleepStoryAssets";


const ROOT_ROUTE =
  "/app/sleep-stories";


function getTrackType(track) {
  const category = String(
    track?.category ||
    track?.contentCategory ||
    ""
  )
    .trim()
    .toUpperCase()
    .replace(/[\s-]+/g, "_");

  // =========================
  // SLEEP SOUNDS
  // =========================
  if (
    category === "SOUND" ||
    category === "SLEEP_SOUND" ||
    category === "SLEEP_SOUNDS" ||
    category === "AMBIENT" ||
    category === "MUSIC"
  ) {
    return "sounds";
  }

  // =========================
  // SLEEP STORIES
  // =========================
  if (
    category === "STORY" ||
    category === "SLEEP_STORY" ||
    category === "SLEEP_STORIES"
  ) {
    return "stories";
  }

  // Unknown category should NOT accidentally
  // appear inside Stories.
  return null;
}


function getTrackDescription(track) {
  return (
    track?.shortDescription ||
    track?.description ||
    track?.subtitle ||
    "Settle in with something calm and relaxing."
  );
}


function getTrackAuthor(track) {
  return (
    track?.authorName ||
    track?.narrator ||
    track?.author ||
    track?.creatorName ||
    "Anandam"
  );
}


function getTrackDurationMinutes(track) {
  const explicit =
    Number(track?.durationMinutes);

  if (explicit > 0) {
    return Math.round(explicit);
  }

  const seconds =
    Number(track?.durationSeconds);

  if (seconds > 0) {
    return Math.ceil(seconds / 60);
  }

  return null;
}

function TrackArtwork({
  track,
}) {
  const [
    presetFailed,
    setPresetFailed,
  ] = useState(false);

  const [
    backendFailed,
    setBackendFailed,
  ] = useState(false);


  const trackType =
    getTrackType(track);


  /*
    ----------------------------------------------------------
    PRESET ANANDAM ARTWORK
    ----------------------------------------------------------

    stories -> assets/sleep stories
    sounds  -> assets/sleep sounds
  */

  const presetArtwork =
    getSleepTrackIllustration(
      track,
      trackType
    );


  if (
    presetArtwork &&
    !presetFailed
  ) {
    return (
      <img
        src={presetArtwork}
        alt=""
        aria-hidden="true"
        className={[
          "sleep-track-card__image",

          trackType === "stories"
            ? "sleep-track-card__image--story"
            : "",

          trackType === "sounds"
            ? "sleep-track-card__image--sound"
            : "",
        ]
          .filter(Boolean)
          .join(" ")}
        onError={() =>
          setPresetFailed(true)
        }
      />
    );
  }


  /*
    ----------------------------------------------------------
    BACKEND THUMBNAIL FALLBACK
    ----------------------------------------------------------

    Only used if no preset image exists or the local image
    could not load.
  */

  if (
    track?.thumbnailUrl &&
    !backendFailed
  ) {
    return (
      <img
        src={track.thumbnailUrl}
        alt=""
        aria-hidden="true"
        className="sleep-track-card__image"
        onError={() =>
          setBackendFailed(true)
        }
      />
    );
  }


  /*
    ----------------------------------------------------------
    LAST FALLBACK
    ----------------------------------------------------------
  */

  return (
    <div
      className="
        sleep-track-card__image
        sleep-track-card__image--fallback
      "
      aria-hidden="true"
    >
      <div className="sleep-mini-wave">
        {Array.from(
          {
            length: 18,
          },
          (_, index) => (
            <span
              key={index}
              style={{
                height: `${
                  18 +
                  Math.abs(
                    Math.sin(
                      index * 0.72
                    )
                  ) *
                    44
                }%`,
              }}
            />
          )
        )}
      </div>
    </div>
  );
}

function TrackCard({
  track,
  onListen,
}) {
  const duration =
    getTrackDurationMinutes(
      track
    );

  return (
    <article className="sleep-track-card">
      <div className="sleep-track-card__main">
        <TrackArtwork
          track={track}
        />

        <div className="sleep-track-card__content">
          <div className="sleep-track-card__copy">
            <h2>
              {track?.title ||
                "Untitled audio"}
            </h2>

            <p>
              {getTrackDescription(
                track
              )}
            </p>
          </div>

          <div className="sleep-track-card__meta">
            <span>
              By{" "}
              {getTrackAuthor(
                track
              )}
            </span>

            {duration ? (
              <span className="sleep-track-card__duration">
                <Clock3
                  size={16}
                  strokeWidth={1.5}
                />
                {duration} min
              </span>
            ) : null}
          </div>
        </div>
      </div>

      <button
        type="button"
        className="sleep-listen-button"
        onClick={() =>
          onListen(track)
        }
      >
        <Play
          size={16}
          fill="currentColor"
        />
        Listen
      </button>
    </article>
  );
}


function ContinueListening({
  track,
  progress,
  onResume,
}) {
  if (!track || !progress) {
    return null;
  }

  const percent =
    getSleepProgressPercent(
      progress
    );

  const remainingSeconds =
    Math.max(
      0,
      Number(
        progress.durationSeconds
      ) -
        Number(
          progress.positionSeconds
        )
    );

  const remainingMinutes =
    Math.max(
      1,
      Math.ceil(
        remainingSeconds / 60
      )
    );

  return (
    <section className="sleep-continue-section">
      <div className="sleep-section-label">
        Continue listening
      </div>

      <article className="sleep-continue-card">
        <TrackArtwork
          track={track}
        />

        <div className="sleep-continue-card__content">
          <div className="sleep-continue-card__top">
            <div>
              <h2>
                {track.title}
              </h2>

              <p>
                Pick up where you
                left off
              </p>
            </div>

            <button
              type="button"
              className="sleep-listen-button"
              onClick={() =>
                onResume(track)
              }
            >
              <Play
                size={15}
                fill="currentColor"
              />
              {getTrackType(track) === "sounds"
  ? "Continue sound"
  : "Continue story"}
            </button>
          </div>

          <div className="sleep-continue-progress">
            <span
              style={{
                width: `${percent}%`,
              }}
            />
          </div>

          <div className="sleep-continue-card__bottom">
            <span>
              {Math.round(
                percent
              )}
              % listened
            </span>

            <span>
              About{" "}
              {remainingMinutes} min
              left
            </span>
          </div>
        </div>
      </article>
    </section>
  );
}


export default function SleepStoriesPage() {
  const navigate =
    useNavigate();

  const location =
    useLocation();

  const [
    tracks,
    setTracks,
  ] = useState([]);

  const [
    activeTab,
    setActiveTab,
  ] = useState("stories");

  const [
    query,
    setQuery,
  ] = useState("");

  const [
    loading,
    setLoading,
  ] = useState(true);

  const [
    error,
    setError,
  ] = useState("");

  const [
    savedProgress,
    setSavedProgress,
  ] = useState(
    getSavedSleepProgress()
  );


  useEffect(() => {
    let cancelled = false;

    async function loadTracks() {
      setLoading(true);
      setError("");

      try {
        const data =
          await getSleepAudioTracks();

        if (!cancelled) {
          setTracks(
            Array.isArray(data)
              ? data
              : []
          );
        }
      } catch (loadError) {
        if (!cancelled) {
          setError(
            getSleepAudioErrorMessage(
              loadError,
              "We couldn't load Sleep Stories right now."
            )
          );
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    loadTracks();

    return () => {
      cancelled = true;
    };
  }, []);


  useEffect(() => {
    setSavedProgress(
      getSavedSleepProgress()
    );
  }, [location.key]);


  const visibleTracks =
    useMemo(() => {
      const search =
        query
          .trim()
          .toLowerCase();

      return tracks.filter(
        (track) => {
          if (
            getTrackType(
              track
            ) !== activeTab
          ) {
            return false;
          }

          if (!search) {
            return true;
          }

          const searchable =
            [
              track?.title,
              getTrackDescription(
                track
              ),
              getTrackAuthor(
                track
              ),
            ]
              .filter(Boolean)
              .join(" ")
              .toLowerCase();

          return searchable.includes(
            search
          );
        }
      );
    }, [
      tracks,
      activeTab,
      query,
    ]);


  const continueTrack =
    useMemo(() => {
      if (
        !savedProgress?.slug ||
        Number(
          savedProgress.positionSeconds
        ) < 5
      ) {
        return null;
      }

      return (
        tracks.find(
          (track) =>
            track.slug ===
            savedProgress.slug
        ) || null
      );
    }, [
      tracks,
      savedProgress,
    ]);


  function openTrack(track) {
    if (!track?.slug) {
      return;
    }

    navigate(
      `${ROOT_ROUTE}/${encodeURIComponent(
        track.slug
      )}`
    );
  }


  function resumeTrack(track) {
    if (!track?.slug) {
      return;
    }

    navigate(
      `${ROOT_ROUTE}/${encodeURIComponent(
        track.slug
      )}?resume=1`
    );
  }


  return (
    <AppLayout>
      <main className="sleep-stories-page">
        <header className="sleep-stories-heading">
          <h1>
            Sleep Stories
          </h1>

          <p>
            Settle in with a
            gentle story or calming
            sounds.
          </p>
        </header>

        <div className="sleep-stories-tabs">
          <button
            type="button"
            className={
              activeTab ===
              "stories"
                ? "is-active"
                : ""
            }
            onClick={() => {
              setActiveTab(
                "stories"
              );
              setQuery("");
            }}
          >
            Stories
          </button>

          <button
            type="button"
            className={
              activeTab ===
              "sounds"
                ? "is-active"
                : ""
            }
            onClick={() => {
              setActiveTab(
                "sounds"
              );
              setQuery("");
            }}
          >
            Sleep Sounds
          </button>
        </div>

        <label className="sleep-search">
          <Search
            size={23}
            strokeWidth={1.5}
          />

          <input
            type="search"
            value={query}
            onChange={(event) =>
              setQuery(
                event.target.value
              )
            }
            placeholder={
              activeTab ===
              "sounds"
                ? "Search sleep sounds"
                : "Search sleep stories"
            }
          />
        </label>

        {continueTrack &&
        getTrackType(
          continueTrack
        ) === activeTab ? (
          <ContinueListening
            track={
              continueTrack
            }
            progress={
              savedProgress
            }
            onResume={
              resumeTrack
            }
          />
        ) : null}

        {error ? (
          <div className="sleep-error-panel">
            <span>{error}</span>

            <button
              type="button"
              onClick={() =>
                window.location.reload()
              }
            >
              <RefreshCw
                size={15}
              />
              Retry
            </button>
          </div>
        ) : null}

        {loading ? (
          <div className="sleep-track-list">
            {Array.from(
              { length: 5 },
              (_, index) => (
                <div
                  className="sleep-track-skeleton"
                  key={index}
                />
              )
            )}
          </div>
        ) : (
          <div className="sleep-track-list">
            {visibleTracks.map(
              (track) => (
                <TrackCard
                  key={
                    track.id ||
                    track.slug
                  }
                  track={track}
                  onListen={
                    openTrack
                  }
                />
              )
            )}
          </div>
        )}

        {!loading &&
        !error &&
        visibleTracks.length ===
          0 ? (
          <div className="sleep-empty-state">
            <h2>
              Nothing here yet
            </h2>

            <p>
              {query
                ? "Try another search."
                : activeTab ===
                  "sounds"
                ? "Sleep sounds will appear here when they are available."
                : "Sleep stories will appear here when they are available."}
            </p>
          </div>
        ) : null}
      </main>
    </AppLayout>
  );
}