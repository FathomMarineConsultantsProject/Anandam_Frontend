import { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  sendForgotPasswordCode,
  verifyForgotPasswordCode,
  resetForgotPassword,
} from "../api/forgotPasswordApi";

import backgroundWave from "../assets/landing/about-wave.png";
import bgLeaf from "../assets/loginpage/image9.png";
import leafFrame11 from "../assets/loginpage/Property 1=Frame 11.png";
import leafFrame12 from "../assets/loginpage/Property 1=Frame 12.png";
import leafFrame13 from "../assets/loginpage/Property 1=Frame 13.png";
import leafFrame14 from "../assets/loginpage/Property 1=Frame 14.png";
import leafFrame15 from "../assets/loginpage/Property 1=Frame 15.png";
import leafFrame16 from "../assets/loginpage/Property 1=Frame 16.png";
import "../styles/forgot-password.css";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const OTP_LENGTH = 6;
const MIN_PASSWORD_LENGTH = 8;
const DEFAULT_RESEND_SECONDS = 60;
const LEAF_FRAME_INTERVAL_MS = 1500;

const LEAF_FRAMES = [
  leafFrame16,
  leafFrame11,
  leafFrame14,
  leafFrame13,
  leafFrame12,
  leafFrame15,
];

function EyeIcon({ hidden = false }) {
  return hidden ? (
    <svg viewBox="0 0 18 18" aria-hidden="true">
      <path d="M2 3 16 15M7.1 7.1A2.7 2.7 0 0 0 10.9 10.9M5.05 4.25A8.68 8.68 0 0 1 9 3.3c4 0 6.7 3.7 7.3 4.6.25.38.25.82 0 1.2-.35.55-1.45 2.1-3.2 3.25M10.65 14.55A8.7 8.7 0 0 1 9 14.7c-4 0-6.7-3.7-7.3-4.6a1.08 1.08 0 0 1 0-1.2c.32-.5 1.27-1.86 2.8-2.94" fill="none" stroke="currentColor" strokeWidth="1.25" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  ) : (
    <svg viewBox="0 0 18 18" aria-hidden="true">
      <path d="M2.3 9.21a.8.8 0 0 1 0-.94C2.88 7.46 5.36 4.35 9 4.35s6.12 3.11 6.7 3.92a.8.8 0 0 1 0 .94c-.58.81-3.06 3.92-6.7 3.92S2.88 10.02 2.3 9.21Z" fill="none" stroke="currentColor" strokeWidth="1.25" />
      <circle cx="9" cy="8.74" r="2.25" fill="none" stroke="currentColor" strokeWidth="1.25" />
    </svg>
  );
}

function PencilIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M14.7 5.3 18.7 9.3M4 20l4.3-1 10.4-10.4a2.12 2.12 0 0 0-3-3L5.3 16 4 20Z" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
      <path d="m13.5 7.5 3 3" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg viewBox="0 0 18 18" aria-hidden="true">
      <circle cx="9" cy="9" r="7.5" fill="none" stroke="currentColor" strokeWidth="1.5" />
      <path d="m5.7 9.1 2.1 2.1 4.6-4.6" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function Spinner() {
  return <span className="anandam-forgot-spinner" aria-hidden="true" />;
}

function AnimatedLeaf() {
  const [activeFrame, setActiveFrame] = useState(0);

  useEffect(() => {
    const query = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (query.matches) {
      setActiveFrame(2);
      return undefined;
    }

    const id = window.setInterval(() => {
      setActiveFrame((current) => (current + 1) % LEAF_FRAMES.length);
    }, LEAF_FRAME_INTERVAL_MS);

    return () => window.clearInterval(id);
  }, []);

  return (
    <div className="anandam-forgot-leaf-stage" role="img" aria-label="A dried leaf cycling through calming yoga poses">
      {LEAF_FRAMES.map((frame, index) => (
        <img key={frame} src={frame} alt="" aria-hidden="true" draggable="false" className={`anandam-forgot-leaf-frame${activeFrame === index ? " is-active" : ""}`} />
      ))}
    </div>
  );
}

function ForgotPasswordShell({ children }) {
  return (
    <div className="anandam-forgot-page">
      <img src={backgroundWave} alt="" aria-hidden="true" draggable="false" className="anandam-forgot-decoration anandam-forgot-decoration--wave-primary" />
      <img src={backgroundWave} alt="" aria-hidden="true" draggable="false" className="anandam-forgot-decoration anandam-forgot-decoration--wave-secondary" />
      <img src={bgLeaf} alt="" aria-hidden="true" draggable="false" className="anandam-forgot-decoration anandam-forgot-decoration--corner-leaf" />

      <main className="anandam-forgot-layout">
        <section className="anandam-forgot-visual" aria-label="Wellness illustration">
          <AnimatedLeaf />
        </section>
        {children}
      </main>
    </div>
  );
}

export default function ForgotPasswordPage() {
  const navigate = useNavigate();
  const codeRefs = useRef([]);

  const [step, setStep] = useState("email");
  const [email, setEmail] = useState("");
  const [code, setCode] = useState(Array(OTP_LENGTH).fill(""));
  const [resetToken, setResetToken] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [fieldErrors, setFieldErrors] = useState({});
  const [apiError, setApiError] = useState("");
  const [loading, setLoading] = useState(false);
  const [resendSeconds, setResendSeconds] = useState(0);
  const [codeExpiresIn, setCodeExpiresIn] = useState(0);

  useEffect(() => {
    if (resendSeconds <= 0 && codeExpiresIn <= 0) return undefined;
    const timer = window.setInterval(() => {
      setResendSeconds((s) => Math.max(0, s - 1));
      setCodeExpiresIn((s) => Math.max(0, s - 1));
    }, 1000);
    return () => window.clearInterval(timer);
  }, [resendSeconds, codeExpiresIn]);

  const clearErrors = () => {
    setFieldErrors({});
    setApiError("");
  };

  async function handleSendCode(event) {
    event.preventDefault();
    clearErrors();
    const normalized = email.trim();

    if (!normalized) return setFieldErrors({ email: "Email is required." });
    if (!EMAIL_REGEX.test(normalized)) return setFieldErrors({ email: "Enter a valid email address." });

    setLoading(true);
    try {
      const response = await sendForgotPasswordCode(normalized);
      setResendSeconds(Number(response?.resendAfterSeconds) || DEFAULT_RESEND_SECONDS);
      setCodeExpiresIn(Number(response?.expiresInSeconds) || 600);
      setCode(Array(OTP_LENGTH).fill(""));
      setStep("code");
      window.setTimeout(() => codeRefs.current[0]?.focus(), 0);
    } catch (error) {
      setApiError(error?.message || "Unable to send verification code. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  function handleCodeChange(index, value) {
    const digit = value.replace(/\D/g, "").slice(-1);
    setCode((current) => {
      const next = [...current];
      next[index] = digit;
      return next;
    });
    if (apiError) setApiError("");
    if (fieldErrors.code) setFieldErrors((current) => ({ ...current, code: "" }));
    if (digit && index < OTP_LENGTH - 1) codeRefs.current[index + 1]?.focus();
  }

  function handleCodeKeyDown(index, event) {
    if (event.key === "Backspace" && !code[index] && index > 0) codeRefs.current[index - 1]?.focus();
    if (event.key === "ArrowLeft" && index > 0) {
      event.preventDefault();
      codeRefs.current[index - 1]?.focus();
    }
    if (event.key === "ArrowRight" && index < OTP_LENGTH - 1) {
      event.preventDefault();
      codeRefs.current[index + 1]?.focus();
    }
  }

  function handleCodePaste(event) {
    const pasted = event.clipboardData.getData("text").replace(/\D/g, "").slice(0, OTP_LENGTH);
    if (!pasted) return;
    event.preventDefault();
    const digits = Array(OTP_LENGTH).fill("");
    pasted.split("").forEach((digit, index) => { digits[index] = digit; });
    setCode(digits);
    setFieldErrors((current) => ({ ...current, code: "" }));
    setApiError("");
    window.setTimeout(() => codeRefs.current[Math.min(pasted.length, OTP_LENGTH - 1)]?.focus(), 0);
  }

  async function handleVerifyCode(event) {
    event.preventDefault();
    clearErrors();
    const verificationCode = code.join("");

    if (!/^\d{6}$/.test(verificationCode)) {
      return setFieldErrors({ code: "Enter the complete 6-digit verification code." });
    }

    setLoading(true);
    try {
      const response = await verifyForgotPasswordCode({ email: email.trim(), code: verificationCode });
      if (!response?.resetToken) throw new Error("Verification succeeded but no reset token was returned. Please request a new code.");
      setResetToken(response.resetToken);
      setStep("password");
    } catch (error) {
      setApiError(error?.message || "Invalid or expired verification code.");
    } finally {
      setLoading(false);
    }
  }

  async function handleResendCode() {
    if (loading || resendSeconds > 0) return;
    clearErrors();
    setLoading(true);
    try {
      const response = await sendForgotPasswordCode(email.trim());
      setCode(Array(OTP_LENGTH).fill(""));
      setResendSeconds(Number(response?.resendAfterSeconds) || DEFAULT_RESEND_SECONDS);
      setCodeExpiresIn(Number(response?.expiresInSeconds) || 600);
      window.setTimeout(() => codeRefs.current[0]?.focus(), 0);
    } catch (error) {
      if (Number(error?.retryAfterSeconds) > 0) setResendSeconds(Number(error.retryAfterSeconds));
      setApiError(error?.message || "Unable to resend the verification code.");
    } finally {
      setLoading(false);
    }
  }

  function handleEditEmail() {
    clearErrors();
    setCode(Array(OTP_LENGTH).fill(""));
    setResetToken("");
    setResendSeconds(0);
    setCodeExpiresIn(0);
    setStep("email");
  }

  async function handleResetPassword(event) {
    event.preventDefault();
    clearErrors();
    const errors = {};

    if (!newPassword) errors.newPassword = "New password is required.";
    else if (newPassword.length < MIN_PASSWORD_LENGTH) errors.newPassword = "Password must contain at least 8 characters.";

    if (!confirmPassword) errors.confirmPassword = "Confirm your new password.";
    else if (newPassword && confirmPassword !== newPassword) errors.confirmPassword = "Passwords do not match.";

    if (Object.keys(errors).length) return setFieldErrors(errors);
    if (!resetToken) {
      setApiError("Your password reset session is missing or expired. Please request a new verification code.");
      return setStep("email");
    }

    setLoading(true);
    try {
      await resetForgotPassword({ resetToken, newPassword, confirmPassword });
      navigate("/login", { replace: true, state: { passwordResetSuccess: true } });
    } catch (error) {
      setApiError(error?.message || "Unable to reset your password.");
    } finally {
      setLoading(false);
    }
  }

  const passwordValid = newPassword.length >= MIN_PASSWORD_LENGTH;

  if (step === "email") {
    return (
      <ForgotPasswordShell>
        <section className="anandam-forgot-panel anandam-forgot-panel--email" aria-labelledby="forgot-password-title">
          <header className="anandam-forgot-intro">
            <h1 id="forgot-password-title">Forgot Password?</h1>
            <p>Enter your registered email address and we&apos;ll send you a verification code.</p>
          </header>

          <form className="anandam-forgot-form" onSubmit={handleSendCode} noValidate>
            <div className="anandam-forgot-field">
              <label htmlFor="forgot-email">Email</label>
              <input id="forgot-email" type="email" inputMode="email" autoComplete="email" placeholder="Example@email.com" value={email} onChange={(e) => { setEmail(e.target.value); setFieldErrors((x) => ({ ...x, email: "" })); setApiError(""); }} className={fieldErrors.email ? "has-error" : ""} disabled={loading} />
              {fieldErrors.email && <span className="anandam-forgot-field-error" role="alert">{fieldErrors.email}</span>}
            </div>

            <div className="anandam-forgot-actions">
              {apiError && <p className="anandam-forgot-api-error" role="alert">{apiError}</p>}
              <button type="submit" className="anandam-forgot-submit" disabled={loading}>{loading ? <><Spinner />Sending code...</> : "Send Code"}</button>
              <div className="anandam-forgot-divider" />
              <p className="anandam-forgot-footer-offer"><span>Remember your password?</span><Link to="/login">Sign In</Link></p>
            </div>
          </form>
        </section>
      </ForgotPasswordShell>
    );
  }

  if (step === "code") {
    return (
      <ForgotPasswordShell>
        <section className="anandam-forgot-panel anandam-forgot-panel--code" aria-labelledby="check-email-title">
          <header className="anandam-forgot-intro">
            <h1 id="check-email-title">Check Your Email</h1>
            <div className="anandam-forgot-email-sent">
              <p>We sent a 6-digit verification code to</p>
              <button type="button" className="anandam-forgot-edit-email" onClick={handleEditEmail}><span>{email}</span><PencilIcon /></button>
            </div>
          </header>

          <form className="anandam-forgot-form" onSubmit={handleVerifyCode} noValidate>
            <div className="anandam-forgot-code-block" onPaste={handleCodePaste}>
              <div className={`anandam-forgot-code-inputs${fieldErrors.code ? " has-error" : ""}`}>
                {code.map((digit, index) => (
                  <input key={index} ref={(el) => { codeRefs.current[index] = el; }} type="text" inputMode="numeric" pattern="[0-9]*" autoComplete={index === 0 ? "one-time-code" : "off"} maxLength={1} value={digit} onChange={(e) => handleCodeChange(index, e.target.value)} onKeyDown={(e) => handleCodeKeyDown(index, e)} aria-label={`Verification code digit ${index + 1}`} disabled={loading} />
                ))}
              </div>
              {fieldErrors.code && <span className="anandam-forgot-code-error" role="alert">{fieldErrors.code}</span>}
              {codeExpiresIn === 0 && <span className="anandam-forgot-code-expired">This code may have expired. Request a new code below.</span>}
            </div>

            <div className="anandam-forgot-actions">
              {apiError && <p className="anandam-forgot-api-error" role="alert">{apiError}</p>}
              <button type="submit" className="anandam-forgot-submit" disabled={loading || code.join("").length !== OTP_LENGTH}>{loading ? <><Spinner />Verifying...</> : "Verify Code"}</button>
              <div className="anandam-forgot-divider" />
              <p className="anandam-forgot-resend"><span>Didn&apos;t receive the code?</span><button type="button" onClick={handleResendCode} disabled={loading || resendSeconds > 0}>{resendSeconds > 0 ? `Resend in ${resendSeconds}s` : "Resend Code"}</button></p>
            </div>
          </form>
        </section>
      </ForgotPasswordShell>
    );
  }

  return (
    <ForgotPasswordShell>
      <section className="anandam-forgot-panel anandam-forgot-panel--password" aria-labelledby="new-password-title">
        <header className="anandam-forgot-intro">
          <h1 id="new-password-title">Create New Password</h1>
          <p>Your new password must be different from passwords you&apos;ve used before.</p>
        </header>

        <form className="anandam-forgot-form" onSubmit={handleResetPassword} noValidate>
          <div className="anandam-forgot-password-fields">
            <div className="anandam-forgot-password-field">
              <label htmlFor="new-password">New Password</label>
              <div className={`anandam-forgot-password-control${fieldErrors.newPassword ? " has-error" : ""}`}>
                <input id="new-password" type={showNewPassword ? "text" : "password"} autoComplete="new-password" placeholder="At least 8 characters" value={newPassword} onChange={(e) => { setNewPassword(e.target.value); setFieldErrors((x) => ({ ...x, newPassword: "" })); setApiError(""); }} disabled={loading} />
                <button type="button" className="anandam-forgot-password-toggle" onClick={() => setShowNewPassword((v) => !v)} aria-label={showNewPassword ? "Hide new password" : "Show new password"}><EyeIcon hidden={showNewPassword} /></button>
              </div>
              <div className={`anandam-forgot-password-rule${passwordValid ? " is-valid" : ""}`}><CheckIcon /><span>At least 8 characters</span></div>
              {fieldErrors.newPassword && <span className="anandam-forgot-field-error" role="alert">{fieldErrors.newPassword}</span>}
            </div>

            <div className="anandam-forgot-password-field">
              <label htmlFor="confirm-new-password">Confirm New Password</label>
              <div className={`anandam-forgot-password-control${fieldErrors.confirmPassword ? " has-error" : ""}`}>
                <input id="confirm-new-password" type={showConfirmPassword ? "text" : "password"} autoComplete="new-password" placeholder="Re-enter your new password" value={confirmPassword} onChange={(e) => { setConfirmPassword(e.target.value); setFieldErrors((x) => ({ ...x, confirmPassword: "" })); setApiError(""); }} disabled={loading} />
                <button type="button" className="anandam-forgot-password-toggle" onClick={() => setShowConfirmPassword((v) => !v)} aria-label={showConfirmPassword ? "Hide confirmation password" : "Show confirmation password"}><EyeIcon hidden={showConfirmPassword} /></button>
              </div>
              {fieldErrors.confirmPassword && <span className="anandam-forgot-field-error" role="alert">{fieldErrors.confirmPassword}</span>}
            </div>
          </div>

          <div className="anandam-forgot-actions">
            {apiError && <p className="anandam-forgot-api-error" role="alert">{apiError}</p>}
            <button type="submit" className="anandam-forgot-submit" disabled={loading}>{loading ? <><Spinner />Resetting...</> : "Reset Password"}</button>
            <div className="anandam-forgot-divider" />
            <p className="anandam-forgot-footer-offer"><span>Dont have an account?</span><Link to="/signup">Sign up now</Link></p>
          </div>
        </form>
      </section>
    </ForgotPasswordShell>
  );
}
