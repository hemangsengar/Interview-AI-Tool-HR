import { useState, useEffect } from 'react'
import { useQuery, useMutation } from 'react-query'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { jobService } from '../api/services'

const JobDetails = () => {
  const { jobId } = useParams()
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
    { onSuccess: () => { refetch(); setDeleteConfirm(null) } }
  )

  const deleteJobMutation = useMutation(
    () => jobService.delete(jobId),
    {
      onSuccess: () => navigate('/hr/jobs'),
      onError: (err) => alert('Failed to delete job: ' + (err.response?.data?.detail || err.message))
    }
  )

  const updateJobMutation = useMutation(
    (formData) => jobService.update(jobId, formData),
    {
      onSuccess: () => { refetchJob(); setShowEditJob(false); alert('Job updated successfully!') },
      onError: (err) => alert('Failed to update job: ' + (err.response?.data?.detail || err.message))
    }
  )

  const handleEditJob = async (e) => {
    e.preventDefault()
    const formData = new FormData()
    formData.append('title', editFormData.title)
    formData.append('jd_raw_text', editFormData.jd_raw_text)
    formData.append('must_have_skills', editFormData.must_have_skills)
    formData.append('good_to_have_skills', editFormData.good_to_have_skills)
    if (editFormData.jd_file) formData.append('jd_file', editFormData.jd_file)
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
    <div className="min-h-screen bg-dark flex items-center justify-center">
      <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary border-t-transparent"></div>
    </div>
  )

  return (
    <div className="min-h-screen bg-dark">
      {/* Background effects */}
      <div className="fixed inset-0 bg-gradient-mesh pointer-events-none" />
      <div className="fixed top-0 right-0 w-96 h-96 bg-primary/10 rounded-full blur-3xl pointer-events-none" />

      {/* Navbar */}
      <nav className="relative z-40 glass border-b border-white/5">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <Link to="/hr/jobs" className="text-primary-light hover:text-primary font-semibold flex items-center space-x-2">
            <span>←</span>
            <span>Back to Dashboard</span>
          </Link>
        </div>
      </nav>

      <div className="relative max-w-7xl mx-auto px-6 py-8">
        {/* Job Info Card */}
        <div className="glass rounded-2xl p-8 mb-8">
          <div className="flex flex-wrap justify-between items-start gap-4 mb-6">
            <div>
              <h1 className="text-4xl font-bold text-white mb-2">{job.title}</h1>
              <div className="flex items-center space-x-3">
                <span className="px-4 py-1.5 bg-gradient-primary text-white rounded-full text-sm font-bold shadow-glow-primary">
                  Code: {job.job_code || 'N/A'}
                </span>
                {job.is_active && (
                  <span className="px-3 py-1 bg-green-500/20 text-green-400 rounded-full text-xs font-semibold">
                    Active
                  </span>
                )}
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <button
                onClick={() => setShowEditJob(true)}
                className="px-4 py-2 bg-primary hover:bg-primary-dark text-white rounded-xl transition-colors font-semibold flex items-center space-x-2"
              >
                <span>✏️</span>
                <span>Edit Job</span>
              </button>
              <button
                onClick={() => setDeleteJobConfirm(true)}
                className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-xl transition-colors font-semibold flex items-center space-x-2"
              >
                <span>🗑️</span>
                <span>Delete</span>
              </button>
              <div className="text-right">
                <p className="text-sm text-slate-400">Created</p>
                <p className="text-lg font-semibold text-white">{new Date(job.created_at).toLocaleDateString()}</p>
              </div>
            </div>
          </div>

          <div className="mb-6">
            <h3 className="font-bold text-slate-300 mb-3 text-lg">Job Description:</h3>
            <p className="text-slate-400 whitespace-pre-wrap leading-relaxed">{job.jd_raw_text}</p>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h3 className="font-bold text-slate-300 mb-3 text-lg">Must-Have Skills:</h3>
              <div className="flex flex-wrap gap-2">
                {job.must_have_skills?.map((skill, i) => (
                  <span key={i} className="px-3 py-1.5 bg-green-500/20 text-green-400 rounded-lg text-sm font-medium border border-green-500/30">
                    ✓ {skill}
                  </span>
                ))}
              </div>
            </div>
            <div>
              <h3 className="font-bold text-slate-300 mb-3 text-lg">Good-to-Have Skills:</h3>
              <div className="flex flex-wrap gap-2">
                {job.good_to_have_skills?.map((skill, i) => (
                  <span key={i} className="px-3 py-1.5 bg-primary/20 text-primary-light rounded-lg text-sm font-medium border border-primary/30">
                    + {skill}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Candidates Section */}
        <div className="glass rounded-2xl p-8">
          <h2 className="text-3xl font-bold text-white mb-6">
            Candidates ({candidates?.length || 0})
          </h2>

          {candidates?.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">👥</div>
              <p className="text-slate-400 text-lg">No candidates yet</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-dark-card">
                  <tr>
                    <th className="px-4 py-3 text-left font-bold text-slate-300">Name</th>
                    <th className="px-4 py-3 text-left font-bold text-slate-300">Email</th>
                    <th className="px-4 py-3 text-left font-bold text-slate-300">Resume</th>
                    <th className="px-4 py-3 text-left font-bold text-slate-300">Score</th>
                    <th className="px-4 py-3 text-left font-bold text-slate-300">Recommendation</th>
                    <th className="px-4 py-3 text-left font-bold text-slate-300">Status</th>
                    <th className="px-4 py-3 text-left font-bold text-slate-300">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {candidates?.map(candidate => (
                    <tr key={candidate.id} className="border-t border-slate-700/50 hover:bg-dark-hover transition-colors">
                      <td className="px-4 py-4 font-medium text-white">{candidate.name}</td>
                      <td className="px-4 py-4 text-slate-400">{candidate.email}</td>
                      <td className="px-4 py-4">
                        {candidate.resume_file_path ? (
                          <button
                            onClick={() => handleDownloadResume(candidate.id, candidate.name)}
                            className="text-primary-light hover:text-primary font-medium flex items-center space-x-1"
                          >
                            <span>📄</span>
                            <span>Download</span>
                          </button>
                        ) : (
                          <span className="text-slate-500">No file</span>
                        )}
                      </td>
                      <td className="px-4 py-4">
                        {candidate.final_score !== null && candidate.final_score !== undefined ? (
                          <span className="font-bold text-white">{candidate.final_score.toFixed(1)}/100</span>
                        ) : (
                          <span className="text-slate-500 italic">Pending</span>
                        )}
                      </td>
                      <td className="px-4 py-4">
                        {candidate.final_recommendation ? (
                          <span className={`px-3 py-1 rounded-lg text-sm font-semibold ${candidate.final_recommendation === 'Strong' ? 'bg-green-500/20 text-green-400' :
                            candidate.final_recommendation === 'Medium' ? 'bg-yellow-500/20 text-yellow-400' :
                              candidate.final_recommendation === 'Weak' ? 'bg-orange-500/20 text-orange-400' :
                                'bg-red-500/20 text-red-400'
                            }`}>
                            {candidate.final_recommendation}
                          </span>
                        ) : (
                          <span className="text-slate-500 italic">Pending</span>
                        )}
                      </td>
                      <td className="px-4 py-4">
                        <span className={`px-3 py-1 rounded-lg text-sm font-semibold ${candidate.status === 'Shortlisted' ? 'bg-green-500/20 text-green-400' :
                          candidate.status === 'Rejected' ? 'bg-red-500/20 text-red-400' :
                            'bg-yellow-500/20 text-yellow-400'
                          }`}>
                          {candidate.status || 'Pending'}
                        </span>
                      </td>
                      <td className="px-4 py-4">
                        <div className="flex items-center space-x-2">
                          {candidate.interview_session_id && (
                            <Link
                              to={`/hr/interviews/${candidate.interview_session_id}`}
                              className="px-3 py-1.5 bg-primary hover:bg-primary-dark text-white rounded-lg transition-colors text-sm font-medium"
                            >
                              View
                            </Link>
                          )}
                          <button
                            onClick={() => setDeleteConfirm(candidate.id)}
                            className="px-3 py-1.5 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors text-sm font-medium"
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

      {/* Delete Candidate Modal */}
      {deleteConfirm && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="glass rounded-2xl p-8 max-w-md w-full">
            <h3 className="text-2xl font-bold text-white mb-4">Confirm Delete</h3>
            <p className="text-slate-400 mb-6">
              Are you sure you want to delete this candidate? This will permanently remove their interview history.
            </p>
            <div className="flex space-x-4">
              <button
                onClick={() => deleteMutation.mutate(deleteConfirm)}
                disabled={deleteMutation.isLoading}
                className="flex-1 py-3 bg-red-500 text-white rounded-xl hover:bg-red-600 transition-colors font-semibold disabled:opacity-50"
              >
                {deleteMutation.isLoading ? 'Deleting...' : 'Yes, Delete'}
              </button>
              <button
                onClick={() => setDeleteConfirm(null)}
                className="flex-1 py-3 bg-slate-700 text-slate-300 rounded-xl hover:bg-slate-600 transition-colors font-semibold"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Job Modal */}
      {deleteJobConfirm && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="glass rounded-2xl p-8 max-w-md w-full">
            <h3 className="text-2xl font-bold text-red-400 mb-4">⚠️ Delete Job?</h3>
            <p className="text-slate-400 mb-4">This will permanently remove:</p>
            <ul className="list-disc list-inside text-slate-400 mb-4 space-y-1">
              <li>The job posting</li>
              <li>All {candidates?.length || 0} candidates</li>
              <li>All interview records</li>
            </ul>
            <p className="text-red-400 font-semibold mb-6">This action cannot be undone!</p>
            <div className="flex space-x-4">
              <button
                onClick={() => deleteJobMutation.mutate()}
                disabled={deleteJobMutation.isLoading}
                className="flex-1 py-3 bg-red-500 text-white rounded-xl hover:bg-red-600 transition-colors font-semibold disabled:opacity-50"
              >
                {deleteJobMutation.isLoading ? 'Deleting...' : 'Delete Everything'}
              </button>
              <button
                onClick={() => setDeleteJobConfirm(false)}
                className="flex-1 py-3 bg-slate-700 text-slate-300 rounded-xl hover:bg-slate-600 transition-colors font-semibold"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Job Modal */}
      {showEditJob && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="glass rounded-3xl p-8 max-w-3xl w-full my-8">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-3xl font-bold text-gradient">Edit Job</h3>
              <button
                onClick={() => setShowEditJob(false)}
                className="w-10 h-10 rounded-full bg-slate-700 hover:bg-slate-600 flex items-center justify-center transition-colors text-slate-300"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleEditJob} className="space-y-6">
              <div>
                <label className="block text-sm font-bold text-slate-300 mb-2">Job Title *</label>
                <input
                  type="text"
                  required
                  className="input-field"
                  placeholder="e.g., Senior Python Developer"
                  value={editFormData.title}
                  onChange={(e) => setEditFormData({ ...editFormData, title: e.target.value })}
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-300 mb-2">Job Description *</label>
                <textarea
                  required
                  rows={6}
                  className="input-field resize-none"
                  placeholder="Describe the role..."
                  value={editFormData.jd_raw_text}
                  onChange={(e) => setEditFormData({ ...editFormData, jd_raw_text: e.target.value })}
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-300 mb-2">Upload JD File (Optional)</label>
                <input
                  type="file"
                  accept=".pdf,.doc,.docx"
                  className="input-field"
                  onChange={(e) => setEditFormData({ ...editFormData, jd_file: e.target.files[0] })}
                />
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-bold text-slate-300 mb-2">Must-Have Skills *</label>
                  <input
                    type="text"
                    className="input-field"
                    placeholder="Python, React, SQL"
                    value={editFormData.must_have_skills}
                    onChange={(e) => setEditFormData({ ...editFormData, must_have_skills: e.target.value })}
                  />
                  <p className="text-xs text-slate-500 mt-2">Separate with commas</p>
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-300 mb-2">Good-to-Have Skills</label>
                  <input
                    type="text"
                    className="input-field"
                    placeholder="Docker, AWS, Kubernetes"
                    value={editFormData.good_to_have_skills}
                    onChange={(e) => setEditFormData({ ...editFormData, good_to_have_skills: e.target.value })}
                  />
                  <p className="text-xs text-slate-500 mt-2">Separate with commas</p>
                </div>
              </div>

              <div className="flex space-x-4 pt-6">
                <button
                  type="submit"
                  disabled={updateJobMutation.isLoading}
                  className="flex-1 btn-primary py-4 text-lg disabled:opacity-50"
                >
                  {updateJobMutation.isLoading ? 'Updating...' : 'Update Job'}
                </button>
                <button
                  type="button"
                  onClick={() => setShowEditJob(false)}
                  className="px-8 py-4 bg-slate-700 text-slate-300 rounded-2xl hover:bg-slate-600 transition-colors font-bold"
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
