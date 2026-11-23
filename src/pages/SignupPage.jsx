import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import {
  registerUser,
} from "../api/authApi";

import {
  getUserFriendlyError,
} from "../api/client";
import { resetMoodGate } from "../utils/storage";
import { beginResortSignup } from "../api/resortSignupDraft";

import leafFrame11 from "../assets/loginpage/Property 1=Frame 11.png";
import leafFrame12 from "../assets/loginpage/Property 1=Frame 12.png";
import leafFrame13 from "../assets/loginpage/Property 1=Frame 13.png";
import leafFrame14 from "../assets/loginpage/Property 1=Frame 14.png";
import leafFrame15 from "../assets/loginpage/Property 1=Frame 15.png";
import leafFrame16 from "../assets/loginpage/Property 1=Frame 16.png";
import resortMountain from "../assets/marketplace/resortslogin/image 429.png";
import resortBackwater from "../assets/marketplace/resortslogin/Clay backwater retreat diorama-8 1.png";
import resortForest from "../assets/marketplace/resortslogin/Forest wellness resort diorama-2 1.png";
import resortSeaModern from "../assets/marketplace/resortslogin/Modern clay sea-facing resort diorama-6 1.png";
import resortMeadow from "../assets/marketplace/resortslogin/Open Meadow Wellness Resort-2 1.png";
import resortSea from "../assets/marketplace/resortslogin/Sea-facing clay resort diorama-3 1.png";
import resortRajasthan from "../assets/marketplace/resortslogin/Sunlit Rajasthan Wellness Courtyard-3 1.png";
import resortTerracotta from "../assets/marketplace/resortslogin/Terracotta wellness retreat on sandstone-1 1.png";
import resortModernForest from "../assets/marketplace/resortslogin/Modern forest retreat diorama-5 1.png";
import bgLeaf from "../assets/loginpage/image9.png";
import backgroundWave from "../assets/landing/about-wave.png";

import "../styles/signup.css";

/* Same pose sequence and timing as the redesigned login page. */
const LEAF_FRAMES = [
  leafFrame16,
  leafFrame11,
  leafFrame14,
  leafFrame13,
  leafFrame12,
  leafFrame15,
];

const RESORT_SLIDES = [
  resortMountain,
  resortBackwater,
  resortForest,
  resortSeaModern,
  resortMeadow,
  resortSea,
  resortRajasthan,
  resortTerracotta,
  resortModernForest,
];

const LEAF_FRAME_INTERVAL_MS = 1500;
const MIN_PASSWORD_LENGTH = 8;

function EyeIcon({ passwordVisible }) {
  if (passwordVisible) {
    return (
      <svg
        width="18"
        height="18"
        viewBox="0 0 18 18"
        fill="none"
        aria-hidden="true"
      >
        <path
          d="M2.25 2.25L15.75 15.75"
          stroke="currentColor"
          strokeWidth="1.25"
          strokeLinecap="round"
        />
        <path
          d="M7.58 4.02A7.94 7.94 0 0 1 9 3.9c3.64 0 6.13 3.1 6.7 3.9.2.28.2.66 0 .94a10.9 10.9 0 0 1-2.16 2.3"
          stroke="currentColor"
          strokeWidth="1.25"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M10.72 10.72A2.43 2.43 0 0 1 7.28 7.28"
          stroke="currentColor"
          strokeWidth="1.25"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M4.49 5.13A11.36 11.36 0 0 0 2.3 7.8a.8.8 0 0 0 0 .94c.57.8 3.06 3.9 6.7 3.9.7 0 1.36-.11 1.97-.3"
          stroke="currentColor"
          strokeWidth="1.25"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    );
  }

  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 18 18"
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M2.3 8.27C2.88 7.46 5.36 4.35 9 4.35s6.12 3.11 6.7 3.92c.2.28.2.66 0 .94-.58.81-3.06 3.92-6.7 3.92S2.88 10.02 2.3 9.21a.8.8 0 0 1 0-.94Z"
        stroke="currentColor"
        strokeWidth="1.25"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle
        cx="9"
        cy="8.74"
        r="2.25"
        stroke="currentColor"
        strokeWidth="1.25"
      />
    </svg>
  );
}

function LoadingSpinner() {
  return <span className="anandam-signup-spinner" aria-hidden="true" />;
}

function AnimatedLeaf() {
  const [activeFrame, setActiveFrame] = useState(0);

  useEffect(() => {
    const reducedMotionQuery = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    );

    if (reducedMotionQuery.matches) {
      setActiveFrame(2);
      return undefined;
    }

    const intervalId = window.setInterval(() => {
      setActiveFrame((currentFrame) => {
        return (currentFrame + 1) % LEAF_FRAMES.length;
      });
    }, LEAF_FRAME_INTERVAL_MS);

    return () => window.clearInterval(intervalId);
  }, []);

  return (
    <div
      className="anandam-signup-leaf-stage"
      role="img"
      aria-label="A dried leaf cycling through calming yoga poses"
    >
      {LEAF_FRAMES.map((frame, index) => (
        <img
          key={frame}
          src={frame}
          alt=""
          aria-hidden="true"
          draggable="false"
          className={`anandam-signup-leaf-frame${activeFrame === index ? " is-active" : ""
            }`}
        />
      ))}
    </div>
  );
}

function ResortSlideshow() {
  const [activeSlide, setActiveSlide] = useState(0);

  const goToSlide = (direction) => {
    setActiveSlide((current) =>
      (current + direction + RESORT_SLIDES.length) % RESORT_SLIDES.length
    );
  };

  return (
    <div className="anandam-signup-resort-showcase" aria-label="Resort illustrations">
      <div className="anandam-signup-resort-gallery">
        {RESORT_SLIDES.map((slide, index) => (
          <img
            key={slide}
            src={slide}
            alt={index === activeSlide ? `Resort illustration ${index + 1} of ${RESORT_SLIDES.length}` : ""}
            aria-hidden={index !== activeSlide}
            className={`anandam-signup-resort-image${index === activeSlide ? " is-active" : ""}`}
            draggable="false"
          />
        ))}
      </div>
      <p className="anandam-signup-resort-caption">
        Welcome the families and crews who keep the world moving
      </p>
      <div className="anandam-signup-resort-controls" aria-label="Resort slideshow controls">
        <div className="anandam-signup-resort-dots" aria-label="Choose resort illustration">
          {RESORT_SLIDES.map((_, index) => (
            <button
              key={index}
              type="button"
              className={`anandam-signup-resort-dot${index === activeSlide ? " is-active" : ""}`}
              aria-label={`Show resort illustration ${index + 1}`}
              aria-current={index === activeSlide ? "true" : undefined}
              onClick={() => setActiveSlide(index)}
            />
          ))}
        </div>
        <div className="anandam-signup-resort-arrows">
          <button type="button" onClick={() => goToSlide(-1)} aria-label="Previous resort image">
            <span aria-hidden="true">←</span>
          </button>
          <button type="button" onClick={() => goToSlide(1)} aria-label="Next resort image">
            <span aria-hidden="true">→</span>
          </button>
        </div>
      </div>
    </div>
  );
}

function SignupPage() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    fullName: "",
    email: "",
    password: "",
  });
  const [fieldErrors, setFieldErrors] = useState({});
  const [apiError, setApiError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [accountType, setAccountType] = useState("USER");

  function handleChange(event) {
    const { name, value } = event.target;

    setForm((previousForm) => ({
      ...previousForm,
      [name]: value,
    }));

    if (fieldErrors[name]) {
      setFieldErrors((previousErrors) => ({
        ...previousErrors,
        [name]: "",
      }));
    }

    if (apiError) {
      setApiError("");
    }
  }

  function validate() {
    const errors = {};
    const normalizedName = form.fullName.trim();
    const normalizedEmail = form.email.trim();

    if (!normalizedName) {
      errors.fullName = "Full name is required.";
    } else if (normalizedName.length < 2) {
      errors.fullName = "Name must be at least 2 characters.";
    }

    if (!normalizedEmail) {
      errors.email = "Email is required.";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail)) {
      errors.email = "Enter a valid email address.";
    }

    if (!form.password) {
      errors.password = "Password is required.";
    } else if (form.password.length < MIN_PASSWORD_LENGTH) {
      errors.password = `Password must be at least ${MIN_PASSWORD_LENGTH} characters.`;
    }

    return errors;
  }

  async function handleSubmit(event) {
    event.preventDefault();

    if (loading) {
      return;
    }

    setApiError("");

    const errors = validate();
    setFieldErrors(errors);

    if (Object.keys(errors).length > 0) {
      return;
    }

    const fullName = form.fullName.trim();
    const email = form.email.trim();

    // RESORT_OWNER: collect the listing first. Do not create a backend account here.
    // Sensitive signup details stay in memory (not in the URL or localStorage).
    if (accountType === "RESORT_OWNER") {
      beginResortSignup({ fullName, email, password: form.password });
      navigate("/resort/onboarding", { replace: false });
      return;
    }

    setLoading(true);

    try {
      const signupData =
        await registerUser({
          fullName,
          email,
          password: form.password,
          accountType,
        });

      if (signupData?.user?.role === "PRACTITIONER") {
        navigate("/practitioner/onboarding", { replace: true });
        return;
      }

      resetMoodGate();
      navigate("/mood-quick", { replace: true });
    } catch (error) {
      const message = getUserFriendlyError(
        error,
        "We couldn\'t create your account. Please try again."
      );
      const isEmailConflict =
        /email/i.test(message) &&
        /(already|exists|registered|taken|in use)/i.test(message);

      if (isEmailConflict) {
        setFieldErrors((previousErrors) => ({
          ...previousErrors,
          email: message,
        }));
      } else {
        setApiError(message);
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="anandam-signup-page">
      <img
        src={backgroundWave}
        alt=""
        aria-hidden="true"
        draggable="false"
        className="anandam-signup-decoration anandam-signup-decoration--wave-primary"
      />

      <img
        src={backgroundWave}
        alt=""
        aria-hidden="true"
        draggable="false"
        className="anandam-signup-decoration anandam-signup-decoration--wave-secondary"
      />

      <img
        src={bgLeaf}
        alt=""
        aria-hidden="true"
        draggable="false"
        className="anandam-signup-decoration anandam-signup-decoration--corner-leaf"
      />

      <main className="anandam-signup-layout">
        <section
          className="anandam-signup-visual"
          aria-label={accountType === "RESORT_OWNER" ? "Resort illustrations" : "Wellness illustration"}
        >
          {accountType === "RESORT_OWNER" ? <ResortSlideshow /> : <AnimatedLeaf />}
        </section>

        <section
          className="anandam-signup-panel"
          aria-labelledby="signup-title"
        >
          <header className="anandam-signup-intro">
            <h1 id="signup-title">Create your account</h1>
            <p>
              Your wellbeing journey begins here. Sign up to take the first
              step.
            </p>
          </header>

          <form
            className="anandam-signup-form"
            onSubmit={handleSubmit}
            noValidate
            aria-busy={loading}
          >
            <div
              className="anandam-signup-account-tabs"
              role="tablist"
              aria-label="Account type"
            >
              <button
                type="button"
                role="tab"
                aria-selected={accountType === "USER"}
                className={accountType === "USER" ? "is-active" : ""}
                onClick={() => setAccountType("USER")}
                disabled={loading}
              >
                Personal account
              </button>

              <button
                type="button"
                role="tab"
                aria-selected={accountType === "PRACTITIONER"}
                className={accountType === "PRACTITIONER" ? "is-active" : ""}
                onClick={() => setAccountType("PRACTITIONER")}
                disabled={loading}
              >
                Coaching / Practitioner 
              </button>

              <button
                type="button"
                role="tab"
                aria-selected={accountType === "RESORT_OWNER"}
                className={accountType === "RESORT_OWNER" ? "is-active" : ""}
                onClick={() => setAccountType("RESORT_OWNER")}
                disabled={loading}
              >
                Resorts / Ashrams
              </button>
            </div>

            <div className="anandam-signup-fields">
              <div className="anandam-signup-field">
                <label htmlFor="signup-full-name">Full Name</label>
                <input
                  id="signup-full-name"
                  name="fullName"
                  type="text"
                  placeholder="Enter your full name"
                  value={form.fullName}
                  onChange={handleChange}
                  autoComplete="name"
                  aria-invalid={Boolean(fieldErrors.fullName)}
                  aria-describedby={
                    fieldErrors.fullName
                      ? "signup-full-name-error"
                      : undefined
                  }
                  className={fieldErrors.fullName ? "has-error" : ""}
                  disabled={loading}
                />

                {fieldErrors.fullName && (
                  <span
                    id="signup-full-name-error"
                    className="anandam-signup-field-error"
                    role="alert"
                  >
                    {fieldErrors.fullName}
                  </span>
                )}
              </div>

              <div className="anandam-signup-field">
                <label htmlFor="signup-email">Email</label>
                <input
                  id="signup-email"
                  name="email"
                  type="email"
                  inputMode="email"
                  placeholder="Example@email.com"
                  value={form.email}
                  onChange={handleChange}
                  autoComplete="email"
                  autoCapitalize="none"
                  spellCheck="false"
                  aria-invalid={Boolean(fieldErrors.email)}
                  aria-describedby={
                    fieldErrors.email ? "signup-email-error" : undefined
                  }
                  className={fieldErrors.email ? "has-error" : ""}
                  disabled={loading}
                />

                {fieldErrors.email && (
                  <span
                    id="signup-email-error"
                    className="anandam-signup-field-error"
                    role="alert"
                  >
                    {fieldErrors.email}
                  </span>
                )}
              </div>

              <div className="anandam-signup-field anandam-signup-field--password">
                <label htmlFor="signup-password">Password</label>

                <div
                  className={`anandam-signup-password-control${fieldErrors.password ? " has-error" : ""
                    }`}
                >
                  <input
                    id="signup-password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="At least 8 characters"
                    value={form.password}
                    onChange={handleChange}
                    autoComplete="new-password"
                    aria-invalid={Boolean(fieldErrors.password)}
                    aria-describedby={
                      fieldErrors.password
                        ? "signup-password-error"
                        : undefined
                    }
                    disabled={loading}
                  />

                  <button
                    type="button"
                    className="anandam-signup-password-toggle"
                    onClick={() => {
                      setShowPassword((isVisible) => !isVisible);
                    }}
                    aria-label={
                      showPassword ? "Hide password" : "Show password"
                    }
                    aria-pressed={showPassword}
                    disabled={loading}
                  >
                    <EyeIcon passwordVisible={showPassword} />
                  </button>
                </div>

                {fieldErrors.password && (
                  <span
                    id="signup-password-error"
                    className="anandam-signup-field-error"
                    role="alert"
                  >
                    {fieldErrors.password}
                  </span>
                )}
              </div>
            </div>

            <div className="anandam-signup-actions">
              {apiError && (
                <p className="anandam-signup-api-error" role="alert">
                  {apiError}
                </p>
              )}

              <button
                type="submit"
                className="anandam-signup-submit"
                disabled={loading}
              >
                <span className="anandam-signup-submit__content">
                  {loading && <LoadingSpinner />}
                  <span>
                    {loading ? "Creating account..." : "Create account"}
                  </span>
                </span>
              </button>

              <div className="anandam-signup-divider" aria-hidden="true" />

              <p className="anandam-signup-login-offer">
                <span>Already have an account?</span>
                <Link to="/login">Sign in</Link>
              </p>
            </div>
          </form>
        </section>
      </main>
    </div>
  );
}

export default SignupPage;
