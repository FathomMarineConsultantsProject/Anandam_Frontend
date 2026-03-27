import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { registerUser, loginUser } from "../api/authApi";
import { saveAuthSession, resetMoodGate } from "../utils/storage";
import "../styles/auth.css";

function SignupPage() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ fullName: "", email: "", password: "" });
  const [fieldErrors, setFieldErrors] = useState({});
  const [apiError, setApiError] = useState("");
  const [loading, setLoading] = useState(false);

  function handleChange(e) {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));

    if (fieldErrors[name]) {
      setFieldErrors((prev) => ({ ...prev, [name]: "" }));
    }

    if (apiError) {
      setApiError("");
    }
  }

  function validate() {
    const errs = {};

    if (!form.fullName.trim()) {
      errs.fullName = "Full name is required.";
    } else if (form.fullName.trim().length < 2) {
      errs.fullName = "Name must be at least 2 characters.";
    }

    if (!form.email.trim()) {
      errs.email = "Email is required.";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) {
      errs.email = "Enter a valid email address.";
    }

    if (!form.password) {
      errs.password = "Password is required.";
    } else if (form.password.length < 6) {
      errs.password = "Password must be at least 6 characters.";
    }

    return errs;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setApiError("");

    const errs = validate();
    if (Object.keys(errs).length) {
      setFieldErrors(errs);
      return;
    }

    setLoading(true);

    try {
      await registerUser({
        fullName: form.fullName.trim(),
        email: form.email.trim(),
        password: form.password,
      });

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
    } catch (err) {
      setApiError(err.message || "Signup failed. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="auth-page">
      <div className="auth-card">
        <h1>Create your account</h1>
        <p>Begin your wellness journey with Anandüm by Fathom.</p>

        <form onSubmit={handleSubmit} className="auth-form" noValidate>
          <div className="auth-field">
            <input
              name="fullName"
              placeholder="Full Name"
              value={form.fullName}
              onChange={handleChange}
              autoComplete="name"
              className={fieldErrors.fullName ? "input-error" : ""}
              disabled={loading}
            />
            {fieldErrors.fullName && (
              <span className="field-error">{fieldErrors.fullName}</span>
            )}
          </div>

          <div className="auth-field">
            <input
              name="email"
              type="email"
              placeholder="Email"
              value={form.email}
              onChange={handleChange}
              autoComplete="email"
              className={fieldErrors.email ? "input-error" : ""}
              disabled={loading}
            />
            {fieldErrors.email && (
              <span className="field-error">{fieldErrors.email}</span>
            )}
          </div>

          <div className="auth-field">
            <input
              name="password"
              type="password"
              placeholder="Password (min. 6 characters)"
              value={form.password}
              onChange={handleChange}
              autoComplete="new-password"
              className={fieldErrors.password ? "input-error" : ""}
              disabled={loading}
            />
            {fieldErrors.password && (
              <span className="field-error">{fieldErrors.password}</span>
            )}
          </div>

          {apiError && <p className="auth-error">{apiError}</p>}

          <button type="submit" disabled={loading}>
            {loading ? "Creating account..." : "Sign Up"}
          </button>
        </form>

        <p className="auth-footer-text">
          Already have an account? <Link to="/login">Sign in</Link>
        </p>
      </div>
    </div>
  );
}

export default SignupPage;