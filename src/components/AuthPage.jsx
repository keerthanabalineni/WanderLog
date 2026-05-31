import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useApp } from "../context/AppContext";

function AuthPage() {
  const { user, login } = useApp();
  const navigate = useNavigate();
  const [email, setEmail] = useState("eve.holt@reqres.in");
  const [password, setPassword] = useState("");
  const [mode, setMode] = useState("login");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [info, setInfo] = useState("");

  useEffect(() => {
    if (user) {
      navigate("/explore", { replace: true });
    }
  }, [user, navigate]);

  async function handleSubmit(event) {
    event.preventDefault();
    setLoading(true);
    setError("");
    setInfo("");

    const result = await login({ email, password, register: mode === "signup" });

    if (result.success) {
      navigate("/explore", { replace: true });
      return;
    }

    setError(result.message);
    setLoading(false);
  }

  return (
    <main className="auth-layout">
      <div className="auth-card">
        <div className="logo">🌍</div>

        <h1>WanderLog</h1>
        <p className="auth-subtitle">Sign in or sign up to explore the world.</p>

        <form onSubmit={handleSubmit} className="auth-form">
          <label>
            Email
            <input
              autoComplete="username"
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="eve.holt@reqres.in"
              required
            />
          </label>

          <label>
            Password
            <input
              autoComplete="current-password"
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="Enter your password"
              required
            />
          </label>

          {error && <p className="status-text error">{error}</p>}
          {info && <p className="status-text">{info}</p>}

          <button className="primary-btn" type="submit" disabled={loading}>
            {loading ? "Working…" : mode === "login" ? "Sign in" : "Create account"}
          </button>
        </form>

        <div className="auth-footer">
          <p className="tiny-text">
            Use <strong>eve.holt@reqres.in</strong> and any password for a successful mock login.
          </p>

          <button
            type="button"
            className="secondary-link"
            onClick={() => {
              setMode(mode === "login" ? "signup" : "login");
              setError("");
              setInfo("");
            }}
          >
            {mode === "login" ? "Need an account? Sign up" : "Already have an account? Sign in"}
          </button>
        </div>
      </div>
    </main>
  );
}

export default AuthPage;
