import { useQuery } from 'react-query'
import { useParams, Link } from 'react-router-dom'
import { interviewService } from '../api/services'

const InterviewResults = () => {
  const { sessionId } = useParams()
  
  const handleDownloadVideo = async () => {
    try {
      const response = await interviewService.downloadVideo(sessionId)
      const url = window.URL.createObjectURL(new Blob([response.data]))
      const link = document.createElement('a')
      link.href = url
      link.setAttribute('download', `interview_${sessionId}.webm`)
      document.body.appendChild(link)
      link.click()
      link.remove()
      window.URL.revokeObjectURL(url)
    } catch (err) {
      console.error('Download error:', err)
      alert('Failed to download video. Video may not be available yet.')
    }
  }
  
  const { data: results, isLoading } = useQuery(['interview-results', sessionId], () =>
    interviewService.getResults(sessionId).then(res => res.data)
  )

  if (isLoading) return <div className="p-8">Loading...</div>
  if (!results) return <div className="p-8">No results found</div>

  const getScoreColor = (score) => {
    if (score >= 4) return 'text-green-600'
    if (score >= 3) return 'text-yellow-600'
    return 'text-red-600'
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <Link to="/hr/jobs" className="text-blue-600 hover:underline">
            ← Back to Dashboard
          </Link>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Candidate Summary */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <div className="flex justify-between items-start mb-4">
            <div>
              <h1 className="text-2xl font-bold mb-2">{results.candidate_name}</h1>
              <p className="text-gray-600">{results.candidate_email}</p>
              <p className="text-gray-600 mt-2">Position: {results.job_title}</p>
            </div>
            <div className="text-right">
              <div className="text-4xl font-bold text-blue-600 mb-2">
                {results.final_score !== null && results.final_score !== undefined ? `${results.final_score}/100` : 'Pending'}
              </div>
              {results.final_recommendation ? (
                <span className={`px-4 py-2 rounded-lg text-lg font-semibold ${
                  results.final_recommendation === 'Strong' ? 'bg-green-100 text-green-800' :
                  results.final_recommendation === 'Medium' ? 'bg-yellow-100 text-yellow-800' :
                  results.final_recommendation === 'Weak' ? 'bg-orange-100 text-orange-800' :
                  'bg-red-100 text-red-800'
                }`}>
                  {results.final_recommendation}
                </span>
              ) : (
                <span className="px-4 py-2 rounded-lg text-lg font-semibold bg-gray-100 text-gray-600">
                  Pending
                </span>
              )}
            </div>
          </div>

          {results.final_report ? (
            <div className="mt-4 p-4 bg-blue-50 rounded-lg">
              <h3 className="font-semibold mb-2">AI Recommendation:</h3>
              <p className="text-gray-700">{results.final_report}</p>
            </div>
          ) : (
            <div className="mt-4 p-4 bg-yellow-50 rounded-lg border border-yellow-200">
              <h3 className="font-semibold mb-2 text-yellow-800">⏳ Interview In Progress</h3>
              <p className="text-yellow-700">The interview is still ongoing or being processed. Results will appear here once completed.</p>
            </div>
          )}
          
          {/* Download Interview Video Button */}
          <div className="mt-4">
            <button
              onClick={handleDownloadVideo}
              className="px-6 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-xl hover:from-purple-700 hover:to-indigo-700 transition-all font-semibold shadow-lg flex items-center space-x-2"
            >
              <span>📥</span>
              <span>Download Interview Video</span>
            </button>
            <p className="text-xs text-gray-500 mt-2">Compressed video (~10-15MB)</p>
          </div>
        </div>

        {/* Resume Summary */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-xl font-bold mb-4">Candidate Profile</h2>
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <h3 className="font-semibold mb-2">Skills:</h3>
              <div className="flex flex-wrap gap-2">
                {results.resume_summary.skills?.map((skill, i) => (
                  <span key={i} className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
                    {skill}
                  </span>
                ))}
              </div>
            </div>
            <div>
              <h3 className="font-semibold mb-2">Experience:</h3>
              <p className="text-gray-700">
                {results.resume_summary.experience_years || 'Not specified'} years
              </p>
            </div>
          </div>
        </div>

        {/* Interview Transcript */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-bold mb-4">Interview Transcript</h2>
          <div className="space-y-6">
            {results.questions_and_answers.map((qa, index) => (
              <div key={index} className="border-l-4 border-blue-500 pl-4 py-2">
                <div className="mb-3">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-semibold text-lg">Question {index + 1}</h3>
                    <span className="text-sm text-gray-500 px-2 py-1 bg-gray-100 rounded">
                      {qa.question_type} {qa.skill && qa.skill !== qa.question_type && `• ${qa.skill}`}
                    </span>
                  </div>
                  <p className="text-gray-700 italic">{qa.question_text}</p>
                </div>

                {qa.answer_transcript && (
                  <div className="mb-3 bg-gray-50 p-3 rounded">
                    <h4 className="font-semibold text-sm mb-1">Answer:</h4>
                    <p className="text-gray-700">{qa.answer_transcript}</p>
                  </div>
                )}

                {qa.correctness_score !== null && (
                  <div className="grid grid-cols-4 gap-3 mb-2">
                    <div className="text-center">
                      <div className={`text-2xl font-bold ${getScoreColor(qa.correctness_score)}`}>
                        {qa.correctness_score.toFixed(1)}
                      </div>
                      <div className="text-xs text-gray-600">Correctness</div>
                    </div>
                    <div className="text-center">
                      <div className={`text-2xl font-bold ${getScoreColor(qa.depth_score)}`}>
                        {qa.depth_score.toFixed(1)}
                      </div>
                      <div className="text-xs text-gray-600">Depth</div>
                    </div>
                    <div className="text-center">
                      <div className={`text-2xl font-bold ${getScoreColor(qa.clarity_score)}`}>
                        {qa.clarity_score.toFixed(1)}
                      </div>
                      <div className="text-xs text-gray-600">Clarity</div>
                    </div>
                    <div className="text-center">
                      <div className={`text-2xl font-bold ${getScoreColor(qa.relevance_score)}`}>
                        {qa.relevance_score.toFixed(1)}
                      </div>
                      <div className="text-xs text-gray-600">Relevance</div>
                    </div>
                  </div>
                )}

                {qa.comment && (
                  <div className="text-sm text-gray-600 italic">
                    💬 {qa.comment}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

export default InterviewResults
