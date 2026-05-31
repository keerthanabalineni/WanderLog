import { useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'

export default function AuthPage({ onAuth }) {
  const [mode, setMode] = useState('login')
  const [email, setEmail] = useState('eve.holt@reqres.in')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const navigate = useNavigate()
  const location = useLocation()
  const from = location.state?.from?.pathname || '/'

  const handleSubmit = async (event) => {
    event.preventDefault()
    setError('')
    setLoading(true)

    const result = await onAuth(email.trim(), password, mode === 'register')
    setLoading(false)

    if (result.success) {
      navigate(from, { replace: true })
    } else {
      setError(result.message)
    }
  }

  return (
    <main className="page auth-page">
      <div className="auth-panel">
        <div className="auth-brand">
          <div>
            <p className="eyebrow">WanderLog</p>
            <h1>Your travel bucket list</h1>
          </div>
          <p className="subtext">Sign in or create a mock account with Reqres.in to start exploring countries and saving destinations.</p>
        </div>

        <div className="auth-tabs">
          <button
            type="button"
            className={`tab ${mode === 'login' ? 'active' : ''}`}
            onClick={() => setMode('login')}
          >
            Login
          </button>
          <button
            type="button"
            className={`tab ${mode === 'register' ? 'active' : ''}`}
            onClick={() => setMode('register')}
          >
            Sign up
          </button>
        </div>

        <form className="auth-form" onSubmit={handleSubmit}>
          <div className="form-field">
            <label htmlFor="email">Email</label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="eve.holt@reqres.in"
              autoComplete="username"
              className="form-control"
            />
          </div>

          <div className="form-field">
            <label htmlFor="password">Password</label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="Your password"
              autoComplete="current-password"
              className="form-control"
            />
          </div>

          {error && <div className="error-box">{error}</div>}

          <button className="button primary" type="submit" disabled={loading}>
            {loading ? 'Working…' : mode === 'login' ? 'Login' : 'Create account'}
          </button>

          <p className="helper-text">
            Use <strong>eve.holt@reqres.in</strong> and any password. If no Reqres API key is configured, the app will fall back to a demo auth flow for this email.
          </p>
        </form>
      </div>
    </main>
  )
}
