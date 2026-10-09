import {
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import {
  ArrowLeft,
  Pause,
  Play,
  RotateCcw,
  RotateCw,
  Volume2,
  VolumeX,
} from "lucide-react";

import {
  useNavigate,
  useParams,
} from "react-router-dom";

import AppLayout from "../components/layout/AppLayout";

import {
  getSleepAudioTrackBySlug,
} from "../api/sleepAudioApi";

import "../styles/sleep-stories.css";


/* =========================================================
   YOUTUBE IFRAME API
   ========================================================= */

let youtubeApiPromise = null;


function loadYouTubeIframeApi() {
  if (window.YT?.Player) {
    return Promise.resolve(window.YT);
  }

  if (youtubeApiPromise) {
    return youtubeApiPromise;
  }

  youtubeApiPromise =
    new Promise((resolve, reject) => {
      let settled = false;

      const timeoutId =
        window.setTimeout(() => {
          if (window.YT?.Player) {
            settled = true;
            resolve(window.YT);
          } else {
            youtubeApiPromise = null;

            reject(
              new Error(
                "YouTube player could not be loaded."
              )
            );
          }
        }, 15000);


      function finish() {
        if (settled) return;

        settled = true;

        window.clearTimeout(
          timeoutId
        );

        if (window.YT?.Player) {
          resolve(window.YT);
        } else {
          youtubeApiPromise = null;

          reject(
            new Error(
              "YouTube player could not be initialised."
            )
          );
        }
      }


      const previousCallback =
        window.onYouTubeIframeAPIReady;


      window.onYouTubeIframeAPIReady =
        () => {
          try {
            if (
              typeof previousCallback ===
              "function"
            ) {
              previousCallback();
            }
          } catch {
            // Ignore another player's callback error.
          }

          finish();
        };


      const existingScript =
        document.querySelector(
          'script[src="https://www.youtube.com/iframe_api"]'
        );


      if (existingScript) {
        return;
      }


      const script =
        document.createElement(
          "script"
        );

      script.src =
        "https://www.youtube.com/iframe_api";

      script.async = true;


      script.onerror = () => {
        window.clearTimeout(
          timeoutId
        );

        youtubeApiPromise = null;

        reject(
          new Error(
            "Unable to load YouTube."
          )
        );
      };


      document.head.appendChild(
        script
      );
    });


  return youtubeApiPromise;
}


/* =========================================================
   HELPERS
   ========================================================= */

function formatTime(seconds) {
  const safe =
    Number.isFinite(Number(seconds))
      ? Math.max(
          0,
          Math.floor(Number(seconds))
        )
      : 0;

  const minutes =
    Math.floor(safe / 60);

  const remaining =
    safe % 60;

  return `${minutes}:${String(
    remaining
  ).padStart(2, "0")}`;
}


function formatTimerRemaining(
  seconds
) {
  if (!seconds) return "";

  const minutes =
    Math.floor(seconds / 60);

  const remaining =
    seconds % 60;

  return `${minutes}:${String(
    remaining
  ).padStart(2, "0")}`;
}


/* =========================================================
   WAVEFORM
   Decorative waveform matching Figma.
   Actual playback still comes from YouTube.
   ========================================================= */

const WAVE_BARS = Array.from(
  { length: 104 },
  (_, index) => {
    const position =
      index / 103;

    const group1 =
      Math.exp(
        -Math.pow(
          (position - 0.24) / 0.105,
          2
        )
      );

    const group2 =
      Math.exp(
        -Math.pow(
          (position - 0.51) / 0.12,
          2
        )
      );

    const group3 =
      Math.exp(
        -Math.pow(
          (position - 0.72) / 0.09,
          2
        )
      );

    const group4 =
      Math.exp(
        -Math.pow(
          (position - 0.88) / 0.055,
          2
        )
      );

    const ripple =
      0.76 +
      Math.abs(
        Math.sin(index * 0.57)
      ) *
        0.24;

    const value =
      12 +
      (
        group1 * 54 +
        group2 * 66 +
        group3 * 48 +
        group4 * 36
      ) *
        ripple;

    return Math.max(
      10,
      Math.min(86, value)
    );
  }
);


/* =========================================================
   PAGE
   ========================================================= */

export default function SleepPlayerPage() {
  const { slug } = useParams();

  const navigate =
    useNavigate();


  const playerMountRef =
    useRef(null);

  const playerRef =
    useRef(null);

  const progressIntervalRef =
    useRef(null);

  const timerIntervalRef =
    useRef(null);


  const [track, setTrack] =
    useState(null);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  const [
    playerReady,
    setPlayerReady,
  ] = useState(false);

  const [
    isPlaying,
    setIsPlaying,
  ] = useState(false);

  const [
    currentTime,
    setCurrentTime,
  ] = useState(0);

  const [
    duration,
    setDuration,
  ] = useState(0);

  const [
    volume,
    setVolume,
  ] = useState(70);

  const [
    timerMinutes,
    setTimerMinutes,
  ] = useState(0);

  const [
    timerRemaining,
    setTimerRemaining,
  ] = useState(0);


  /* =======================================================
     FETCH TRACK
     ======================================================= */

  useEffect(() => {
    let cancelled = false;


    async function loadTrack() {
      setLoading(true);
      setError("");
      setTrack(null);

      try {
        const data =
          await getSleepAudioTrackBySlug(
            slug
          );

        if (!cancelled) {
          setTrack(data);
        }
      } catch (loadError) {
        console.error(
          "Sleep track load error:",
          loadError
        );

        if (!cancelled) {
          setError(
            loadError?.message ||
              "Unable to load this sleep track."
          );
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }


    loadTrack();


    return () => {
      cancelled = true;
    };
  }, [slug]);


  /* =======================================================
     CREATE YOUTUBE PLAYER
     ======================================================= */

  useEffect(() => {
    const videoId =
      track?.youtubeVideoId;

    if (
      !videoId ||
      !playerMountRef.current
    ) {
      return undefined;
    }


    let cancelled = false;


    async function createPlayer() {
      try {
        const YT =
          await loadYouTubeIframeApi();

        if (
          cancelled ||
          !playerMountRef.current
        ) {
          return;
        }


        playerRef.current =
          new YT.Player(
            playerMountRef.current,
            {
              width: "220",
              height: "124",

              videoId,

              playerVars: {
                autoplay: 0,
                controls: 0,
                disablekb: 1,
                fs: 0,
                modestbranding: 1,
                playsinline: 1,
                rel: 0,
                iv_load_policy: 3,
                enablejsapi: 1,

                origin:
                  window.location.origin,
              },

              events: {
                onReady: (event) => {
                  if (cancelled) return;

                  const player =
                    event.target;

                  /*
                    IMPORTANT:
                    Do not autoplay.

                    Chrome can block audible
                    autoplay.

                    We wait for the user to
                    press our Play button.
                  */

                  try {
                    player.setVolume(
                      volume
                    );
                  } catch {
                    // Ignore volume setup error.
                  }


                  setPlayerReady(
                    true
                  );


                  const youtubeDuration =
                    Number(
                      player.getDuration?.()
                    ) || 0;

                  if (
                    youtubeDuration > 0
                  ) {
                    setDuration(
                      youtubeDuration
                    );
                  }


                  progressIntervalRef.current =
                    window.setInterval(
                      () => {
                        if (
                          !playerRef.current
                        ) {
                          return;
                        }

                        try {
                          const time =
                            Number(
                              playerRef.current.getCurrentTime?.()
                            ) || 0;

                          const total =
                            Number(
                              playerRef.current.getDuration?.()
                            ) || 0;

                          setCurrentTime(
                            time
                          );

                          if (total > 0) {
                            setDuration(
                              total
                            );
                          }
                        } catch {
                          // Player temporarily unavailable.
                        }
                      },
                      350
                    );
                },


                onStateChange: (
                  event
                ) => {
                  if (cancelled) return;

                  if (
                    event.data ===
                    YT.PlayerState
                      .PLAYING
                  ) {
                    setIsPlaying(
                      true
                    );

                    setError("");
                  }

                  if (
                    event.data ===
                      YT.PlayerState
                        .PAUSED ||
                    event.data ===
                      YT.PlayerState
                        .ENDED ||
                    event.data ===
                      YT.PlayerState
                        .CUED
                  ) {
                    setIsPlaying(
                      false
                    );
                  }


                  if (
                    event.data ===
                    YT.PlayerState
                      .ENDED
                  ) {
                    setCurrentTime(
                      0
                    );
                  }
                },


                onError: (event) => {
                  setIsPlaying(false);

                  const code =
                    Number(
                      event?.data
                    );


                  if (
                    code === 101 ||
                    code === 150
                  ) {
                    setError(
                      "This YouTube track does not allow embedded playback."
                    );

                    return;
                  }


                  if (code === 100) {
                    setError(
                      "This YouTube track is unavailable."
                    );

                    return;
                  }


                  setError(
                    "This audio could not be played. Please try again."
                  );
                },
              },
            }
          );
      } catch (playerError) {
        console.error(
          "Sleep player error:",
          playerError
        );

        if (!cancelled) {
          setError(
            playerError?.message ||
              "Unable to initialise the audio player."
          );
        }
      }
    }


    createPlayer();


    return () => {
      cancelled = true;

      setPlayerReady(false);
      setIsPlaying(false);


      if (
        progressIntervalRef.current
      ) {
        window.clearInterval(
          progressIntervalRef.current
        );

        progressIntervalRef.current =
          null;
      }


      try {
        playerRef.current?.destroy?.();
      } catch {
        // Ignore YouTube cleanup errors.
      }


      playerRef.current = null;
    };
  }, [
    track?.youtubeVideoId,
  ]);


  /* =======================================================
     VOLUME SYNC
     ======================================================= */

  useEffect(() => {
    if (
      !playerReady ||
      !playerRef.current
    ) {
      return;
    }

    try {
      playerRef.current.setVolume(
        volume
      );

      if (volume <= 0) {
        playerRef.current.mute();
      } else {
        /*
          Explicitly unmute.

          This is important because a YouTube
          player can remain muted after its
          initial state.
        */
        playerRef.current.unMute();
      }
    } catch {
      // Ignore temporary player state errors.
    }
  }, [
    volume,
    playerReady,
  ]);


  /* =======================================================
     SLEEP TIMER
     ======================================================= */

  useEffect(() => {
    if (
      timerIntervalRef.current
    ) {
      window.clearInterval(
        timerIntervalRef.current
      );

      timerIntervalRef.current =
        null;
    }


    if (!timerMinutes) {
      setTimerRemaining(0);
      return undefined;
    }


    const totalSeconds =
      timerMinutes * 60;

    const deadline =
      Date.now() +
      totalSeconds * 1000;


    setTimerRemaining(
      totalSeconds
    );


    function checkTimer() {
      const remaining =
        Math.max(
          0,
          Math.ceil(
            (
              deadline -
              Date.now()
            ) /
              1000
          )
        );


      setTimerRemaining(
        remaining
      );


      if (remaining <= 0) {
        if (
          timerIntervalRef.current
        ) {
          window.clearInterval(
            timerIntervalRef.current
          );

          timerIntervalRef.current =
            null;
        }


        try {
          playerRef.current?.pauseVideo?.();
        } catch {
          // Ignore.
        }


        setIsPlaying(false);


        /*
          Timer requirement:
          stop the sound AND close the
          player when time is finished.
        */

        navigate(
          "/app/sleep-stories",
          {
            replace: true,
          }
        );
      }
    }


    timerIntervalRef.current =
      window.setInterval(
        checkTimer,
        500
      );


    return () => {
      if (
        timerIntervalRef.current
      ) {
        window.clearInterval(
          timerIntervalRef.current
        );

        timerIntervalRef.current =
          null;
      }
    };
  }, [
    timerMinutes,
    navigate,
  ]);


  /* =======================================================
     CONTROLS
     ======================================================= */

  function handlePlayPause() {
    const player =
      playerRef.current;

    if (
      !player ||
      !playerReady
    ) {
      return;
    }


    try {
      const state =
        player.getPlayerState?.();


      if (
        state ===
        window.YT?.PlayerState
          ?.PLAYING
      ) {
        player.pauseVideo();

        return;
      }


      /*
        THIS fixes the silent playback issue.

        playVideo() is being called directly
        from the user's click, so Chrome allows
        audible playback.
      */

      player.setVolume(volume);

      if (volume > 0) {
        player.unMute();
      } else {
        player.mute();
      }

      player.playVideo();
    } catch (playError) {
      console.error(
        "Play/pause error:",
        playError
      );

      setError(
        "Unable to start this audio. Please press Play again."
      );
    }
  }


  function skipBy(seconds) {
    const player =
      playerRef.current;

    if (!player) return;


    try {
      const current =
        Number(
          player.getCurrentTime?.()
        ) || 0;

      const total =
        Number(
          player.getDuration?.()
        ) || duration;

      const next =
        Math.max(
          0,
          Math.min(
            total || Infinity,
            current + seconds
          )
        );

      player.seekTo(
        next,
        true
      );

      setCurrentTime(next);
    } catch {
      // Ignore seek error.
    }
  }


  function handleSeek(event) {
    const value =
      Number(
        event.target.value
      );

    setCurrentTime(value);


    try {
      playerRef.current?.seekTo?.(
        value,
        true
      );
    } catch {
      // Ignore.
    }
  }


  function handleVolume(event) {
    const next =
      Number(
        event.target.value
      );

    setVolume(next);
  }


  function handleBack() {
    try {
      playerRef.current?.pauseVideo?.();
    } catch {
      // Ignore.
    }

    navigate(
      "/app/sleep-stories"
    );
  }


  const progress =
    duration > 0
      ? Math.min(
          100,
          Math.max(
            0,
            (currentTime /
              duration) *
              100
          )
        )
      : 0;


  const waveBars =
    useMemo(
      () => WAVE_BARS,
      []
    );


  /* =======================================================
     LOADING
     ======================================================= */

  if (loading) {
    return (
      <AppLayout>
        <div className="sleep-player-page">
          <div className="sleep-player-loading">
            Loading sleep audio...
          </div>
        </div>
      </AppLayout>
    );
  }


  if (!track) {
    return (
      <AppLayout>
        <div className="sleep-player-page">
          <div className="sleep-player-error">
            <h2>
              Audio unavailable
            </h2>

            <p>
              {error ||
                "This sleep audio could not be found."}
            </p>

            <button
              type="button"
              onClick={handleBack}
            >
              Back to Sleep Stories
            </button>
          </div>
        </div>
      </AppLayout>
    );
  }


  return (
    <AppLayout>
      <div className="sleep-player-page">

        <section className="sleep-player-card">

          {/* ===============================
              TOP
              =============================== */}

          <div className="sleep-player-header">

            <button
              type="button"
              className="sleep-player-back"
              onClick={handleBack}
            >
              <ArrowLeft
                size={18}
                strokeWidth={1.5}
              />

              Back
            </button>


            <div className="sleep-player-title">
              <h1>
                {track.title}
              </h1>

              <p>
                {track.author
                  ? `a story by ${track.author}`
                  : "a story by Anandam"}
              </p>
            </div>


            <label className="sleep-timer-field">

              <span>
                Sleep Timer
              </span>

              <select
                value={timerMinutes}
                onChange={(event) =>
                  setTimerMinutes(
                    Number(
                      event.target.value
                    )
                  )
                }
              >
                <option value={0}>
                  Off
                </option>

                <option value={15}>
                  15 Minutes
                </option>

                <option value={30}>
                  30 Minutes
                </option>

                <option value={45}>
                  45 Minutes
                </option>

                <option value={60}>
                  1 hour
                </option>
              </select>


              {timerRemaining > 0 ? (
                <small>
                  Stops in{" "}
                  {formatTimerRemaining(
                    timerRemaining
                  )}
                </small>
              ) : null}

            </label>

          </div>


          {/* ===============================
              WAVEFORM
              =============================== */}

          <div className="sleep-wave-panel">

            <div
              className={`sleep-waveform${
                isPlaying
                  ? " is-playing"
                  : ""
              }`}
              aria-hidden="true"
            >

              {waveBars.map(
                (
                  height,
                  index
                ) => (
                  <span
                    key={index}
                    style={{
                      "--wave-height":
                        `${height}%`,

                      "--wave-speed":
                        `${
                          0.72 +
                          (index % 9) *
                            0.045
                        }s`,

                      "--wave-delay":
                        `${
                          -(
                            index %
                            13
                          ) *
                          0.037
                        }s`,
                    }}
                  />
                )
              )}

            </div>

          </div>


          {/* ===============================
              PROGRESS
              =============================== */}

          <div className="sleep-progress-section">

            <input
              type="range"
              min="0"
              max={
                Math.max(
                  duration,
                  1
                )
              }
              step="0.1"
              value={
                Math.min(
                  currentTime,
                  Math.max(
                    duration,
                    1
                  )
                )
              }
              onChange={
                handleSeek
              }
              className="sleep-progress-range"
              style={{
                "--sleep-progress":
                  `${progress}%`,
              }}
              aria-label="Audio progress"
            />


            <div className="sleep-progress-times">

              <strong>
                {formatTime(
                  currentTime
                )}
              </strong>

              <span>
                {duration
                  ? formatTime(
                      duration
                    )
                  : "--:--"}
              </span>

            </div>

          </div>


          {/* ===============================
              CONTROLS
              =============================== */}

          <div className="sleep-player-controls">

            <div className="sleep-player-controls__spacer" />


            <div className="sleep-main-controls">

              <button
                type="button"
                className="sleep-skip-button"
                onClick={() =>
                  skipBy(-10)
                }
                aria-label="Go back 10 seconds"
              >
                <RotateCcw
                  size={35}
                  strokeWidth={1.5}
                />

                <span>10</span>
              </button>


              <button
                type="button"
                className="sleep-play-button"
                onClick={
                  handlePlayPause
                }
                disabled={
                  !playerReady
                }
                aria-label={
                  isPlaying
                    ? "Pause"
                    : "Play"
                }
              >

                {isPlaying ? (
                  <Pause
                    size={30}
                    fill="currentColor"
                  />
                ) : (
                  <Play
                    size={30}
                    fill="currentColor"
                  />
                )}

              </button>


              <button
                type="button"
                className="sleep-skip-button"
                onClick={() =>
                  skipBy(10)
                }
                aria-label="Skip forward 10 seconds"
              >
                <RotateCw
                  size={35}
                  strokeWidth={1.5}
                />

                <span>10</span>
              </button>

            </div>


            <div className="sleep-volume-control">

              {volume > 0 ? (
                <Volume2
                  size={27}
                  strokeWidth={1.5}
                />
              ) : (
                <VolumeX
                  size={27}
                  strokeWidth={1.5}
                />
              )}


              <input
                type="range"
                min="0"
                max="100"
                step="1"
                value={volume}
                onChange={
                  handleVolume
                }
                aria-label="Volume"
                style={{
                  "--sleep-volume":
                    `${volume}%`,
                }}
              />

            </div>

          </div>


          {/* =================================
              REAL YOUTUBE PLAYBACK ENGINE

              Keep mounted.
              Do NOT use display:none.
              ================================= */}

          {track.youtubeVideoId ? (
            <div
              className="sleep-youtube-engine"
              aria-hidden="true"
            >
              <div
                ref={
                  playerMountRef
                }
              />
            </div>
          ) : (
            <div className="sleep-player-inline-error">
              No YouTube audio has been configured for this track.
            </div>
          )}


          {error ? (
            <div
              className="sleep-player-inline-error"
              role="alert"
            >
              {error}
            </div>
          ) : null}

        </section>

      </div>
    </AppLayout>
  );
}