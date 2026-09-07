import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import { loginUser, registerUser } from "../api/authApi";
import { resetMoodGate, saveAuthSession } from "../utils/storage";

import leafFrame11 from "../assets/loginpage/Property 1=Frame 11.png";
import leafFrame12 from "../assets/loginpage/Property 1=Frame 12.png";
import leafFrame13 from "../assets/loginpage/Property 1=Frame 13.png";
import leafFrame14 from "../assets/loginpage/Property 1=Frame 14.png";
import leafFrame15 from "../assets/loginpage/Property 1=Frame 15.png";
import leafFrame16 from "../assets/loginpage/Property 1=Frame 16.png";
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
          className={`anandam-signup-leaf-frame${
            activeFrame === index ? " is-active" : ""
          }`}
        />
      ))}
    </div>
  );
}

function getApiErrorMessage(error) {
  return (
    error?.response?.data?.message ||
    error?.response?.data?.error ||
    error?.message ||
    "Signup failed. Please try again."
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

    setLoading(true);

    try {
      await registerUser({
        fullName,
        email,
        password: form.password,
      });

      const loginData = await loginUser({
        email,
        password: form.password,
      });

      saveAuthSession({
        token: loginData.token,
        refreshToken: loginData.refreshToken,
        user: loginData.user,
      });

      resetMoodGate();
      navigate("/mood-quick", { replace: true });
    } catch (error) {
      const message = getApiErrorMessage(error);
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
          aria-label="Wellness illustration"
        >
          <AnimatedLeaf />
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
                  className={`anandam-signup-password-control${
                    fieldErrors.password ? " has-error" : ""
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
