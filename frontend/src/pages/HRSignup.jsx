import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { authService } from '../api/services'
import { useAuthStore } from '../store/authStore'

const HRSignup = () => {
  const navigate = useNavigate()
  const setAuth = useAuthStore(state => state.setAuth)
  const [formData, setFormData] = useState({ name: '', email: '', password: '', confirmPassword: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match')
      return
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters')
      return
    }

    setLoading(true)

    try {
      const response = await authService.signup({
        name: formData.name,
        email: formData.email,
        password: formData.password
      })
      setAuth(response.data.access_token, response.data.user)
      navigate('/hr/jobs')
    } catch (err) {
      setError(err.response?.data?.detail || 'Signup failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-dark relative overflow-hidden flex items-center justify-center p-6">
      {/* Animated mesh background */}
      <div className="absolute inset-0 bg-gradient-mesh" />

      {/* Floating orbs */}
      <div className="absolute top-10 right-20 w-64 h-64 bg-secondary/20 rounded-full blur-3xl animate-float" />
      <div className="absolute bottom-10 left-20 w-72 h-72 bg-primary/20 rounded-full blur-3xl animate-float" style={{ animationDelay: '2s' }} />

      {/* Signup Card */}
      <div className="relative w-full max-w-md">
        {/* Glow behind card */}
        <div className="absolute -inset-1 bg-gradient-secondary rounded-3xl blur-xl opacity-30 animate-pulse-glow" />

        <div className="relative glass rounded-3xl p-10 shadow-2xl">
          {/* Header */}
          <div className="text-center mb-8">
            <Link to="/" className="inline-block mb-6 group">
              <div className="w-20 h-20 bg-gradient-secondary rounded-2xl flex items-center justify-center mx-auto shadow-glow-secondary
                group-hover:scale-110 transition-transform duration-300">
                <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                </svg>
              </div>
            </Link>
            <h1 className="text-4xl font-bold text-white mb-3">Create Account</h1>
            <p className="text-slate-400 text-lg">Start conducting AI-powered interviews</p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-6 p-4 rounded-xl bg-red-500/10 border-2 border-red-500/30 text-red-400 text-sm text-center backdrop-blur-sm">
              <span className="font-semibold">{error}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-semibold text-slate-300 mb-3">
                Full Name
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="input-field"
                placeholder="John Doe"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-300 mb-3">
                Email Address
              </label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="input-field"
                placeholder="you@company.com"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-300 mb-3">
                Password
              </label>
              <input
                type="password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                className="input-field"
                placeholder="••••••••"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-300 mb-3">
                Confirm Password
              </label>
              <input
                type="password"
                value={formData.confirmPassword}
                onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                className="input-field"
                placeholder="••••••••"
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-secondary py-5 rounded-2xl font-semibold text-lg text-white
                shadow-glow-secondary hover:shadow-[0_0_60px_rgba(244,114,182,0.6),0_0_100px_rgba(244,114,182,0.3)]
                transition-all duration-300 hover:-translate-y-1 hover:scale-[1.02] disabled:opacity-50
                disabled:cursor-not-allowed disabled:hover:translate-y-0 disabled:hover:scale-100"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-3">
                  <svg className="animate-spin w-6 h-6" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Creating account...
                </span>
              ) : (
                'Create Account'
              )}
            </button>
          </form>

          {/* Footer */}
          <div className="mt-8 text-center">
            <p className="text-slate-400 text-base">
              Already have an account?{' '}
              <Link to="/hr/login" className="text-secondary-light hover:text-secondary transition-all duration-300 font-semibold">
                Sign in
              </Link>
            </p>
          </div>

          {/* Back to home */}
          <div className="mt-6 text-center">
            <Link to="/" className="text-sm text-slate-400 hover:text-slate-200 transition-all duration-300 font-medium inline-flex items-center gap-2">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              <span>Back to Home</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}

export default HRSignup
