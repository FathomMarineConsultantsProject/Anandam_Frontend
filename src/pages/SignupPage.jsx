import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { registerUser } from "../api/authApi";
import { saveAuthSession, resetMoodGate } from "../utils/storage";
import "../styles/auth.css";

function SignupPage() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    fullName: "",
    email: "",
    password: "",
    rank: "",
    vessel: "",
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
      const data = await registerUser(form);

      saveAuthSession({
        accessToken: data.accessToken,
        refreshToken: data.refreshToken,
        user: data.user,
      });

      resetMoodGate();
      navigate("/mood-quick");
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
        <p>Begin your wellness journey with Anandam by Fathom.</p>

        <form onSubmit={handleSubmit} className="auth-form">
          <input
            name="fullName"
            placeholder="Full Name"
            value={form.fullName}
            onChange={handleChange}
          />

          <input
            name="email"
            type="email"
            placeholder="Email"
            value={form.email}
            onChange={handleChange}
          />

          <input
            name="password"
            type="password"
            placeholder="Password"
            value={form.password}
            onChange={handleChange}
          />

          <input
            name="rank"
            placeholder="Rank"
            value={form.rank}
            onChange={handleChange}
          />

          <input
            name="vessel"
            placeholder="Vessel"
            value={form.vessel}
            onChange={handleChange}
          />

          {error ? <p className="auth-error">{error}</p> : null}

          <button type="submit" disabled={loading}>
            {loading ? "Creating account..." : "Sign Up"}
          </button>
        </form>

        <p className="auth-footer-text">
          Already have an account? <Link to="/login">Sign in</Link>
        </p>

        <div className="auth-dev-actions">
          <button
            type="button"
            className="auth-dev-link"
            onClick={() => {
              resetMoodGate();
              navigate("/mood-quick");
            }}
          >
            Continue to quick mood check
          </button>
        </div>
      </div>
    </div>
  );
}

export default SignupPage;