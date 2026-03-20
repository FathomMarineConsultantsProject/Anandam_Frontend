import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { registerUser } from "../api/authApi";
import { resetMoodGate } from "../utils/storage";
import { setAuthSession } from "../api/client";
import "../styles/auth.css";

function SignupPage() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    fullName: "",
    email: "",
    password: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  function handleChange(e) {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const data = await registerUser({
        fullName: form.fullName.trim(),
        email: form.email.trim(),
        password: form.password,
      });

      setAuthSession({
        accessToken: data.accessToken,
        refreshToken: data.refreshToken,
        user: data.user,
      });

      resetMoodGate();
      navigate("/mood-check", { replace: true });
    } catch (err) {
      setError(err.message || "Signup failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="auth-page">
      <div className="auth-card">
        <h1>Create your account</h1>
        <p>Begin your wellness journey with Anandüm by Fathom.</p>

        <form onSubmit={handleSubmit} className="auth-form">
          <input
            name="fullName"
            placeholder="Full Name"
            value={form.fullName}
            onChange={handleChange}
            autoComplete="name"
          />

          <input
            name="email"
            type="email"
            placeholder="Email"
            value={form.email}
            onChange={handleChange}
            autoComplete="email"
          />

          <input
            name="password"
            type="password"
            placeholder="Password"
            value={form.password}
            onChange={handleChange}
            autoComplete="new-password"
          />

          {error ? <p className="auth-error">{error}</p> : null}

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