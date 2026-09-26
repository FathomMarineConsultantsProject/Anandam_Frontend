import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import {
  Clock3,
  Music2,
  Volume2,
  VolumeX,
} from "lucide-react";

import { useNavigate } from "react-router-dom";

import AppLayout from "../components/layout/AppLayout";

import {
  getBreathingTracks,
} from "../api/breathingApi";

import "../styles/breathing.css";

/* =========================================================
   ASSETS
   Everything inside:
   src/assets/breathing/
   ========================================================= */

const breathingAssetModules =
  import.meta.glob(
    "../assets/breathing/*.{png,jpg,jpeg,webp,svg}",
    {
      eager: true,
      import: "default",
    }
  );

const breathingAssetEntries =
  Object.entries(
    breathingAssetModules
  );

function findBreathingAsset(
  keywords = [],
  fallbackIndex = -1
) {
  for (
    const keyword of keywords
  ) {
    const match =
      breathingAssetEntries.find(
        ([path]) =>
          path
            .toLowerCase()
            .includes(
              keyword.toLowerCase()
            )
      );

    if (match) {
      return match[1];
    }
  }

  if (
    fallbackIndex >= 0 &&
    breathingAssetEntries[
      fallbackIndex
    ]
  ) {
    return breathingAssetEntries[
      fallbackIndex
    ][1];
  }

  return "";
}

/*
  These search your breathing folder automatically.

  The keywords mean you don't need exact filenames,
  as long as your files contain words like:
  ready, lung, mouth, complete etc.
*/

const SETUP_IMAGE =
  findBreathingAsset(
    [
      "meditation",
      "breathing-main",
      "breathing main",
      "start",
      "woman",
    ],
    0
  );

const READY_IMAGE =
  findBreathingAsset(
    [
      "ready",
      "question",
      "thinking",
    ],
    1
  );

const MOUTH_IMAGE =
  findBreathingAsset([
    "mouth",
    "nose",
    "face",
  ]);

const LUNGS_IMAGE =
  findBreathingAsset([
    "lung",
    "lungs",
  ]);

const BREATHING_COMBINED_IMAGE =
  findBreathingAsset([
    "breath",
    "anatomy",
    "inhale",
  ]);

const COMPLETE_IMAGE =
  findBreathingAsset(
    [
      "complete",
      "completed",
      "last",
      "done",
    ],
    breathingAssetEntries.length -
      1
  );

/* =========================================================
   SESSION DURATIONS
   ========================================================= */

const SESSION_DURATIONS = [
  {
    value: 2,
    label: "2 minutes",
  },
  {
    value: 5,
    label: "5 minutes",
  },
  {
    value: 10,
    label: "10 minutes",
  },
  {
    value: 15,
    label: "15 minutes",
  },
];

/* =========================================================
   BREATHING RHYTHM

   Calm breathing:
   4 sec inhale
   2 sec hold
   6 sec exhale
   2 sec hold

   The visual animation is calculated using exactly
   these same timings.
   ========================================================= */

const BREATH_PHASES = [
  {
    id: "inhale",

    label: "BREATHE IN",

    durationMs: 4000,

    fromScale: 0.88,

    toScale: 1.13,
  },

  {
    id: "hold-in",

    label: "HOLD",

    durationMs: 2000,

    fromScale: 1.13,

    toScale: 1.13,
  },

  {
    id: "exhale",

    label: "BREATHE OUT",

    durationMs: 6000,

    fromScale: 1.13,

    toScale: 0.88,
  },

  {
    id: "hold-out",

    label: "HOLD",

    durationMs: 2000,

    fromScale: 0.88,

    toScale: 0.88,
  },
];

/* =========================================================
   MUSIC DISPLAY NAMES

   Your BE currently saves generic names like:
   Breathing Background 01.

   FE presents cleaner user-facing names.
   ========================================================= */

const FRIENDLY_TRACK_NAMES = {
  "breathing-background-01":
    "Soft piano",

  "breathing-background-02":
    "Ocean rain",

  "breathing-background-03":
    "Gentle music",

  "breathing-background-04":
    "Forest music",

  "breathing-background-05":
    "Bird chirping",
};

function getTrackDisplayName(
  track,
  index
) {
  if (!track) {
    return "";
  }

  if (
    FRIENDLY_TRACK_NAMES[
      track.slug
    ]
  ) {
    return FRIENDLY_TRACK_NAMES[
      track.slug
    ];
  }

  const fallbackNames = [
    "Soft piano",
    "Ocean rain",
    "Gentle music",
    "Forest music",
    "Bird chirping",
  ];

  return (
    fallbackNames[index] ||
    track.title ||
    "Calming music"
  );
}

/* =========================================================
   HELPERS
   ========================================================= */

function clamp(
  value,
  minimum,
  maximum
) {
  return Math.min(
    maximum,
    Math.max(
      minimum,
      value
    )
  );
}

function smoothProgress(value) {
  const progress =
    clamp(value, 0, 1);

  /*
    Smooth sine interpolation.
    Avoids sharp animation starts/stops.
  */

  return (
    0.5 -
    Math.cos(
      progress * Math.PI
    ) /
      2
  );
}

function interpolate(
  start,
  end,
  progress
) {
  return (
    start +
    (end - start) *
      progress
  );
}

function formatRemainingTime(
  milliseconds
) {
  const totalSeconds =
    Math.max(
      0,
      Math.ceil(
        milliseconds / 1000
      )
    );

  const minutes =
    Math.floor(
      totalSeconds / 60
    );

  const seconds =
    totalSeconds % 60;

  return `${minutes}:${String(
    seconds
  ).padStart(2, "0")}`;
}

function formatCompletedTime(
  seconds
) {
  const safeSeconds =
    Math.max(
      0,
      Math.round(seconds)
    );

  const minutes =
    Math.floor(
      safeSeconds / 60
    );

  const remainder =
    safeSeconds % 60;

  if (
    remainder === 0 &&
    minutes > 0
  ) {
    return `${minutes} ${
      minutes === 1
        ? "minute"
        : "minutes"
    } completed`;
  }

  if (minutes > 0) {
    return `${minutes}m ${remainder}s completed`;
  }

  return `${remainder}s completed`;
}

/* =========================================================
   COMPONENT
   ========================================================= */

function BreathingPage() {
  const navigate =
    useNavigate();

  /* -------------------------------------------------------
     BACKEND MUSIC
     ------------------------------------------------------- */

  const [
    tracks,
    setTracks,
  ] = useState([]);

  const [
    tracksLoading,
    setTracksLoading,
  ] = useState(true);

  const [
    trackError,
    setTrackError,
  ] = useState("");

  /* -------------------------------------------------------
     FLOW
     setup
     ready
     active
     complete
     ------------------------------------------------------- */

  const [
    screen,
    setScreen,
  ] = useState("setup");

  const [
    durationMinutes,
    setDurationMinutes,
  ] = useState(2);

  const [
    selectedTrackId,
    setSelectedTrackId,
  ] = useState("");

  const [
    isPaused,
    setIsPaused,
  ] = useState(false);

  const [
    isMuted,
    setIsMuted,
  ] = useState(false);

  const [
    phaseLabel,
    setPhaseLabel,
  ] = useState(
    BREATH_PHASES[0].label
  );

  const [
    phaseCountdown,
    setPhaseCountdown,
  ] = useState(4);

  const [
    remainingDisplay,
    setRemainingDisplay,
  ] = useState(
    2 * 60 * 1000
  );

  const [
    completedSeconds,
    setCompletedSeconds,
  ] = useState(0);

  /* -------------------------------------------------------
     BREATHING ENGINE REFS
     ------------------------------------------------------- */

  const animationFrameRef =
    useRef(null);

  const lastFrameTimeRef =
    useRef(null);

  const lastUiUpdateRef =
    useRef(0);

  const remainingMsRef =
    useRef(0);

  const elapsedMsRef =
    useRef(0);

  const phaseIndexRef =
    useRef(0);

  const phaseElapsedRef =
    useRef(0);

  const pausedRef =
    useRef(false);

  /* -------------------------------------------------------
     VISUAL REFS
     ------------------------------------------------------- */

  const lungsRef =
    useRef(null);

  const mouthRef =
    useRef(null);

  const combinedRef =
    useRef(null);

  /* -------------------------------------------------------
     AUDIO
     ------------------------------------------------------- */

  const audioRef =
    useRef(null);

  const youtubeIframeRef =
    useRef(null);

  /* =======================================================
     LOAD MUSIC FROM BACKEND
     ======================================================= */

  useEffect(() => {
    let cancelled = false;

    async function loadTracks() {
      try {
        setTracksLoading(true);
        setTrackError("");

        const result =
          await getBreathingTracks();

        if (cancelled) {
          return;
        }

        setTracks(
          Array.isArray(result)
            ? result
            : []
        );
      } catch (error) {
        console.error(
          "Failed to load breathing music:",
          error
        );

        if (!cancelled) {
          setTrackError(
            "Music couldn't be loaded. You can still use the breathing exercise without music."
          );
        }
      } finally {
        if (!cancelled) {
          setTracksLoading(
            false
          );
        }
      }
    }

    loadTracks();

    return () => {
      cancelled = true;
    };
  }, []);

  /* =======================================================
     NORMALIZED MUSIC
     ======================================================= */

  const musicTracks =
    useMemo(() => {
      return tracks.map(
        (track, index) => ({
          ...track,

          displayName:
            getTrackDisplayName(
              track,
              index
            ),
        })
      );
    }, [tracks]);

  const selectedTrack =
    useMemo(() => {
      return (
        musicTracks.find(
          (track) =>
            track.id ===
            selectedTrackId
        ) || null
      );
    }, [
      musicTracks,
      selectedTrackId,
    ]);

  /* =======================================================
     YOUTUBE COMMAND
     ======================================================= */

  const sendYouTubeCommand =
    useCallback(
      (command, args = []) => {
        const frame =
          youtubeIframeRef
            .current;

        if (
          !frame ||
          !frame.contentWindow
        ) {
          return;
        }

        frame.contentWindow.postMessage(
          JSON.stringify({
            event: "command",

            func: command,

            args,
          }),
          "*"
        );
      },
      []
    );

  /* =======================================================
     MUSIC PLAY
     ======================================================= */

  const playMusic =
    useCallback(() => {
      if (!selectedTrack) {
        return;
      }

      if (
        selectedTrack.audioUrl &&
        audioRef.current
      ) {
        audioRef.current.volume =
          isMuted ? 0 : 0.42;

        audioRef.current
          .play()
          .catch(() => {
            // Browser may block until
            // another user interaction.
          });

        return;
      }

      if (
        selectedTrack
          .youtubeVideoId
      ) {
        sendYouTubeCommand(
          isMuted
            ? "mute"
            : "unMute"
        );

        sendYouTubeCommand(
          "setVolume",
          [42]
        );

        sendYouTubeCommand(
          "playVideo"
        );
      }
    }, [
      selectedTrack,
      isMuted,
      sendYouTubeCommand,
    ]);

  /* =======================================================
     MUSIC PAUSE
     ======================================================= */

  const pauseMusic =
    useCallback(() => {
      if (
        audioRef.current
      ) {
        audioRef.current.pause();
      }

      sendYouTubeCommand(
        "pauseVideo"
      );
    }, [sendYouTubeCommand]);

  /* =======================================================
     MUSIC STOP
     ======================================================= */

  const stopMusic =
    useCallback(() => {
      if (
        audioRef.current
      ) {
        audioRef.current.pause();

        audioRef.current.currentTime =
          0;
      }

      sendYouTubeCommand(
        "stopVideo"
      );
    }, [sendYouTubeCommand]);

  /* =======================================================
     MUTING
     ======================================================= */

  useEffect(() => {
    if (
      audioRef.current
    ) {
      audioRef.current.volume =
        isMuted ? 0 : 0.42;
    }

    if (isMuted) {
      sendYouTubeCommand(
        "mute"
      );
    } else {
      sendYouTubeCommand(
        "unMute"
      );

      sendYouTubeCommand(
        "setVolume",
        [42]
      );
    }
  }, [
    isMuted,
    sendYouTubeCommand,
  ]);

  /* =======================================================
     KEEP PAUSE REF CURRENT
     ======================================================= */

  useEffect(() => {
    pausedRef.current =
      isPaused;
  }, [isPaused]);

  /* =======================================================
     RESET VISUAL
     ======================================================= */

  const resetBreathingVisual =
    useCallback(() => {
      if (
        lungsRef.current
      ) {
        lungsRef.current.style.transform =
          "scale(0.88)";
      }

      if (
        mouthRef.current
      ) {
        mouthRef.current.style.transform =
          "scale(0.98)";
      }

      if (
        combinedRef.current
      ) {
        combinedRef.current.style.transform =
          "scale(0.88)";
      }
    }, []);

  /* =======================================================
     UPDATE VISUAL

     This is what keeps lungs and mouth synchronized
     to the exact breathing phase duration.
     ======================================================= */

  const updateBreathingVisual =
    useCallback(() => {
      const phase =
        BREATH_PHASES[
          phaseIndexRef.current
        ];

      const progress =
        phase.durationMs > 0
          ? phaseElapsedRef
              .current /
            phase.durationMs
          : 1;

      const eased =
        smoothProgress(
          progress
        );

      const lungScale =
        interpolate(
          phase.fromScale,
          phase.toScale,
          eased
        );

      /*
        Mouth / upper airway moves much more subtly.

        This prevents the face image from looking
        unnaturally inflated.
      */

      const mouthScale =
        interpolate(
          phase.id ===
            "inhale"
            ? 0.98
            : phase.id ===
                "exhale"
              ? 1.025
              : phase.fromScale >
                    1
                ? 1.025
                : 0.98,

          phase.id ===
            "inhale"
            ? 1.025
            : phase.id ===
                "exhale"
              ? 0.98
              : phase.toScale >
                    1
                ? 1.025
                : 0.98,

          eased
        );

      if (
        lungsRef.current
      ) {
        lungsRef.current.style.transform =
          `scale(${lungScale})`;
      }

      if (
        mouthRef.current
      ) {
        mouthRef.current.style.transform =
          `scale(${mouthScale})`;
      }

      if (
        combinedRef.current
      ) {
        combinedRef.current.style.transform =
          `scale(${lungScale})`;
      }
    }, []);

  /* =======================================================
     COMPLETE SESSION
     ======================================================= */

  const completeSession =
    useCallback(
      (manual = false) => {
        const elapsedSeconds =
          elapsedMsRef.current /
          1000;

        setCompletedSeconds(
          manual
            ? elapsedSeconds
            : durationMinutes *
                60
        );

        stopMusic();

        setIsPaused(false);

        pausedRef.current =
          false;

        setScreen(
          "complete"
        );

        resetBreathingVisual();
      },
      [
        durationMinutes,
        resetBreathingVisual,
        stopMusic,
      ]
    );

  /* =======================================================
     BREATHING ENGINE
     ======================================================= */

  useEffect(() => {
    if (
      screen !== "active"
    ) {
      return undefined;
    }

    function updateUi() {
      const phase =
        BREATH_PHASES[
          phaseIndexRef.current
        ];

      const phaseRemaining =
        Math.max(
          1,
          Math.ceil(
            (
              phase.durationMs -
              phaseElapsedRef
                .current
            ) /
              1000
          )
        );

      setPhaseLabel(
        phase.label
      );

      setPhaseCountdown(
        phaseRemaining
      );

      setRemainingDisplay(
        remainingMsRef.current
      );
    }

    function tick(timestamp) {
      if (
        lastFrameTimeRef.current ===
        null
      ) {
        lastFrameTimeRef.current =
          timestamp;
      }

      const delta =
        Math.min(
          100,
          timestamp -
            lastFrameTimeRef
              .current
        );

      lastFrameTimeRef.current =
        timestamp;

      if (
        !pausedRef.current
      ) {
        remainingMsRef.current -=
          delta;

        elapsedMsRef.current +=
          delta;

        phaseElapsedRef.current +=
          delta;

        let currentPhase =
          BREATH_PHASES[
            phaseIndexRef.current
          ];

        while (
          phaseElapsedRef.current >=
          currentPhase.durationMs
        ) {
          phaseElapsedRef.current -=
            currentPhase.durationMs;

          phaseIndexRef.current =
            (
              phaseIndexRef.current +
              1
            ) %
            BREATH_PHASES.length;

          currentPhase =
            BREATH_PHASES[
              phaseIndexRef.current
            ];
        }

        updateBreathingVisual();

        if (
          timestamp -
            lastUiUpdateRef.current >=
          100
        ) {
          lastUiUpdateRef.current =
            timestamp;

          updateUi();
        }

        if (
          remainingMsRef.current <=
          0
        ) {
          remainingMsRef.current =
            0;

          setRemainingDisplay(
            0
          );

          completeSession(
            false
          );

          return;
        }
      }

      animationFrameRef.current =
        window.requestAnimationFrame(
          tick
        );
    }

    animationFrameRef.current =
      window.requestAnimationFrame(
        tick
      );

    return () => {
      if (
        animationFrameRef.current
      ) {
        window.cancelAnimationFrame(
          animationFrameRef.current
        );
      }

      animationFrameRef.current =
        null;

      lastFrameTimeRef.current =
        null;
    };
  }, [
    screen,
    completeSession,
    updateBreathingVisual,
  ]);

  /* =======================================================
     SETUP -> READY
     ======================================================= */

  function handlePrepareSession() {
    const totalMs =
      durationMinutes *
      60 *
      1000;

    remainingMsRef.current =
      totalMs;

    elapsedMsRef.current =
      0;

    phaseIndexRef.current =
      0;

    phaseElapsedRef.current =
      0;

    setRemainingDisplay(
      totalMs
    );

    setPhaseLabel(
      BREATH_PHASES[0].label
    );

    setPhaseCountdown(
      Math.ceil(
        BREATH_PHASES[0]
          .durationMs /
          1000
      )
    );

    resetBreathingVisual();

    setScreen("ready");
  }

  /* =======================================================
     READY -> START
     ======================================================= */

  function handleStartSession() {
    const totalMs =
      durationMinutes *
      60 *
      1000;

    remainingMsRef.current =
      totalMs;

    elapsedMsRef.current =
      0;

    phaseIndexRef.current =
      0;

    phaseElapsedRef.current =
      0;

    lastFrameTimeRef.current =
      null;

    setRemainingDisplay(
      totalMs
    );

    setIsPaused(false);

    pausedRef.current =
      false;

    setScreen("active");

    /*
      User click allows browser audio playback.
    */

    window.setTimeout(
      () => {
        playMusic();
      },
      80
    );
  }

  /* =======================================================
     PAUSE / RESUME
     ======================================================= */

  function handlePauseResume() {
    if (isPaused) {
      setIsPaused(false);

      pausedRef.current =
        false;

      playMusic();
    } else {
      setIsPaused(true);

      pausedRef.current =
        true;

      pauseMusic();
    }
  }

  /* =======================================================
     END EARLY
     ======================================================= */

  function handleEndSession() {
    completeSession(true);
  }

  /* =======================================================
     DONE
     ======================================================= */

  function handleDone() {
    stopMusic();

    navigate("/dashboard");
  }

  /* =======================================================
     AGAIN
     ======================================================= */

  function handleAnotherSession() {
    stopMusic();

    setIsPaused(false);

    setScreen("setup");

    setCompletedSeconds(0);

    remainingMsRef.current =
      durationMinutes *
      60 *
      1000;

    resetBreathingVisual();
  }

  /* =======================================================
     YOUTUBE SOURCE
     ======================================================= */

  const youtubeEmbedUrl =
    useMemo(() => {
      if (
        !selectedTrack
          ?.youtubeVideoId
      ) {
        return "";
      }

      const id =
        selectedTrack
          .youtubeVideoId;

      return (
        `https://www.youtube.com/embed/${id}` +
        `?enablejsapi=1` +
        `&controls=0` +
        `&playsinline=1` +
        `&rel=0` +
        `&loop=1` +
        `&playlist=${id}`
      );
    }, [selectedTrack]);

  /* =======================================================
     ANATOMY VISUAL
     ======================================================= */

  function renderBreathingVisual() {
    if (
      MOUTH_IMAGE &&
      LUNGS_IMAGE
    ) {
      return (
        <div className="breathing-anatomy">
          <img
            ref={mouthRef}
            src={MOUTH_IMAGE}
            alt=""
            aria-hidden="true"
            className="breathing-anatomy__mouth"
          />

          <img
            ref={lungsRef}
            src={LUNGS_IMAGE}
            alt=""
            aria-hidden="true"
            className="breathing-anatomy__lungs"
          />
        </div>
      );
    }

    if (
      BREATHING_COMBINED_IMAGE
    ) {
      return (
        <img
          ref={combinedRef}
          src={
            BREATHING_COMBINED_IMAGE
          }
          alt=""
          aria-hidden="true"
          className="breathing-anatomy__combined"
        />
      );
    }

    return (
      <div
        ref={combinedRef}
        className="breathing-anatomy__fallback"
        aria-hidden="true"
      >
        <div className="breathing-anatomy__fallback-lung breathing-anatomy__fallback-lung--left" />
        <div className="breathing-anatomy__fallback-lung breathing-anatomy__fallback-lung--right" />
      </div>
    );
  }

  /* =======================================================
     PAGE
     ======================================================= */

  return (
    <AppLayout>
      <main className="breathing-page">

        {/* ===============================================
            BACKGROUND AUDIO SOURCES
            =============================================== */}

        {selectedTrack?.audioUrl ? (
          <audio
            ref={audioRef}
            src={
              selectedTrack.audioUrl
            }
            loop
            preload="auto"
          />
        ) : null}

        {youtubeEmbedUrl &&
        screen !== "setup" ? (
          <iframe
            ref={
              youtubeIframeRef
            }
            title="Breathing background music"
            src={
              youtubeEmbedUrl
            }
            className="breathing-youtube-audio"
            allow="autoplay; encrypted-media"
            onLoad={() => {
              if (
                screen ===
                  "active" &&
                !pausedRef.current
              ) {
                playMusic();
              }
            }}
          />
        ) : null}

        {/* ===============================================
            SETUP
            =============================================== */}

        {screen === "setup" ? (
          <section className="breathing-setup">

            <header className="breathing-setup__header">
              <h1>
                Breathing exercise
              </h1>

              <p>
                Take a moment to slow
                down and reset.
              </p>
            </header>

            <div className="breathing-setup__illustration-wrap">
              {SETUP_IMAGE ? (
                <img
                  src={SETUP_IMAGE}
                  alt=""
                  aria-hidden="true"
                  className="breathing-setup__illustration"
                />
              ) : (
                <div className="breathing-image-placeholder" />
              )}
            </div>

            <section className="breathing-form">

              <h2>
                Find your rhythm
              </h2>

              <label className="breathing-field">
                <span>
                  Session Duration
                </span>

                <select
                  value={
                    durationMinutes
                  }
                  onChange={(
                    event
                  ) => {
                    setDurationMinutes(
                      Number(
                        event
                          .target
                          .value
                      )
                    );
                  }}
                >
                  {SESSION_DURATIONS.map(
                    (option) => (
                      <option
                        key={
                          option.value
                        }
                        value={
                          option.value
                        }
                      >
                        {
                          option.label
                        }
                      </option>
                    )
                  )}
                </select>
              </label>

              <label className="breathing-field">
                <span>
                  Background Music
                </span>

                <select
                  value={
                    selectedTrackId
                  }
                  disabled={
                    tracksLoading
                  }
                  onChange={(
                    event
                  ) =>
                    setSelectedTrackId(
                      event.target
                        .value
                    )
                  }
                >
                  <option value="">
                    {tracksLoading
                      ? "Loading music..."
                      : "Off"}
                  </option>

                  {musicTracks.map(
                    (track) => (
                      <option
                        key={
                          track.id
                        }
                        value={
                          track.id
                        }
                      >
                        {
                          track.displayName
                        }
                      </option>
                    )
                  )}
                </select>
              </label>

              {trackError ? (
                <p className="breathing-form__error">
                  {trackError}
                </p>
              ) : null}

              <button
                type="button"
                className="breathing-primary-button"
                onClick={
                  handlePrepareSession
                }
              >
                Begin session
              </button>

            </section>

          </section>
        ) : null}

        {/* ===============================================
            READY
            =============================================== */}

        {screen === "ready" ? (
          <section className="breathing-session-panel">

            <div className="breathing-ready">

              <div className="breathing-ready__content">

                {READY_IMAGE ? (
                  <img
                    src={
                      READY_IMAGE
                    }
                    alt=""
                    aria-hidden="true"
                    className="breathing-ready__image"
                  />
                ) : null}

                <h1>
                  Ready to begin the
                  session?
                </h1>

                <button
                  type="button"
                  className="breathing-primary-button"
                  onClick={
                    handleStartSession
                  }
                >
                  Start Session
                </button>

              </div>

              <p className="breathing-safety-note">
                Breathe gently. Don’t
                force the inhale, hold,
                or exhale. If it feels
                uncomfortable, return to
                your natural breathing.
              </p>

            </div>

          </section>
        ) : null}

        {/* ===============================================
            ACTIVE SESSION
            =============================================== */}

        {screen === "active" ? (
          <section className="breathing-session-panel">

            <div className="breathing-active">

              <div className="breathing-active__main">

                <div className="breathing-active__visual">
                  {renderBreathingVisual()}
                </div>

                <div className="breathing-phase">
                  <h1>
                    {phaseLabel}
                  </h1>

                  <span>
                    {phaseCountdown}
                  </span>
                </div>

                <p className="breathing-remaining">
                  {formatRemainingTime(
                    remainingDisplay
                  )}{" "}
                  Remaining
                </p>

                <div className="breathing-controls">

                  <button
                    type="button"
                    className="breathing-secondary-button"
                    onClick={
                      handleEndSession
                    }
                  >
                    End Session
                  </button>

                  <button
                    type="button"
                    className="breathing-primary-button breathing-control-button"
                    onClick={
                      handlePauseResume
                    }
                  >
                    {isPaused
                      ? "Resume Session"
                      : "Pause Session"}
                  </button>

                </div>

                {selectedTrack ? (
                  <div className="breathing-now-playing">

                    <span className="breathing-now-playing__icon">
                      <Music2
                        size={18}
                        strokeWidth={
                          1.7
                        }
                      />
                    </span>

                    <span className="breathing-now-playing__copy">
                      <small>
                        NOW PLAYING
                      </small>

                      <strong>
                        {
                          selectedTrack.displayName
                        }
                      </strong>
                    </span>

                    <span className="breathing-now-playing__bars">
                      <i />
                      <i />
                      <i />
                      <i />
                    </span>

                    <button
                      type="button"
                      className="breathing-volume-button"
                      onClick={() =>
                        setIsMuted(
                          (
                            current
                          ) =>
                            !current
                        )
                      }
                      aria-label={
                        isMuted
                          ? "Unmute background music"
                          : "Mute background music"
                      }
                    >
                      {isMuted ? (
                        <VolumeX
                          size={
                            18
                          }
                        />
                      ) : (
                        <Volume2
                          size={
                            18
                          }
                        />
                      )}
                    </button>

                  </div>
                ) : null}

              </div>

              <p className="breathing-safety-note">
                Breathe gently. Don’t
                force the inhale, hold,
                or exhale. If it feels
                uncomfortable, return to
                your natural breathing.
              </p>

            </div>

          </section>
        ) : null}

        {/* ===============================================
            COMPLETE
            =============================================== */}

        {screen ===
        "complete" ? (
          <section className="breathing-complete">

            <div className="breathing-complete__content">

              {COMPLETE_IMAGE ? (
                <img
                  src={
                    COMPLETE_IMAGE
                  }
                  alt=""
                  aria-hidden="true"
                  className="breathing-complete__image"
                />
              ) : null}

              <div className="breathing-complete__message">

                <h1>
                  Breathing session
                  complete
                </h1>

                <p>
                  You made time to pause
                  and breathe. Take a
                  moment before moving on.
                </p>

                <div className="breathing-complete__duration">
                  <Clock3
                    size={16}
                    strokeWidth={
                      1.6
                    }
                  />

                  <span>
                    {formatCompletedTime(
                      completedSeconds
                    )}
                  </span>
                </div>

              </div>

              <div className="breathing-complete__actions">

                <button
                  type="button"
                  className="breathing-primary-button breathing-complete__done"
                  onClick={
                    handleDone
                  }
                >
                  Done
                </button>

                <button
                  type="button"
                  className="breathing-text-button"
                  onClick={
                    handleAnotherSession
                  }
                >
                  Begin another session
                </button>

              </div>

            </div>

          </section>
        ) : null}

      </main>
    </AppLayout>
  );
}

export default BreathingPage;