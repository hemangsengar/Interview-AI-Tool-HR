import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Link } from 'react-router-dom'
import { jobService } from '../api/services'

const CandidateEntry = () => {
  const navigate = useNavigate()
  const [jobCode, setJobCode] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const response = await jobService.getByCode(jobCode.toUpperCase())
      navigate(`/apply/${response.data.id}`)
    } catch (err) {
      setError(err.response?.data?.detail || 'Job not found. Please check the code and try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-dark relative overflow-hidden flex items-center justify-center p-6">
      {/* Animated mesh background */}
      <div className="absolute inset-0 bg-gradient-mesh" />

      {/* Floating orbs */}
      <div className="absolute top-1/4 left-10 w-80 h-80 bg-cyan/20 rounded-full blur-3xl animate-float" />
      <div className="absolute bottom-1/4 right-10 w-72 h-72 bg-primary/20 rounded-full blur-3xl animate-float" style={{ animationDelay: '3s' }} />

      {/* Entry Card */}
      <div className="relative w-full max-w-md">
        {/* Glow behind card */}
        <div className="absolute -inset-1 bg-gradient-accent rounded-3xl blur-lg opacity-30" />

        <div className="relative glass rounded-3xl p-8">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="w-20 h-20 bg-gradient-accent rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-glow-accent">
              <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
              </svg>
            </div>
            <h1 className="text-3xl font-bold text-white mb-2">Join Interview</h1>
            <p className="text-slate-400">Enter your job code to begin</p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm text-center">
              {error}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-3 text-center">
                Job Code
              </label>
              <input
                type="text"
                value={jobCode}
                onChange={(e) => setJobCode(e.target.value.toUpperCase())}
                className="input-field text-center text-2xl font-mono tracking-widest uppercase"
                placeholder="XXXXXX"
                maxLength={6}
                required
              />
              <p className="text-xs text-slate-500 text-center mt-2">
                Enter the 6-character code provided by HR
              </p>
            </div>

            <button
              type="submit"
              disabled={loading || jobCode.length < 6}
              className="w-full bg-gradient-accent py-4 rounded-2xl font-semibold text-lg text-white
                shadow-glow-accent hover:shadow-[0_0_50px_rgba(245,158,11,0.5)] 
                transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Finding Job...
                </span>
              ) : (
                <span className="flex items-center justify-center gap-2">
                  <span>Continue</span>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                </span>
              )}
            </button>
          </form>

          {/* Instructions */}
          <div className="mt-8 p-4 rounded-xl bg-dark-card/50 border border-slate-700">
            <h3 className="text-sm font-semibold text-slate-300 mb-3">📋 Before you begin:</h3>
            <ul className="text-xs text-slate-400 space-y-2">
              <li className="flex items-start gap-2">
                <span className="text-green-400">✓</span>
                Ensure you&apos;re in a quiet environment
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-400">✓</span>
                Have your microphone ready
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-400">✓</span>
                Keep your resume details handy
              </li>
            </ul>
          </div>

          {/* Demo Job Codes */}
          <div className="mt-4 p-4 rounded-xl bg-gradient-to-r from-cyan/10 to-primary/10 border border-cyan/20">
            <h3 className="text-sm font-semibold text-cyan mb-3">🎯 Demo Job Codes (Try Now!)</h3>
            <div className="grid grid-cols-1 gap-2">
              <button
                type="button"
                onClick={() => setJobCode('PY2024')}
                className="flex items-center justify-between p-2 rounded-lg bg-dark/50 hover:bg-dark/80 border border-slate-700 hover:border-cyan/50 transition-all group"
              >
                <div className="text-left">
                  <span className="text-xs text-slate-400">Senior Python Developer</span>
                </div>
                <span className="font-mono text-sm text-cyan group-hover:text-white transition-colors">PY2024</span>
              </button>
              <button
                type="button"
                onClick={() => setJobCode('JS2024')}
                className="flex items-center justify-between p-2 rounded-lg bg-dark/50 hover:bg-dark/80 border border-slate-700 hover:border-cyan/50 transition-all group"
              >
                <div className="text-left">
                  <span className="text-xs text-slate-400">Full Stack JS Developer</span>
                </div>
                <span className="font-mono text-sm text-cyan group-hover:text-white transition-colors">JS2024</span>
              </button>
              <button
                type="button"
                onClick={() => setJobCode('DS2024')}
                className="flex items-center justify-between p-2 rounded-lg bg-dark/50 hover:bg-dark/80 border border-slate-700 hover:border-cyan/50 transition-all group"
              >
                <div className="text-left">
                  <span className="text-xs text-slate-400">Data Scientist - ML</span>
                </div>
                <span className="font-mono text-sm text-cyan group-hover:text-white transition-colors">DS2024</span>
              </button>
            </div>
            <p className="text-xs text-slate-500 mt-2 text-center">
              Click any code above to auto-fill
            </p>
          </div>

          {/* Back to home */}
          <div className="mt-6 text-center">
            <Link to="/" className="text-sm text-slate-500 hover:text-slate-300 transition-colors">
              ← Back to Home
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}

export default CandidateEntry
