import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
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
    <div className="min-h-screen bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl p-8 max-w-2xl w-full">
        <h1 className="text-3xl font-bold mb-2 text-center">Join Interview</h1>
        <p className="text-gray-600 text-center mb-6">
          Fill in your details to start the voice interview
        </p>

        {error && (
          <div className="mb-4 p-3 bg-red-100 text-red-700 rounded">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Full Name</label>
            <input
              type="text"
              required
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Email</label>
            <input
              type="email"
              required
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Upload Resume (PDF/DOCX)</label>
            <input
              type="file"
              accept=".pdf,.docx,.doc"
              className="w-full px-3 py-2 border rounded-lg"
              onChange={(e) => {
                setResumeFile(e.target.files[0])
                setResumeText('')
              }}
            />
          </div>

          <div className="text-center text-gray-500">OR</div>

          <div>
            <label className="block text-sm font-medium mb-1">Paste Resume Text</label>
            <textarea
              rows={6}
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
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
            className="w-full py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 disabled:bg-gray-400"
          >
            {loading ? 'Registering...' : 'Start Interview'}
          </button>
        </form>

        <div className="mt-6 p-4 bg-blue-50 rounded-lg">
          <h3 className="font-semibold mb-2">Before you start:</h3>
          <ul className="text-sm text-gray-700 space-y-1">
            <li>✓ Ensure your microphone is working</li>
            <li>✓ Find a quiet environment</li>
            <li>✓ Allow microphone permissions when prompted</li>
            <li>✓ The interview will take approximately 15-20 minutes</li>
          </ul>
        </div>
      </div>
    </div>
  )
}

export default CandidateApply
