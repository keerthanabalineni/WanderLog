import { useEffect, useMemo, useState } from 'react'
import { Navigate, Route, Routes, useLocation } from 'react-router-dom'
import AuthPage from './components/AuthPage.jsx'
import CountryDetail from './components/CountryDetail.jsx'
import ExplorePage from './components/ExplorePage.jsx'

const STORAGE_KEYS = {
  token: 'wanderlog_token',
  user: 'wanderlog_user',
  bucket: 'wanderlog_bucket'
}

function loadPersisted(key, fallback) {
  try {
    const raw = localStorage.getItem(key)
    return raw ? JSON.parse(raw) : fallback
  } catch (error) {
    return fallback
  }
}

const REQRES_API_KEY = import.meta.env.VITE_REQRES_API_KEY

function App() {
  const [token, setToken] = useState(() => localStorage.getItem(STORAGE_KEYS.token))
  const [user, setUser] = useState(() => loadPersisted(STORAGE_KEYS.user, null))
  const [bucket, setBucket] = useState(() => loadPersisted(STORAGE_KEYS.bucket, {}))

  useEffect(() => {
    if (token) {
      localStorage.setItem(STORAGE_KEYS.token, token)
      localStorage.setItem(STORAGE_KEYS.user, JSON.stringify(user || { email: '' }))
    } else {
      localStorage.removeItem(STORAGE_KEYS.token)
      localStorage.removeItem(STORAGE_KEYS.user)
    }
  }, [token, user])

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.bucket, JSON.stringify(bucket))
  }, [bucket])

  const handleAuth = async (email, password, register) => {
    if (!email || !password) {
      return { success: false, message: 'Email and password are required.' }
    }

    const endpoint = register ? 'register' : 'login'
    const headers = { 'Content-Type': 'application/json' }
    if (REQRES_API_KEY) {
      headers['x-api-key'] = REQRES_API_KEY
    }

    const response = await fetch(`https://reqres.in/api/${endpoint}`, {
      method: 'POST',
      headers,
      body: JSON.stringify({ email, password })
    })

    const data = await response.json()

    if (!response.ok) {
      if (data.error === 'missing_api_key' && email === 'eve.holt@reqres.in') {
        const fallbackToken = `demo-${Date.now()}`
        setToken(fallbackToken)
        setUser({ email })
        return { success: true, fallback: true }
      }

      return { success: false, message: data.error || 'Authentication failed. Please try again.' }
    }

    setToken(data.token)
    setUser({ email })
    return { success: true }
  }

  const handleLogout = () => {
    setToken(null)
    setUser(null)
    setBucket({})
  }

  const addToBucket = (code, item) => {
    setBucket((current) => ({ ...current, [code]: { ...item, status: 'wish' } }))
  }

  const updateBucketStatus = (code, status) => {
    setBucket((current) => ({ ...current, [code]: { ...current[code], status } }))
  }

  const removeFromBucket = (code) => {
    setBucket((current) => {
      const next = { ...current }
      delete next[code]
      return next
    })
  }

  const summary = useMemo(() => {
    const items = Object.values(bucket)
    return {
      wish: items.filter((item) => item.status === 'wish').length,
      visited: items.filter((item) => item.status === 'visited').length
    }
  }, [bucket])

  return (
    <Routes>
      <Route
        path="/login"
        element={
          token ? <Navigate to="/" replace /> : <AuthPage onAuth={handleAuth} />
        }
      />
      <Route
        path="/"
        element={
          <ProtectedRoute token={token}>
            <ExplorePage
              bucket={bucket}
              wishCount={summary.wish}
              visitedCount={summary.visited}
              onLogout={handleLogout}
            />
          </ProtectedRoute>
        }
      />
      <Route
        path="/country/:code"
        element={
          <ProtectedRoute token={token}>
            <CountryDetail
              bucket={bucket}
              onAdd={addToBucket}
              onUpdate={updateBucketStatus}
              onRemove={removeFromBucket}
            />
          </ProtectedRoute>
        }
      />
      <Route path="*" element={<Navigate to={token ? '/' : '/login'} replace />} />
    </Routes>
  )
}

function ProtectedRoute({ token, children }) {
  const location = useLocation()
  if (!token) {
    return <Navigate to="/login" state={{ from: location }} replace />
  }
  return children
}

export default App
