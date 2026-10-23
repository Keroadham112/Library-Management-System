import { Shield, Sparkles } from 'lucide-react'
import { useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

function Login() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [username, setUsername] = useState('admin')
  const [password, setPassword] = useState('Admin@12345!')
  const [error, setError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()

    try {
      setIsSubmitting(true)
      setError(null)
      await login({ username, password })
      const destination = (location.state as { from?: { pathname?: string } } | null)?.from?.pathname ?? '/dashboard'
      navigate(destination, { replace: true })
    } catch {
      setError('Invalid credentials. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <section className="login-page">
      <div className="login-panel">
        <div className="login-brand">
          <div className="login-brand-mark">
            <Sparkles size={18} />
          </div>
          <div>
            <p className="login-eyebrow">Secure Access</p>
            <h1>Inventory Management System</h1>
          </div>
        </div>

        <p className="login-copy">
          Sign in to manage products, sales, purchases, customers, and reports in one secure workspace.
        </p>

        <div className="login-highlight">
          <Shield size={16} />
          Admin-only access is enabled for all inventory operations.
        </div>

        <form className="login-form" onSubmit={handleSubmit}>
          <div className="field-group">
            <label htmlFor="username">Username</label>
            <input
              autoComplete="username"
              id="username"
              onChange={(event) => setUsername(event.target.value)}
              type="text"
              value={username}
            />
          </div>

          <div className="field-group">
            <label htmlFor="password">Password</label>
            <input
              autoComplete="current-password"
              id="password"
              onChange={(event) => setPassword(event.target.value)}
              type="password"
              value={password}
            />
          </div>

          {error ? <div className="page-state page-state-error">{error}</div> : null}

          <button className="button button-primary login-button" disabled={isSubmitting} type="submit">
            {isSubmitting ? 'Signing in...' : 'Sign in'}
          </button>
        </form>

        <div className="login-credentials">
          Default demo access: <strong>admin</strong> / <strong>Admin@12345!</strong>
        </div>
      </div>
    </section>
  )
}

export default Login