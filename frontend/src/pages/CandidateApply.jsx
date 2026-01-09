import { useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { jobService } from '../api/services'

const CandidateApply = () => {
  const { jobId } = useParams()
  const navigate = useNavigate()
  const [formData, setFormData] = useState({ name: '', email: '' })
  const [resumeFile, setResumeFile] = useState(null)
  const [resumeText, setResumeText] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const data = new FormData()
      data.append('name', formData.name)
      data.append('email', formData.email)

      if (resumeFile) {
        data.append('resume_file', resumeFile)
      } else if (resumeText) {
        data.append('resume_text', resumeText)
      } else {
        setError('Please upload a resume or paste resume text')
        setLoading(false)
        return
      }

      const response = await jobService.registerCandidate(jobId, data)
      const sessionId = response.data.interview_session_id
      navigate(`/interview/${sessionId}`)
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to register')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-dark relative overflow-hidden">
      {/* Animated mesh background */}
      <div className="absolute inset-0 bg-gradient-mesh" />

      {/* Floating orbs */}
      <div className="absolute top-20 left-10 w-72 h-72 bg-primary/20 rounded-full blur-3xl animate-float" />
      <div className="absolute bottom-20 right-10 w-80 h-80 bg-cyan/20 rounded-full blur-3xl animate-float" style={{ animationDelay: '2s' }} />

      <div className="relative min-h-screen flex items-center justify-center p-6">
        <div className="w-full max-w-2xl">
          {/* Glow behind card */}
          <div className="absolute -inset-1 bg-gradient-primary rounded-3xl blur-lg opacity-20" />

          <div className="relative glass rounded-3xl p-8">
            {/* Header */}
            <div className="text-center mb-8">
              <div className="w-16 h-16 bg-gradient-primary rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-glow-primary">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <h1 className="text-3xl font-bold text-white mb-2">Complete Your Profile</h1>
              <p className="text-slate-400">Fill in your details to start the AI interview</p>
            </div>

            {/* Error Message */}
            {error && (
              <div className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm text-center">
                {error}
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Full Name</label>
                  <input
                    type="text"
                    required
                    className="input-field"
                    placeholder="John Doe"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Email</label>
                  <input
                    type="email"
                    required
                    className="input-field"
                    placeholder="john@email.com"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Upload Resume (PDF/DOCX)</label>
                <div className="relative">
                  <input
                    type="file"
                    accept=".pdf,.docx,.doc"
                    className="hidden"
                    id="resume-upload"
                    onChange={(e) => {
                      setResumeFile(e.target.files[0])
                      setResumeText('')
                    }}
                  />
                  <label
                    htmlFor="resume-upload"
                    className="flex items-center justify-center gap-3 w-full p-4 rounded-xl border-2 border-dashed border-slate-600 
                      hover:border-primary cursor-pointer transition-colors"
                  >
                    <svg className="w-6 h-6 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                        d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                    </svg>
                    <span className="text-slate-400">
                      {resumeFile ? resumeFile.name : 'Click to upload your resume'}
                    </span>
                  </label>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <div className="flex-1 h-px bg-slate-700" />
                <span className="text-slate-500 text-sm">OR</span>
                <div className="flex-1 h-px bg-slate-700" />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Paste Resume Text</label>
                <textarea
                  rows={6}
                  className="input-field resize-none"
                  placeholder="Paste your resume content here..."
                  value={resumeText}
                  onChange={(e) => {
                    setResumeText(e.target.value)
                    setResumeFile(null)
                  }}
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full btn-primary py-4 text-lg disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    Preparing Interview...
                  </span>
                ) : (
                  <span className="flex items-center justify-center gap-2">
                    <span>Start Interview</span>
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                    </svg>
                  </span>
                )}
              </button>
            </form>

            {/* Tips */}
            <div className="mt-8 p-4 rounded-xl bg-primary/5 border border-primary/20">
              <h3 className="text-sm font-semibold text-primary-light mb-3 flex items-center gap-2">
                <span>💡</span> Interview Tips
              </h3>
              <ul className="text-xs text-slate-400 space-y-2">
                <li className="flex items-start gap-2">
                  <span className="text-green-400">✓</span>
                  Ensure your microphone is working properly
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-400">✓</span>
                  Find a quiet environment with minimal background noise
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-400">✓</span>
                  The interview will take approximately 15-20 minutes
                </li>
              </ul>
            </div>

            {/* Back link */}
            <div className="mt-6 text-center">
              <Link to="/candidate" className="text-sm text-slate-500 hover:text-slate-300 transition-colors">
                ← Back to Job Code Entry
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default CandidateApply
