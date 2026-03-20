import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { loginUser } from "../api/authApi";
import { resetMoodGate } from "../utils/storage";
import { setAuthSession } from "../api/client";
import "../styles/auth.css";

function LoginPage() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
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
      const data = await loginUser({
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
      setError(err.message || "Login failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="auth-page">
      <div className="auth-card">
        <h1>Welcome back</h1>
        <p>Sign in to continue your mental wellness journey.</p>

        <form onSubmit={handleSubmit} className="auth-form">
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
            autoComplete="current-password"
          />

          {error ? <p className="auth-error">{error}</p> : null}

          <button type="submit" disabled={loading}>
            {loading ? "Signing in..." : "Sign In"}
          </button>
        </form>

        <p className="auth-footer-text">
          Don’t have an account? <Link to="/signup">Create one</Link>
        </p>
      </div>
    </div>
  );
}

export default LoginPage;