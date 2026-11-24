import { useEffect, useMemo, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import "../styles/welcome-loading.css";

// Only these two images are used for the welcome loading screen.
import loadingScreen1 from "../assets/marketplace/resortslogin/loginloadscreen1.png";
import loadingScreen2 from "../assets/marketplace/resortslogin/loginloadscreen2.png";

const scenicPhotos = [loadingScreen1, loadingScreen2];

// Find just the bird-chirping audio; do not discover any additional images.
const audioModules = import.meta.glob(
  "../assets/marketplace/resortslogin/*.{mp3,wav,ogg,m4a}",
  { eager: true, query: "?url", import: "default" }
);
const birdAudio = Object.entries(audioModules).find(([path]) =>
  /bird|chirp|morning/i.test(path.split("/").pop())
)?.[1];

const DURATION_MS = 10000;
const IMAGE_CHANGE_MS = 5000;

function randomPair(images) {
  if (images.length < 2) return [images[0] || null, images[0] || null];
  const first = Math.floor(Math.random() * images.length);
  const offset = 1 + Math.floor(Math.random() * (images.length - 1));
  return [images[first], images[(first + offset) % images.length]];
}

export default function WelcomeLoadingPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const audioRef = useRef(null);
  const [slide, setSlide] = useState(0);
  const [audioBlocked, setAudioBlocked] = useState(false);
  const images = useMemo(() => randomPair(scenicPhotos), []);

  // Restrict the target to an internal application route.
  const requestedNext = location.state?.next;
  const next =
    typeof requestedNext === "string" &&
    requestedNext.startsWith("/") &&
    !requestedNext.startsWith("//") &&
    !requestedNext.startsWith("/welcome")
      ? requestedNext
      : "/dashboard";

  useEffect(() => {
    const changeTimer = window.setTimeout(() => setSlide(1), IMAGE_CHANGE_MS);
    const doneTimer = window.setTimeout(() => {
      navigate(next, { replace: true });
    }, DURATION_MS);
    return () => {
      window.clearTimeout(changeTimer);
      window.clearTimeout(doneTimer);
    };
  }, [navigate, next]);

  useEffect(() => {
    if (!audioRef.current) return undefined;
    const audio = audioRef.current;
    audio.volume = 0.35;
    audio.play().catch(() => setAudioBlocked(true));
    return () => {
      audio.pause();
      audio.currentTime = 0;
    };
  }, []);

  const enableSound = () => {
    audioRef.current?.play()
      .then(() => setAudioBlocked(false))
      .catch(() => setAudioBlocked(true));
  };

  return (
    <main className="welcome-loading" aria-label="Welcome to Anandam">
      {images.map((src, index) =>
        src ? (
          <div
            key={`${src}-${index}`}
            className={`welcome-loading__image ${index === slide ? "is-visible" : ""}`}
            style={{ backgroundImage: `url("${src}")` }}
            aria-hidden="true"
          />
        ) : null
      )}
      <div className="welcome-loading__shade" />
      <div className="welcome-loading__content">
        <span className="welcome-loading__eyebrow">ANANDAM</span>
        <h1>Welcome to your wellbeing journey</h1>
        <p>A peaceful moment before you begin.</p>
        <div className="welcome-loading__progress" aria-label="Loading">
          <span />
        </div>
      </div>
      {birdAudio ? <audio ref={audioRef} src={birdAudio} preload="auto" loop /> : null}
      {birdAudio && audioBlocked ? (
        <button type="button" className="welcome-loading__sound" onClick={enableSound}>
          Enable nature sounds
        </button>
      ) : null}
    </main>
  );
}
