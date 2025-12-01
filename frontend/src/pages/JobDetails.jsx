import { useState, useEffect } from 'react'
import { useQuery, useMutation, useQueryClient } from 'react-query'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { jobService } from '../api/services'

const JobDetails = () => {
  const { jobId } = useParams()
  const queryClient = useQueryClient()
  const navigate = useNavigate()
  const [deleteConfirm, setDeleteConfirm] = useState(null)
  const [deleteJobConfirm, setDeleteJobConfirm] = useState(false)
  const [showEditJob, setShowEditJob] = useState(false)
  const [editFormData, setEditFormData] = useState({
    title: '',
    jd_raw_text: '',
    must_have_skills: '',
    good_to_have_skills: '',
    jd_file: null
  })
  
  const { data: job, refetch: refetchJob } = useQuery(['job', jobId], () =>
    jobService.get(jobId).then(res => res.data)
  )
  
  const { data: candidates, refetch } = useQuery(['candidates', jobId], () =>
    jobService.getCandidates(jobId).then(res => res.data)
  )
  
  // Initialize edit form when job data loads
  useEffect(() => {
    if (job && !showEditJob) {
      setEditFormData({
        title: job.title,
        jd_raw_text: job.jd_raw_text,
        must_have_skills: job.must_have_skills?.join(', ') || '',
        good_to_have_skills: job.good_to_have_skills?.join(', ') || '',
        jd_file: null
      })
    }
  }, [job, showEditJob])

  const deleteMutation = useMutation(
    (candidateId) => jobService.deleteCandidate(candidateId),
    {
      onSuccess: () => {
        refetch()
        setDeleteConfirm(null)
      }
    }
  )
  
  const deleteJobMutation = useMutation(
    () => jobService.delete(jobId),
    {
      onSuccess: () => {
        navigate('/hr/jobs')
      },
      onError: (err) => {
        alert('Failed to delete job: ' + (err.response?.data?.detail || err.message))
      }
    }
  )
  
  const updateJobMutation = useMutation(
    (formData) => jobService.update(jobId, formData),
    {
      onSuccess: () => {
        refetchJob()
        setShowEditJob(false)
        alert('Job updated successfully!')
      },
      onError: (err) => {
        alert('Failed to update job: ' + (err.response?.data?.detail || err.message))
      }
    }
  )
  
  const handleEditJob = async (e) => {
    e.preventDefault()
    const formData = new FormData()
    formData.append('title', editFormData.title)
    formData.append('jd_raw_text', editFormData.jd_raw_text)
    formData.append('must_have_skills', editFormData.must_have_skills)
    formData.append('good_to_have_skills', editFormData.good_to_have_skills)
    if (editFormData.jd_file) {
      formData.append('jd_file', editFormData.jd_file)
    }
    updateJobMutation.mutate(formData)
  }

  const handleDownloadResume = async (candidateId, candidateName) => {
    try {
      const response = await jobService.downloadResume(candidateId)
      const url = window.URL.createObjectURL(new Blob([response.data]))
      const link = document.createElement('a')
      link.href = url
      link.setAttribute('download', `${candidateName}_resume.pdf`)
      document.body.appendChild(link)
      link.click()
      link.remove()
    } catch (err) {
      alert('Failed to download resume')
    }
  }

  if (!job) return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex items-center justify-center">
      <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-600 border-t-transparent"></div>
    </div>
  )

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      <nav className="bg-white/80 backdrop-blur-md shadow-lg border-b border-white/20 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <Link to="/hr/jobs" className="text-blue-600 hover:text-blue-700 font-semibold flex items-center space-x-2">
            <span>←</span>
            <span>Back to Dashboard</span>
          </Link>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Job Info Card */}
        <div className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-xl p-8 mb-8 border border-white/40">
          <div className="flex justify-between items-start mb-6">
            <div>
              <h1 className="text-4xl font-bold text-gray-800 mb-2">{job.title}</h1>
              <div className="flex items-center space-x-3">
                <span className="px-4 py-1.5 bg-gradient-to-r from-blue-500 to-indigo-500 text-white rounded-full text-sm font-bold shadow-md">
                  Code: {job.job_code || 'N/A'}
                </span>
                {job.is_active && (
                  <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-semibold">
                    Active
                  </span>
                )}
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <button
                onClick={() => setShowEditJob(true)}
                className="px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors font-semibold flex items-center space-x-2"
              >
                <span>✏️</span>
                <span>Edit Job</span>
              </button>
              <button
                onClick={() => setDeleteJobConfirm(true)}
                className="px-4 py-2 bg-red-600 text-white rounded-xl hover:bg-red-700 transition-colors font-semibold flex items-center space-x-2"
              >
                <span>🗑️</span>
                <span>Delete Job</span>
              </button>
              <div className="text-right">
                <p className="text-sm text-gray-500">Created</p>
                <p className="text-lg font-semibold text-gray-700">{new Date(job.created_at).toLocaleDateString()}</p>
              </div>
            </div>
          </div>
          
          <div className="mb-6">
            <h3 className="font-bold text-gray-700 mb-3 text-lg">Job Description:</h3>
            <p className="text-gray-600 whitespace-pre-wrap leading-relaxed">{job.jd_raw_text}</p>
          </div>
          
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h3 className="font-bold text-gray-700 mb-3 text-lg">Must-Have Skills:</h3>
              <div className="flex flex-wrap gap-2">
                {job.must_have_skills?.map((skill, i) => (
                  <span key={i} className="px-3 py-1.5 bg-green-100 text-green-800 rounded-lg text-sm font-medium">
                    ✓ {skill}
                  </span>
                ))}
              </div>
            </div>
            <div>
              <h3 className="font-bold text-gray-700 mb-3 text-lg">Good-to-Have Skills:</h3>
              <div className="flex flex-wrap gap-2">
                {job.good_to_have_skills?.map((skill, i) => (
                  <span key={i} className="px-3 py-1.5 bg-blue-100 text-blue-800 rounded-lg text-sm font-medium">
                    + {skill}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Candidates Section */}
        <div className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-xl p-8 border border-white/40">
          <h2 className="text-3xl font-bold text-gray-800 mb-6">
            Candidates ({candidates?.length || 0})
          </h2>
          
          {candidates?.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">👥</div>
              <p className="text-gray-500 text-lg">No candidates yet</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gradient-to-r from-blue-50 to-indigo-50">
                  <tr>
                    <th className="px-4 py-3 text-left font-bold text-gray-700">Name</th>
                    <th className="px-4 py-3 text-left font-bold text-gray-700">Email</th>
                    <th className="px-4 py-3 text-left font-bold text-gray-700">Resume</th>
                    <th className="px-4 py-3 text-left font-bold text-gray-700">Score</th>
                    <th className="px-4 py-3 text-left font-bold text-gray-700">Recommendation</th>
                    <th className="px-4 py-3 text-left font-bold text-gray-700">Status</th>
                    <th className="px-4 py-3 text-left font-bold text-gray-700">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {candidates?.map(candidate => (
                    <tr key={candidate.id} className="border-t border-gray-200 hover:bg-blue-50/30 transition-colors">
                      <td className="px-4 py-4 font-medium text-gray-800">{candidate.name}</td>
                      <td className="px-4 py-4 text-gray-600">{candidate.email}</td>
                      <td className="px-4 py-4">
                        {candidate.resume_file_path ? (
                          <button
                            onClick={() => handleDownloadResume(candidate.id, candidate.name)}
                            className="text-blue-600 hover:text-blue-700 font-medium flex items-center space-x-1"
                          >
                            <span>📄</span>
                            <span>Download</span>
                          </button>
                        ) : (
                          <span className="text-gray-400">No file</span>
                        )}
                      </td>
                      <td className="px-4 py-4">
                        {candidate.final_score !== null && candidate.final_score !== undefined ? (
                          <span className="font-bold text-gray-800">{candidate.final_score.toFixed(1)}/100</span>
                        ) : (
                          <span className="text-gray-400 italic">Pending</span>
                        )}
                      </td>
                      <td className="px-4 py-4">
                        {candidate.final_recommendation ? (
                          <span className={`px-3 py-1 rounded-lg text-sm font-semibold ${
                            candidate.final_recommendation === 'Strong' ? 'bg-green-100 text-green-800' :
                            candidate.final_recommendation === 'Medium' ? 'bg-yellow-100 text-yellow-800' :
                            candidate.final_recommendation === 'Weak' ? 'bg-orange-100 text-orange-800' :
                            'bg-red-100 text-red-800'
                          }`}>
                            {candidate.final_recommendation}
                          </span>
                        ) : (
                          <span className="text-gray-400 italic">Pending</span>
                        )}
                      </td>
                      <td className="px-4 py-4">
                        <span className={`px-3 py-1 rounded-lg text-sm font-semibold ${
                          candidate.status === 'Shortlisted' ? 'bg-green-100 text-green-800' :
                          candidate.status === 'Rejected' ? 'bg-red-100 text-red-800' :
                          'bg-yellow-100 text-yellow-800'
                        }`}>
                          {candidate.status || 'Pending'}
                        </span>
                      </td>
                      <td className="px-4 py-4">
                        <div className="flex items-center space-x-2">
                          {candidate.interview_session_id && (
                            <Link
                              to={`/hr/interviews/${candidate.interview_session_id}`}
                              className="px-3 py-1.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
                            >
                              View
                            </Link>
                          )}
                          <button
                            onClick={() => setDeleteConfirm(candidate.id)}
                            className="px-3 py-1.5 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm font-medium"
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Delete Candidate Confirmation Modal */}
      {deleteConfirm && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl p-8 max-w-md w-full shadow-2xl">
            <h3 className="text-2xl font-bold text-gray-800 mb-4">Confirm Delete</h3>
            <p className="text-gray-600 mb-6">
              Are you sure you want to delete this candidate? This will permanently remove their interview history and cannot be undone.
            </p>
            <div className="flex space-x-4">
              <button
                onClick={() => deleteMutation.mutate(deleteConfirm)}
                disabled={deleteMutation.isLoading}
                className="flex-1 py-3 bg-red-600 text-white rounded-xl hover:bg-red-700 transition-colors font-semibold disabled:opacity-50"
              >
                {deleteMutation.isLoading ? 'Deleting...' : 'Yes, Delete'}
              </button>
              <button
                onClick={() => setDeleteConfirm(null)}
                className="flex-1 py-3 bg-gray-200 text-gray-700 rounded-xl hover:bg-gray-300 transition-colors font-semibold"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* Delete Job Confirmation Modal */}
      {deleteJobConfirm && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl p-8 max-w-md w-full shadow-2xl">
            <h3 className="text-2xl font-bold text-red-600 mb-4">⚠️ Delete Job?</h3>
            <p className="text-gray-600 mb-6">
              Are you sure you want to delete this job? This will permanently remove:
            </p>
            <ul className="list-disc list-inside text-gray-600 mb-6 space-y-1">
              <li>The job posting</li>
              <li>All {candidates?.length || 0} candidates</li>
              <li>All interview records</li>
            </ul>
            <p className="text-red-600 font-semibold mb-6">This action cannot be undone!</p>
            <div className="flex space-x-4">
              <button
                onClick={() => deleteJobMutation.mutate()}
                disabled={deleteJobMutation.isLoading}
                className="flex-1 py-3 bg-red-600 text-white rounded-xl hover:bg-red-700 transition-colors font-semibold disabled:opacity-50"
              >
                {deleteJobMutation.isLoading ? 'Deleting...' : 'Yes, Delete Everything'}
              </button>
              <button
                onClick={() => setDeleteJobConfirm(false)}
                className="flex-1 py-3 bg-gray-200 text-gray-700 rounded-xl hover:bg-gray-300 transition-colors font-semibold"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* Edit Job Modal */}
      {showEditJob && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="bg-white rounded-3xl p-8 max-w-3xl w-full my-8 shadow-2xl border border-gray-100">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                Edit Job
              </h3>
              <button
                onClick={() => setShowEditJob(false)}
                className="w-10 h-10 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors text-gray-600 font-bold"
              >
                ✕
              </button>
            </div>
            
            <form onSubmit={handleEditJob} className="space-y-6">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Job Title *</label>
                <input
                  type="text"
                  required
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  placeholder="e.g., Senior Python Developer"
                  value={editFormData.title}
                  onChange={(e) => setEditFormData({ ...editFormData, title: e.target.value })}
                />
              </div>
              
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Job Description *</label>
                <textarea
                  required
                  rows={6}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all resize-none"
                  placeholder="Describe the role, responsibilities, and requirements..."
                  value={editFormData.jd_raw_text}
                  onChange={(e) => setEditFormData({ ...editFormData, jd_raw_text: e.target.value })}
                />
              </div>
              
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  Upload JD File (Optional - PDF/DOC)
                </label>
                <input
                  type="file"
                  accept=".pdf,.doc,.docx"
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  onChange={(e) => setEditFormData({ ...editFormData, jd_file: e.target.files[0] })}
                />
                <p className="text-xs text-gray-500 mt-2">Upload a JD file to automatically extract job description</p>
              </div>
              
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">
                    Must-Have Skills *
                  </label>
                  <input
                    type="text"
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    placeholder="Python, React, SQL"
                    value={editFormData.must_have_skills}
                    onChange={(e) => setEditFormData({ ...editFormData, must_have_skills: e.target.value })}
                  />
                  <p className="text-xs text-gray-500 mt-2">Separate with commas</p>
                </div>
                
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Good-to-Have Skills</label>
                  <input
                    type="text"
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    placeholder="Docker, AWS, Kubernetes"
                    value={editFormData.good_to_have_skills}
                    onChange={(e) => setEditFormData({ ...editFormData, good_to_have_skills: e.target.value })}
                  />
                  <p className="text-xs text-gray-500 mt-2">Separate with commas</p>
                </div>
              </div>
              
              <div className="flex space-x-4 pt-6">
                <button
                  type="submit"
                  disabled={updateJobMutation.isLoading}
                  className="flex-1 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all duration-300 font-bold text-lg shadow-lg hover:shadow-xl disabled:opacity-50"
                >
                  {updateJobMutation.isLoading ? 'Updating...' : 'Update Job'}
                </button>
                <button
                  type="button"
                  onClick={() => setShowEditJob(false)}
                  className="px-8 py-4 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-colors font-bold"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default JobDetails
