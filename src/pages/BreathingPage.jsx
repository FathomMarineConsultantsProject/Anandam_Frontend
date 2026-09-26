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
   ASSET LOADER
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
    keywords = []
) {
    for (const keyword of keywords) {
        const normalized =
            String(keyword)
                .toLowerCase()
                .trim();

        const found =
            breathingAssetEntries.find(
                ([path]) =>
                    path
                        .toLowerCase()
                        .includes(normalized)
            );

        if (found) {
            return found[1];
        }
    }

    return "";
}

/* =========================================================
   MAIN PAGE ILLUSTRATIONS
   ========================================================= */

const SETUP_IMAGE =
    findBreathingAsset([
        "frame 2147240207",
    ]);

const READY_IMAGE =
    findBreathingAsset([
        "group 1597885772",
    ]);

const COMPLETE_IMAGE =
    findBreathingAsset([
        "andum- last 1",
        "andum- last",
    ]);

/* =========================================================
   IMPORTANT:
   ONLY ONE LUNG IMAGE

   No HOLD lung.
   No EXHALE lung.

   One image behaves like a physical lung.
   ========================================================= */

const LUNG_IMAGE =
    findBreathingAsset([
        "lungs - breath in",
        "lungs - breathin",
    ]);

/* =========================================================
   MOUTH STATES
   ========================================================= */

const MOUTH_IMAGES = {
    inhale:
        findBreathingAsset([
            "property 1=inhaling",
        ]),

    hold:
        findBreathingAsset([
            "property 1=hold",
        ]),

    exhale:
        findBreathingAsset([
            "property 1=exhaling",
        ]),
};

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
   BREATH CYCLE

   Inhale:  4 sec
   Hold:    2 sec
   Exhale:  6 sec
   Hold:    2 sec
   ========================================================= */

const BREATH_PHASES = [
    {
        id: "inhale",

        label:
            "BREATHE IN",

        mouth:
            "inhale",

        durationMs:
            4000,

        scaleFrom:
            0.88,

        scaleTo:
            1.06,
    },

    {
        id: "hold-in",

        label:
            "HOLD",

        mouth:
            "hold",

        durationMs:
            2000,

        scaleFrom:
            1.06,

        scaleTo:
            1.06,
    },

    {
        id: "exhale",

        label:
            "BREATHE OUT",

        mouth:
            "exhale",

        durationMs:
            6000,

        scaleFrom:
            1.06,

        scaleTo:
            0.88,
    },

    {
        id: "hold-out",

        label:
            "HOLD",

        mouth:
            "hold",

        durationMs:
            2000,

        scaleFrom:
            0.88,

        scaleTo:
            0.88,
    },
];

/* =========================================================
   MUSIC NAMES
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

    const mapped =
        FRIENDLY_TRACK_NAMES[
        track.slug
        ];

    if (mapped) {
        return mapped;
    }

    const fallback = [
        "Soft piano",
        "Ocean rain",
        "Gentle music",
        "Forest music",
        "Bird chirping",
    ];

    return (
        fallback[index] ||
        track.title ||
        "Calming music"
    );
}

/* =========================================================
   ANIMATION HELPERS
   ========================================================= */

function clamp(
    value,
    min,
    max
) {
    return Math.min(
        max,
        Math.max(
            min,
            value
        )
    );
}

/*
  Smootherstep gives very gentle acceleration
  and deceleration.

  Much softer than linear or basic ease-in-out.
*/

function smootherStep(
    value
) {
    const t =
        clamp(
            value,
            0,
            1
        );

    return (
        t *
        t *
        t *
        (
            t *
            (
                t * 6 - 15
            ) +
            10
        )
    );
}

function lerp(
    from,
    to,
    progress
) {
    return (
        from +
        (to - from) *
        progress
    );
}

function formatTime(
    milliseconds
) {
    const total =
        Math.max(
            0,
            Math.ceil(
                milliseconds /
                1000
            )
        );

    const minutes =
        Math.floor(
            total / 60
        );

    const seconds =
        total % 60;

    return `${minutes}:${String(
        seconds
    ).padStart(2, "0")}`;
}

function formatCompletedTime(
    seconds
) {
    const safe =
        Math.max(
            0,
            Math.round(
                seconds
            )
        );

    const minutes =
        Math.floor(
            safe / 60
        );

    const remainder =
        safe % 60;

    if (
        minutes > 0 &&
        remainder === 0
    ) {
        return `${minutes} ${minutes === 1
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
   PAGE
   ========================================================= */

function BreathingPage() {
    const navigate =
        useNavigate();

    /* =======================================================
       MUSIC
       ======================================================= */

    const [
        tracks,
        setTracks,
    ] = useState([]);

    const [
        tracksLoading,
        setTracksLoading,
    ] = useState(true);

    const [
        tracksError,
        setTracksError,
    ] = useState("");

    /* =======================================================
       FLOW
       ======================================================= */

    const [
        screen,
        setScreen,
    ] = useState(
        "setup"
    );

    /* =======================================================
       SETTINGS
       ======================================================= */

    const [
        durationMinutes,
        setDurationMinutes,
    ] = useState(2);

    const [
        selectedTrackId,
        setSelectedTrackId,
    ] = useState("");

    /* =======================================================
       SESSION UI
       ======================================================= */

    const [
        phaseLabel,
        setPhaseLabel,
    ] = useState(
        "BREATHE IN"
    );

    const [
        mouthState,
        setMouthState,
    ] = useState(
        "inhale"
    );

    const [
        phaseCountdown,
        setPhaseCountdown,
    ] = useState(4);

    const [
        remainingDisplay,
        setRemainingDisplay,
    ] = useState(
        120000
    );

    const [
        isPaused,
        setIsPaused,
    ] = useState(false);

    const [
        isMuted,
        setIsMuted,
    ] = useState(false);

    const [
        completedSeconds,
        setCompletedSeconds,
    ] = useState(0);

    /* =======================================================
       BREATH ENGINE
       ======================================================= */

    const rafRef =
        useRef(null);

    const previousFrameRef =
        useRef(null);

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

    const lastSecondRef =
        useRef(null);

    /* =======================================================
       ONE LUNG IMAGE REF
       ======================================================= */

    const lungRef =
        useRef(null);

    /* =======================================================
       AUDIO
       ======================================================= */

    const audioRef =
        useRef(null);

    const youtubeIframeRef =
        useRef(null);

    /* =======================================================
       LOAD MUSIC
       ======================================================= */

    useEffect(() => {
        let cancelled =
            false;

        async function loadTracks() {
            try {
                setTracksLoading(
                    true
                );

                setTracksError(
                    ""
                );

                const result =
                    await getBreathingTracks();

                if (cancelled) {
                    return;
                }

                setTracks(
                    Array.isArray(
                        result
                    )
                        ? result
                        : []
                );
            } catch (error) {
                console.error(
                    "Breathing tracks error:",
                    error
                );

                if (!cancelled) {
                    setTracksError(
                        "Music could not be loaded. You can still use the breathing exercise without music."
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
            cancelled =
                true;
        };
    }, []);

    /* =======================================================
       NORMALIZED MUSIC
       ======================================================= */

    const musicTracks =
        useMemo(() => {
            return tracks.map(
                (
                    track,
                    index
                ) => ({
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
       YOUTUBE URL
       ======================================================= */

    const youtubeEmbedUrl =
        useMemo(() => {
            const id =
                selectedTrack
                    ?.youtubeVideoId;

            if (!id) {
                return "";
            }

            return (
                `https://www.youtube.com/embed/${id}` +
                `?enablejsapi=1` +
                `&controls=0` +
                `&playsinline=1` +
                `&rel=0` +
                `&loop=1` +
                `&playlist=${id}`
            );
        }, [
            selectedTrack,
        ]);

    /* =======================================================
       YOUTUBE COMMAND
       ======================================================= */

    const sendYouTubeCommand =
        useCallback(
            (
                command,
                args = []
            ) => {
                const frame =
                    youtubeIframeRef.current;

                if (
                    !frame ||
                    !frame.contentWindow
                ) {
                    return;
                }

                frame.contentWindow.postMessage(
                    JSON.stringify({
                        event:
                            "command",

                        func:
                            command,

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
                    isMuted
                        ? 0
                        : 0.38;

                audioRef.current
                    .play()
                    .catch(() => { });

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
                    [38]
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
        }, [
            sendYouTubeCommand,
        ]);

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
        }, [
            sendYouTubeCommand,
        ]);

    /* =======================================================
       MUTE
       ======================================================= */

    useEffect(() => {
        if (
            audioRef.current
        ) {
            audioRef.current.volume =
                isMuted
                    ? 0
                    : 0.38;
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
                [38]
            );
        }
    }, [
        isMuted,
        sendYouTubeCommand,
    ]);

    /* =======================================================
       PAUSE REF
       ======================================================= */

    useEffect(() => {
        pausedRef.current =
            isPaused;
    }, [isPaused]);

    /* =======================================================
       APPLY ONE-LUNG SCALE
       ======================================================= */

    const updateLungScale =
        useCallback(() => {
            const phase =
                BREATH_PHASES[
                phaseIndexRef.current
                ];

            const rawProgress =
                clamp(
                    phaseElapsedRef.current /
                    phase.durationMs,
                    0,
                    1
                );

            const smooth =
                smootherStep(
                    rawProgress
                );

            const scale =
                lerp(
                    phase.scaleFrom,
                    phase.scaleTo,
                    smooth
                );

            if (
                lungRef.current
            ) {
                lungRef.current.style.transform =
                    `translateZ(0) scale(${scale})`;
            }
        }, []);

    /* =======================================================
       RESET LUNG
       ======================================================= */

    const resetLung =
        useCallback(() => {
            if (
                lungRef.current
            ) {
                lungRef.current.style.transform =
                    "translateZ(0) scale(0.88)";
            }
        }, []);

    /* =======================================================
       FINISH
       ======================================================= */

    const finishSession =
        useCallback(
            (manual = false) => {
                const actualSeconds =
                    elapsedMsRef.current /
                    1000;

                setCompletedSeconds(
                    manual
                        ? actualSeconds
                        : durationMinutes *
                        60
                );

                stopMusic();

                pausedRef.current =
                    false;

                setIsPaused(
                    false
                );

                setScreen(
                    "complete"
                );
            },
            [
                durationMinutes,
                stopMusic,
            ]
        );

    /* =======================================================
       BREATHING LOOP
       ======================================================= */

    useEffect(() => {
        if (
            screen !== "active"
        ) {
            return undefined;
        }

        function updateText() {
            const phase =
                BREATH_PHASES[
                phaseIndexRef.current
                ];

            const phaseRemaining =
                Math.max(
                    0,
                    phase.durationMs -
                    phaseElapsedRef.current
                );

            const phaseSeconds =
                Math.max(
                    1,
                    Math.ceil(
                        phaseRemaining /
                        1000
                    )
                );

            /*
              Only trigger React when the shown second changes.
      
              The lung animation remains pure requestAnimationFrame.
            */

            if (
                phaseSeconds !==
                lastSecondRef.current
            ) {
                lastSecondRef.current =
                    phaseSeconds;

                setPhaseCountdown(
                    phaseSeconds
                );

                setRemainingDisplay(
                    Math.max(
                        0,
                        remainingMsRef.current
                    )
                );
            }
        }

        function loop(timestamp) {
            if (
                previousFrameRef.current ===
                null
            ) {
                previousFrameRef.current =
                    timestamp;
            }

            let delta =
                timestamp -
                previousFrameRef.current;

            /*
              Avoid giant animation jumps
              if browser temporarily stalls.
            */

            delta =
                Math.min(
                    delta,
                    32
                );

            previousFrameRef.current =
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

                let phase =
                    BREATH_PHASES[
                    phaseIndexRef.current
                    ];

                if (
                    phaseElapsedRef.current >=
                    phase.durationMs
                ) {
                    phaseElapsedRef.current -=
                        phase.durationMs;

                    phaseIndexRef.current =
                        (
                            phaseIndexRef.current +
                            1
                        ) %
                        BREATH_PHASES.length;

                    phase =
                        BREATH_PHASES[
                        phaseIndexRef.current
                        ];

                    /*
                      Change mouth illustration only once,
                      exactly at the phase change.
          
                      CSS handles smooth crossfade.
                    */

                    setMouthState(
                        phase.mouth
                    );

                    setPhaseLabel(
                        phase.label
                    );

                    lastSecondRef.current =
                        null;
                }

                /*
                  One lung.
                  One transform.
                  Every frame.
                */

                updateLungScale();

                updateText();

                if (
                    remainingMsRef.current <=
                    0
                ) {
                    remainingMsRef.current =
                        0;

                    setRemainingDisplay(
                        0
                    );

                    finishSession(
                        false
                    );

                    return;
                }
            }

            rafRef.current =
                window.requestAnimationFrame(
                    loop
                );
        }

        rafRef.current =
            window.requestAnimationFrame(
                loop
            );

        return () => {
            if (
                rafRef.current
            ) {
                window.cancelAnimationFrame(
                    rafRef.current
                );
            }

            rafRef.current =
                null;

            previousFrameRef.current =
                null;
        };
    }, [
        screen,
        updateLungScale,
        finishSession,
    ]);

    /* =======================================================
       PREPARE
       ======================================================= */

    function prepareSession() {
        const total =
            durationMinutes *
            60 *
            1000;

        remainingMsRef.current =
            total;

        elapsedMsRef.current =
            0;

        phaseIndexRef.current =
            0;

        phaseElapsedRef.current =
            0;

        previousFrameRef.current =
            null;

        lastSecondRef.current =
            null;

        setRemainingDisplay(
            total
        );

        setPhaseLabel(
            "BREATHE IN"
        );

        setMouthState(
            "inhale"
        );

        setPhaseCountdown(
            4
        );

        setScreen(
            "ready"
        );
    }

    /* =======================================================
       START
       ======================================================= */

    function startSession() {
        const total =
            durationMinutes *
            60 *
            1000;

        remainingMsRef.current =
            total;

        elapsedMsRef.current =
            0;

        phaseIndexRef.current =
            0;

        phaseElapsedRef.current =
            0;

        previousFrameRef.current =
            null;

        lastSecondRef.current =
            null;

        pausedRef.current =
            false;

        setIsPaused(
            false
        );

        setRemainingDisplay(
            total
        );

        setPhaseLabel(
            "BREATHE IN"
        );

        setMouthState(
            "inhale"
        );

        setPhaseCountdown(
            4
        );

        setScreen(
            "active"
        );

        window.requestAnimationFrame(
            () => {
                resetLung();

                updateLungScale();
            }
        );

        window.setTimeout(
            () => {
                playMusic();
            },
            100
        );
    }

    /* =======================================================
       PAUSE
       ======================================================= */

    function togglePause() {
        if (isPaused) {
            pausedRef.current =
                false;

            previousFrameRef.current =
                null;

            setIsPaused(
                false
            );

            playMusic();
        } else {
            pausedRef.current =
                true;

            setIsPaused(
                true
            );

            pauseMusic();
        }
    }

    function endSession() {
        finishSession(
            true
        );
    }

    function done() {
        stopMusic();

        navigate(
            "/dashboard"
        );
    }

    function anotherSession() {
        stopMusic();

        setScreen(
            "setup"
        );

        setIsPaused(
            false
        );

        setCompletedSeconds(
            0
        );
    }

    /* =======================================================
       JSX
       ======================================================= */

    return (
        <AppLayout>
            <main className="breathing-page">

                {/* AUDIO */}

                {selectedTrack?.audioUrl ? (
                    <audio
                        ref={audioRef}
                        src={
                            selectedTrack.audioUrl
                        }
                        preload="auto"
                        loop
                    />
                ) : null}

                {/* YOUTUBE BACKGROUND AUDIO */}

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
                        className="breathing-youtube-player"
                        allow="autoplay; encrypted-media"
                        onLoad={() => {
                            if (
                                screen === "active" &&
                                !pausedRef.current
                            ) {
                                playMusic();
                            }
                        }}
                    />
                ) : null}

                {/* =================================================
            SETUP
            ================================================= */}

                {screen === "setup" ? (
                    <section className="breathing-setup">

                        <header className="breathing-setup__header">
                            <h1>
                                Breathing exercise
                            </h1>

                            <p>
                                Take a moment to slow down and reset.
                            </p>
                        </header>

                        <div className="breathing-setup__image-area">

                            {SETUP_IMAGE ? (
                                <img
                                    src={SETUP_IMAGE}
                                    alt=""
                                    draggable="false"
                                    aria-hidden="true"
                                    className="breathing-setup__image"
                                />
                            ) : null}

                        </div>

                        <div className="breathing-form">

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
                                    onChange={(event) =>
                                        setDurationMinutes(
                                            Number(
                                                event.target.value
                                            )
                                        )
                                    }
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
                                    onChange={(event) =>
                                        setSelectedTrackId(
                                            event.target.value
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

                            {tracksError ? (
                                <p className="breathing-form__error">
                                    {tracksError}
                                </p>
                            ) : null}

                            <button
                                type="button"
                                className="breathing-primary-button"
                                onClick={
                                    prepareSession
                                }
                            >
                                Begin session
                            </button>

                        </div>

                    </section>
                ) : null}

                {/* =================================================
            READY
            ================================================= */}

                {screen === "ready" ? (
                    <section className="breathing-session-shell">

                        <div className="breathing-ready">

                            <div className="breathing-ready__center">

                                {READY_IMAGE ? (
                                    <img
                                        src={
                                            READY_IMAGE
                                        }
                                        alt=""
                                        aria-hidden="true"
                                        draggable="false"
                                        className="breathing-ready__image"
                                    />
                                ) : null}

                                <h1>
                                    Ready to begin the session?
                                </h1>

                                <button
                                    type="button"
                                    className="breathing-primary-button"
                                    onClick={
                                        startSession
                                    }
                                >
                                    Start Session
                                </button>

                            </div>

                            <p className="breathing-safety-note">
                                Breathe gently. Don’t force the inhale,
                                hold, or exhale. If it feels uncomfortable,
                                return to your natural breathing.
                            </p>

                        </div>

                    </section>
                ) : null}

                {/* =================================================
            ACTIVE
            ================================================= */}

                {screen === "active" ? (
                    <section className="breathing-session-shell">

                        <div className="breathing-active">

                            <div className="breathing-active__center">

                                {/* =========================================
                    ANATOMY
                    ========================================= */}

                                <div className="breathing-anatomy">

                                    {/* MOUTH / NOSE */}

                                    <div className="breathing-mouth-frame">

                                        {Object.entries(MOUTH_IMAGES).map(([state, image]) => {
                                            if (!image) {
                                                return null;
                                            }

                                            return (
                                                <img
                                                    key={state}
                                                    src={image}
                                                    alt=""
                                                    aria-hidden="true"
                                                    draggable="false"
                                                    className={`breathing-mouth-image breathing-mouth-image--${state}${mouthState === state ? " is-active" : ""
                                                        }`}
                                                />
                                            );
                                        })}

                                    </div>


                                    {/* ADD NECK + SHOULDERS HERE */}

                                    <div
                                        className="breathing-neck-shoulders"
                                        aria-hidden="true"
                                    >
                                        <svg
                                            viewBox="0 0 260 120"
                                            xmlns="http://www.w3.org/2000/svg"
                                        >
                                            {/* LEFT NECK INTO SHOULDER */}
                                            <path
                                                d="
          M112 5
          C111 26 108 45 100 58
          C91 72 74 76 55 84
          C37 91 24 101 14 115
        "
                                            />

                                            {/* RIGHT NECK INTO SHOULDER */}
                                            <path
                                                d="
          M148 5
          C149 26 152 45 160 58
          C169 72 186 76 205 84
          C223 91 236 101 246 115
        "
                                            />
                                        </svg>
                                    </div>


                                    {/* ONE LUNG IMAGE */}

                                    <div className="breathing-lung-frame">

                                        {LUNG_IMAGE ? (
                                            <img
                                                ref={lungRef}
                                                src={LUNG_IMAGE}
                                                alt=""
                                                aria-hidden="true"
                                                draggable="false"
                                                className="breathing-single-lung"
                                            />
                                        ) : null}

                                    </div>

                                </div>

                                {/* PHASE */}

                                <div className="breathing-phase">

                                    <h1>
                                        {phaseLabel}
                                    </h1>

                                    <span>
                                        {
                                            phaseCountdown
                                        }
                                    </span>

                                </div>

                                {/* REMAINING */}

                                <p className="breathing-remaining">
                                    {formatTime(
                                        remainingDisplay
                                    )}{" "}
                                    Remaining
                                </p>

                                {/* CONTROLS */}

                                <div className="breathing-controls">

                                    <button
                                        type="button"
                                        className="breathing-secondary-button"
                                        onClick={
                                            endSession
                                        }
                                    >
                                        End Session
                                    </button>

                                    <button
                                        type="button"
                                        className="breathing-primary-button"
                                        onClick={
                                            togglePause
                                        }
                                    >
                                        {isPaused
                                            ? "Resume Session"
                                            : "Pause Session"}
                                    </button>

                                </div>

                                {/* MUSIC */}

                                {selectedTrack ? (
                                    <div className="breathing-now-playing">

                                        <span className="breathing-now-playing__icon">
                                            <Music2
                                                size={
                                                    17
                                                }
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

                                        <span
                                            className={`breathing-now-playing__bars${isPaused
                                                ? " is-paused"
                                                : ""
                                                }`}
                                        >
                                            <i />
                                            <i />
                                            <i />
                                        </span>

                                        <button
                                            type="button"
                                            className="breathing-volume-button"
                                            onClick={() =>
                                                setIsMuted(
                                                    (current) =>
                                                        !current
                                                )
                                            }
                                        >
                                            {isMuted ? (
                                                <VolumeX
                                                    size={
                                                        17
                                                    }
                                                />
                                            ) : (
                                                <Volume2
                                                    size={
                                                        17
                                                    }
                                                />
                                            )}
                                        </button>

                                    </div>
                                ) : null}

                            </div>

                            <p className="breathing-safety-note">
                                Breathe gently. Don’t force the inhale,
                                hold, or exhale. If it feels uncomfortable,
                                return to your natural breathing.
                            </p>

                        </div>

                    </section>
                ) : null}

                {/* =================================================
            COMPLETE
            ================================================= */}

                {screen === "complete" ? (
                    <section className="breathing-complete">

                        <div className="breathing-complete__center">

                            {COMPLETE_IMAGE ? (
                                <img
                                    src={
                                        COMPLETE_IMAGE
                                    }
                                    alt=""
                                    aria-hidden="true"
                                    draggable="false"
                                    className="breathing-complete__image"
                                />
                            ) : null}

                            <h1>
                                Breathing session complete
                            </h1>

                            <p className="breathing-complete__description">
                                You made time to pause and breathe.
                                Take a moment before moving on.
                            </p>

                            <div className="breathing-complete__duration">

                                <Clock3
                                    size={
                                        16
                                    }
                                />

                                <span>
                                    {formatCompletedTime(
                                        completedSeconds
                                    )}
                                </span>

                            </div>

                            <div className="breathing-complete__divider" />

                            <button
                                type="button"
                                className="breathing-primary-button breathing-complete__done"
                                onClick={
                                    done
                                }
                            >
                                Done
                            </button>

                            <button
                                type="button"
                                className="breathing-text-button"
                                onClick={
                                    anotherSession
                                }
                            >
                                Begin another session
                            </button>

                        </div>

                    </section>
                ) : null}

            </main>
        </AppLayout>
    );
}

export default BreathingPage;