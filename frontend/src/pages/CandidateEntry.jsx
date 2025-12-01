import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { jobService } from '../api/services'

const CandidateEntry = () => {
  const navigate = useNavigate()
  const [jobCode, setJobCode] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const response = await jobService.getByCode(jobCode.toUpperCase())
      navigate(`/apply/${response.data.id}`, { 
        state: { jobData: response.data } 
      })
    } catch (err) {
      setError(err.response?.data?.detail || 'Invalid job code. Please check and try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-400 via-cyan-500 to-blue-600 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-white opacity-10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute top-1/2 -left-40 w-96 h-96 bg-white opacity-10 rounded-full blur-3xl animate-pulse" style={{animationDelay: '1s'}}></div>
        <div className="absolute bottom-20 right-1/4 w-64 h-64 bg-white opacity-10 rounded-full blur-3xl animate-pulse" style={{animationDelay: '2s'}}></div>
      </div>

      <div className="relative min-h-screen flex items-center justify-center p-4">
        <div className="bg-white/10 backdrop-blur-md rounded-3xl p-8 max-w-md w-full shadow-2xl border border-white/20">
          {/* Icon */}
          <div className="text-center mb-8">
            <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4 backdrop-blur-sm">
              <span className="text-4xl">🎯</span>
            </div>
            <h1 className="text-3xl font-bold text-white mb-2">Join Interview</h1>
            <p className="text-white/80">Enter your job code to start the interview</p>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-500/20 backdrop-blur-sm border border-red-300/30 rounded-xl text-red-100">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-white font-semibold mb-2">Job Code</label>
              <input
                type="text"
                required
                maxLength={6}
                className="w-full px-4 py-4 bg-white/20 backdrop-blur-sm border-2 border-white/30 rounded-xl text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-white/50 focus:border-transparent transition-all text-center text-2xl font-bold uppercase tracking-widest"
                placeholder="ABC123"
                value={jobCode}
                onChange={(e) => setJobCode(e.target.value.toUpperCase())}
              />
              <p className="text-white/70 text-sm mt-2 text-center">Enter the 6-character code provided by HR</p>
            </div>

            <button
              type="submit"
              disabled={loading || jobCode.length < 6}
              className="w-full py-4 bg-white text-blue-600 rounded-xl hover:bg-blue-50 transition-all duration-300 font-bold text-lg shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <span className="flex items-center justify-center space-x-2">
                  <div className="w-5 h-5 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                  <span>Verifying...</span>
                </span>
              ) : (
                'Continue to Application'
              )}
            </button>
          </form>

          <div className="mt-8 text-center">
            <p className="text-white/70 text-sm">
              Don't have a code? Contact the hiring team.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default CandidateEntry
