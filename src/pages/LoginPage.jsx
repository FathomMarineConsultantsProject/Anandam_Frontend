import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import { loginUser } from "../api/authApi";
import { resetMoodGate, saveAuthSession } from "../utils/storage";

import leafFrame11 from "../assets/loginpage/Property 1=Frame 11.png";
import leafFrame12 from "../assets/loginpage/Property 1=Frame 12.png";
import leafFrame13 from "../assets/loginpage/Property 1=Frame 13.png";
import leafFrame14 from "../assets/loginpage/Property 1=Frame 14.png";
import leafFrame15 from "../assets/loginpage/Property 1=Frame 15.png";
import leafFrame16 from "../assets/loginpage/Property 1=Frame 16.png";
import backgroundWave from "../assets/landing/about-wave.png";
import bgLeaf from "../assets/loginpage/image9.png";

import "../styles/login.css";

/*
 * Order matched to the supplied Figma animation recording:
 * pigeon -> triangle -> meditation -> warrior -> downward dog -> cobra.
 */
const LEAF_FRAMES = [
  leafFrame16,
  leafFrame11,
  leafFrame14,
  leafFrame13,
  leafFrame12,
  leafFrame15,
];

const LEAF_FRAME_INTERVAL_MS = 1500;

function EyeIcon({ hidden }) {
  if (hidden) {
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

function AnimatedLeaf() {
  const [activeFrame, setActiveFrame] = useState(0);

  useEffect(() => {
    const reducedMotionQuery = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    );

    if (reducedMotionQuery.matches) {
      // The seated meditation pose is the clearest still state.
      setActiveFrame(2);
      return undefined;
    }

    const intervalId = window.setInterval(() => {
      setActiveFrame((current) => (current + 1) % LEAF_FRAMES.length);
    }, LEAF_FRAME_INTERVAL_MS);

    return () => window.clearInterval(intervalId);
  }, []);

  return (
    <div
      className="anandam-login-leaf-stage"
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
          className={`anandam-login-leaf-frame${
            activeFrame === index ? " is-active" : ""
          }`}
        />
      ))}
    </div>
  );
}

function LoginPage() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: "", password: "" });
  const [fieldErrors, setFieldErrors] = useState({});
  const [apiError, setApiError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  function handleChange(event) {
    const { name, value } = event.target;

    setForm((previous) => ({ ...previous, [name]: value }));

    if (fieldErrors[name]) {
      setFieldErrors((previous) => ({ ...previous, [name]: "" }));
    }

    if (apiError) {
      setApiError("");
    }
  }

  function validate() {
    const errors = {};
    const normalizedEmail = form.email.trim();

    if (!normalizedEmail) {
      errors.email = "Email is required.";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail)) {
      errors.email = "Enter a valid email address.";
    }

    if (!form.password) {
      errors.password = "Password is required.";
    } else if (form.password.length < 6) {
      errors.password = "Password must be at least 6 characters.";
    }

    return errors;
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setApiError("");

    const errors = validate();
    setFieldErrors(errors);

    if (Object.keys(errors).length > 0) {
      return;
    }

    setLoading(true);

    try {
      const loginData = await loginUser({
        email: form.email.trim(),
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
      setApiError(
        error?.message || "Login failed. Please check your credentials.",
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="anandam-login-page">
      <img
        src={backgroundWave}
        alt=""
        aria-hidden="true"
        draggable="false"
        className="anandam-login-decoration anandam-login-decoration--wave-primary"
      />

      <img
        src={backgroundWave}
        alt=""
        aria-hidden="true"
        draggable="false"
        className="anandam-login-decoration anandam-login-decoration--wave-secondary"
      />

      <img
        src={bgLeaf}
        alt=""
        aria-hidden="true"
        draggable="false"
        className="anandam-login-decoration anandam-login-decoration--corner-leaf"
      />

      <main className="anandam-login-layout">
        <section className="anandam-login-visual" aria-label="Wellness illustration">
          <AnimatedLeaf />
        </section>

        <section className="anandam-login-panel" aria-labelledby="login-title">
          <header className="anandam-login-intro">
            <h1 id="login-title">Welcome Back</h1>
            <p>
              Today is a new day. It&apos;s your day. You shape it. Sign in to continue your wellbeing journey.
            </p>
          </header>

          <form
            className="anandam-login-form"
            onSubmit={handleSubmit}
            noValidate
          >
            <div className="anandam-login-fields">
              <div className="anandam-login-field anandam-login-field--email">
                <label htmlFor="login-email">Email</label>
                <input
                  id="login-email"
                  name="email"
                  type="email"
                  inputMode="email"
                  placeholder="Example@email.com"
                  value={form.email}
                  onChange={handleChange}
                  autoComplete="email"
                  aria-invalid={Boolean(fieldErrors.email)}
                  aria-describedby={
                    fieldErrors.email ? "login-email-error" : undefined
                  }
                  className={fieldErrors.email ? "has-error" : ""}
                  disabled={loading}
                />

                {fieldErrors.email && (
                  <span
                    id="login-email-error"
                    className="anandam-login-field-error"
                    role="alert"
                  >
                    {fieldErrors.email}
                  </span>
                )}
              </div>

              <div className="anandam-login-password-group">
                <div className="anandam-login-field anandam-login-field--password">
                  <label htmlFor="login-password">Password</label>

                  <div
                    className={`anandam-login-password-control${
                      fieldErrors.password ? " has-error" : ""
                    }`}
                  >
                    <input
                      id="login-password"
                      name="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="At least 8 characters"
                      value={form.password}
                      onChange={handleChange}
                      autoComplete="current-password"
                      aria-invalid={Boolean(fieldErrors.password)}
                      aria-describedby={
                        fieldErrors.password
                          ? "login-password-error"
                          : undefined
                      }
                      disabled={loading}
                    />

                    <button
                      type="button"
                      className="anandam-login-password-toggle"
                      onClick={() => setShowPassword((visible) => !visible)}
                      aria-label={
                        showPassword ? "Hide password" : "Show password"
                      }
                      aria-pressed={showPassword}
                      disabled={loading}
                    >
                      <EyeIcon hidden={showPassword} />
                    </button>
                  </div>

                  {fieldErrors.password && (
                    <span
                      id="login-password-error"
                      className="anandam-login-field-error"
                      role="alert"
                    >
                      {fieldErrors.password}
                    </span>
                  )}
                </div>

                <Link
                  to="/forgot-password"
                  className="anandam-login-forgot-link"
                >
                  Forgot Password?
                </Link>
              </div>
            </div>

            <div className="anandam-login-actions">
              {apiError && (
                <p className="anandam-login-api-error" role="alert">
                  {apiError}
                </p>
              )}

              <button
                type="submit"
                className="anandam-login-submit"
                disabled={loading}
              >
                {loading ? "Signing in..." : "Sign in"}
              </button>

              <div className="anandam-login-divider" aria-hidden="true" />

              <p className="anandam-login-signup-offer">
                <span>Dont have an account?</span>
                <Link to="/signup">Sign up now</Link>
              </p>
            </div>
          </form>
        </section>
      </main>
    </div>
  );
}

export default LoginPage;
