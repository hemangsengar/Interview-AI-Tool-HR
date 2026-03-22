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
        <div className="absolute -inset-1 bg-gradient-primary rounded-3xl blur-xl opacity-30 animate-pulse-glow" />

        <div className="relative glass rounded-3xl p-10 shadow-2xl">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="w-24 h-24 bg-gradient-accent rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-glow-accent hover:scale-110 transition-transform duration-300">
              <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
              </svg>
            </div>
            <h1 className="text-4xl font-bold text-white mb-3">Join Interview</h1>
            <p className="text-slate-400 text-lg">Enter your job code to begin</p>
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
              <label className="block text-sm font-semibold text-slate-300 mb-3 text-center">
                Job Code
              </label>
              <input
                type="text"
                value={jobCode}
                onChange={(e) => setJobCode(e.target.value.toUpperCase())}
                className="input-field text-center text-3xl font-mono tracking-widest uppercase font-bold"
                placeholder="XXXXXX"
                maxLength={6}
                required
              />
              <p className="text-xs text-slate-500 text-center mt-3">
                Enter the 6-character code provided by HR
              </p>
            </div>

            <button
              type="submit"
              disabled={loading || jobCode.length < 6}
              className="w-full bg-gradient-accent py-5 rounded-2xl font-semibold text-lg text-white
                shadow-glow-accent hover:shadow-[0_0_60px_rgba(6,182,212,0.6),0_0_100px_rgba(6,182,212,0.3)]
                transition-all duration-300 hover:-translate-y-1 hover:scale-[1.02] disabled:opacity-50
                disabled:cursor-not-allowed disabled:hover:translate-y-0 disabled:hover:scale-100"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-3">
                  <svg className="animate-spin w-6 h-6" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Finding Job...
                </span>
              ) : (
                <span className="flex items-center justify-center gap-3">
                  <span>Continue</span>
                  <svg className="w-6 h-6 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                </span>
              )}
            </button>
          </form>

          {/* Instructions */}
          <div className="mt-8 p-5 rounded-xl bg-dark-card/70 border border-primary/20 backdrop-blur-sm">
            <h3 className="text-sm font-bold text-slate-300 mb-3 flex items-center gap-2">
              <span>📋</span>
              <span>Before you begin:</span>
            </h3>
            <ul className="text-sm text-slate-400 space-y-2.5">
              <li className="flex items-start gap-3">
                <span className="text-green-400 text-lg">✓</span>
                <span>Ensure you&apos;re in a quiet environment</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-green-400 text-lg">✓</span>
                <span>Have your microphone ready</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-green-400 text-lg">✓</span>
                <span>Keep your resume details handy</span>
              </li>
            </ul>
          </div>

          {/* Demo Job Codes */}
          <div className="mt-6 p-5 rounded-xl bg-gradient-to-br from-cyan/15 to-primary/15 border border-cyan/30 backdrop-blur-sm">
            <h3 className="text-sm font-bold text-cyan-light mb-4 flex items-center gap-2">
              <span>🎯</span>
              <span>Demo Job Codes (Try Now!)</span>
            </h3>
            <div className="grid grid-cols-1 gap-2.5">
              <button
                type="button"
                onClick={() => setJobCode('PY2024')}
                className="flex items-center justify-between p-3 rounded-lg bg-dark/60 hover:bg-dark/90
                  border border-slate-700 hover:border-cyan/60 transition-all group"
              >
                <div className="text-left">
                  <span className="text-sm text-slate-300 font-medium">Senior Python Developer</span>
                </div>
                <span className="font-mono text-base text-cyan font-bold group-hover:text-white transition-colors">PY2024</span>
              </button>
              <button
                type="button"
                onClick={() => setJobCode('JS2024')}
                className="flex items-center justify-between p-3 rounded-lg bg-dark/60 hover:bg-dark/90
                  border border-slate-700 hover:border-cyan/60 transition-all group"
              >
                <div className="text-left">
                  <span className="text-sm text-slate-300 font-medium">Full Stack JS Developer</span>
                </div>
                <span className="font-mono text-base text-cyan font-bold group-hover:text-white transition-colors">JS2024</span>
              </button>
              <button
                type="button"
                onClick={() => setJobCode('DS2024')}
                className="flex items-center justify-between p-3 rounded-lg bg-dark/60 hover:bg-dark/90
                  border border-slate-700 hover:border-cyan/60 transition-all group"
              >
                <div className="text-left">
                  <span className="text-sm text-slate-300 font-medium">Data Scientist - ML</span>
                </div>
                <span className="font-mono text-base text-cyan font-bold group-hover:text-white transition-colors">DS2024</span>
              </button>
            </div>
            <p className="text-xs text-slate-500 mt-3 text-center font-medium">
              Click any code above to auto-fill
            </p>
          </div>

          {/* Back to home */}
          <div className="mt-8 text-center">
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

export default CandidateEntry
