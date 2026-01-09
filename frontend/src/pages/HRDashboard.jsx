import { useState } from 'react'
import { useQuery } from 'react-query'
import { Link, Navigate } from 'react-router-dom'
import { jobService } from '../api/services'
import { useAuthStore } from '../store/authStore'

const HRDashboard = () => {
  const logout = useAuthStore(state => state.logout)
  const token = localStorage.getItem('token')



  const [showCreateJob, setShowCreateJob] = useState(false)
  const [formData, setFormData] = useState({
    title: '',
    jd_raw_text: '',
    must_have_skills: '',
    good_to_have_skills: ''
  })

  const { data: jobs, isLoading, refetch } = useQuery(
    'jobs',
    () => jobService.list().then(res => res.data),
    {
      enabled: !!token,
      retry: 1
    }
  )

  const handleCreateJob = async (e) => {
    e.preventDefault()
    try {
      const response = await jobService.create({
        ...formData,
        must_have_skills: formData.must_have_skills.split(',').map(s => s.trim()).filter(Boolean),
        good_to_have_skills: formData.good_to_have_skills.split(',').map(s => s.trim()).filter(Boolean)
      })
      setShowCreateJob(false)
      setFormData({ title: '', jd_raw_text: '', must_have_skills: '', good_to_have_skills: '' })
      refetch()

      if (response.data.job_code) {
        alert(`Job created successfully! Job Code: ${response.data.job_code}\n\nShare this code with candidates.`)
      }
    } catch (err) {
      console.error('Job creation error:', err)
      const errorMsg = err.response?.data?.detail || err.message || 'Failed to create job. Please try again.'
      alert(errorMsg)
    }
  }

  if (!token) {
    return <Navigate to="/hr/login" replace />
  }

  return (
    <div className="min-h-screen bg-dark">
      {/* Background effects */}
      <div className="fixed inset-0 bg-gradient-mesh pointer-events-none" />
      <div className="fixed top-0 right-0 w-96 h-96 bg-primary/10 rounded-full blur-3xl pointer-events-none" />
      <div className="fixed bottom-0 left-0 w-80 h-80 bg-secondary/10 rounded-full blur-3xl pointer-events-none" />

      {/* Navbar */}
      <nav className="relative z-40 glass border-b border-white/5">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-gradient-primary rounded-xl flex items-center justify-center shadow-glow-primary">
                <span className="text-white font-bold text-xl">HR</span>
              </div>
              <div>
                <h1 className="text-2xl font-bold text-white">HR Dashboard</h1>
                <p className="text-sm text-slate-400">Manage jobs and candidates</p>
              </div>
            </div>
            <button
              onClick={logout}
              className="px-5 py-2.5 text-red-400 hover:bg-red-500/10 rounded-xl transition-colors flex items-center space-x-2 font-medium"
            >
              <span>🚪</span>
              <span>Logout</span>
            </button>
          </div>
        </div>
      </nav>

      <div className="relative max-w-7xl mx-auto px-6 py-8">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div className="card">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-slate-400 uppercase tracking-wide">Total Jobs</p>
                <p className="text-4xl font-bold text-white mt-2">{jobs?.length || 0}</p>
              </div>
              <div className="w-16 h-16 bg-gradient-primary rounded-2xl flex items-center justify-center shadow-glow-primary">
                <span className="text-3xl">💼</span>
              </div>
            </div>
          </div>

          <div className="card">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-slate-400 uppercase tracking-wide">Total Candidates</p>
                <p className="text-4xl font-bold text-white mt-2">
                  {jobs?.reduce((sum, job) => sum + (job.candidate_count || 0), 0) || 0}
                </p>
              </div>
              <div className="w-16 h-16 bg-gradient-secondary rounded-2xl flex items-center justify-center shadow-glow-secondary">
                <span className="text-3xl">👥</span>
              </div>
            </div>
          </div>
        </div>

        {/* Jobs Section */}
        <div className="glass rounded-2xl p-8">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-3xl font-bold text-white">Your Jobs</h2>
            <button
              onClick={() => setShowCreateJob(true)}
              className="btn-primary flex items-center space-x-2"
            >
              <span className="text-xl">✨</span>
              <span>Create New Job</span>
            </button>
          </div>

          {isLoading ? (
            <div className="text-center py-16">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-primary border-t-transparent" />
              <p className="mt-4 text-slate-400 font-medium">Loading jobs...</p>
            </div>
          ) : jobs?.length === 0 ? (
            <div className="text-center py-16">
              <div className="text-7xl mb-6">📋</div>
              <h3 className="text-2xl font-bold text-white mb-3">No jobs yet</h3>
              <p className="text-slate-400 mb-8 text-lg">Create your first job to start interviewing candidates</p>
              <button
                onClick={() => setShowCreateJob(true)}
                className="btn-primary text-lg px-8 py-4"
              >
                Create First Job
              </button>
            </div>
          ) : (
            <div className="grid gap-6">
              {jobs?.map(job => (
                <div
                  key={job.id}
                  className="bg-dark-card hover:bg-dark-hover rounded-2xl p-6 border border-slate-700/50 
                    hover:border-primary/50 transition-all duration-300 group"
                >
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex-1">
                      <div className="flex items-center flex-wrap gap-3 mb-3">
                        <h3 className="text-2xl font-bold text-white group-hover:text-primary-light transition-colors">
                          {job.title}
                        </h3>
                        <span className="px-4 py-1.5 bg-gradient-primary text-white rounded-full text-sm font-bold shadow-glow-primary">
                          {job.job_code || 'N/A'}
                        </span>
                        {job.is_active && (
                          <span className="px-3 py-1 bg-green-500/20 text-green-400 rounded-full text-xs font-semibold">
                            Active
                          </span>
                        )}
                      </div>
                      <p className="text-slate-400 text-sm mb-4 line-clamp-2 leading-relaxed">
                        {job.jd_raw_text.substring(0, 200)}...
                      </p>

                      {job.must_have_skills?.length > 0 && (
                        <div className="flex flex-wrap gap-2 mb-4">
                          {job.must_have_skills?.slice(0, 5).map((skill, i) => (
                            <span key={i} className="px-3 py-1 bg-primary/10 text-primary-light rounded-lg text-xs font-medium border border-primary/20">
                              ✓ {skill}
                            </span>
                          ))}
                          {job.must_have_skills?.length > 5 && (
                            <span className="px-3 py-1 bg-slate-700/50 text-slate-400 rounded-lg text-xs font-medium">
                              +{job.must_have_skills.length - 5} more
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-4 border-t border-slate-700/50">
                    <div className="flex items-center space-x-6 text-sm text-slate-400">
                      <span className="flex items-center space-x-2 font-medium">
                        <span className="text-lg">👥</span>
                        <span>{job.candidate_count} candidates</span>
                      </span>
                      <span className="flex items-center space-x-2 font-medium">
                        <span className="text-lg">📅</span>
                        <span>{new Date(job.created_at).toLocaleDateString()}</span>
                      </span>
                    </div>
                    <Link
                      to={`/hr/jobs/${job.id}`}
                      className="px-6 py-2.5 bg-primary hover:bg-primary-dark text-white rounded-xl transition-colors 
                        flex items-center space-x-2 font-semibold shadow-glow-primary"
                    >
                      <span>View Details</span>
                      <span>→</span>
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Create Job Modal */}
      {showCreateJob && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="glass rounded-3xl p-8 max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-3xl font-bold text-gradient">
                Create New Job
              </h3>
              <button
                onClick={() => setShowCreateJob(false)}
                className="w-10 h-10 rounded-full bg-slate-700 hover:bg-slate-600 flex items-center justify-center 
                  transition-colors text-slate-300"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateJob} className="space-y-6">
              <div>
                <label className="block text-sm font-bold text-slate-300 mb-2">Job Title *</label>
                <input
                  type="text"
                  required
                  className="input-field"
                  placeholder="e.g., Senior Python Developer"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-300 mb-2">Job Description *</label>
                <textarea
                  required
                  rows={6}
                  className="input-field resize-none"
                  placeholder="Describe the role, responsibilities, and requirements..."
                  value={formData.jd_raw_text}
                  onChange={(e) => setFormData({ ...formData, jd_raw_text: e.target.value })}
                />
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-bold text-slate-300 mb-2">
                    Must-Have Skills *
                  </label>
                  <input
                    type="text"
                    className="input-field"
                    placeholder="Python, React, SQL"
                    value={formData.must_have_skills}
                    onChange={(e) => setFormData({ ...formData, must_have_skills: e.target.value })}
                  />
                  <p className="text-xs text-slate-500 mt-2">Separate with commas</p>
                </div>

                <div>
                  <label className="block text-sm font-bold text-slate-300 mb-2">Good-to-Have Skills</label>
                  <input
                    type="text"
                    className="input-field"
                    placeholder="Docker, AWS, Kubernetes"
                    value={formData.good_to_have_skills}
                    onChange={(e) => setFormData({ ...formData, good_to_have_skills: e.target.value })}
                  />
                  <p className="text-xs text-slate-500 mt-2">Separate with commas</p>
                </div>
              </div>

              <div className="flex space-x-4 pt-6">
                <button
                  type="submit"
                  className="flex-1 btn-primary py-4 text-lg"
                >
                  Create Job & Generate Code
                </button>
                <button
                  type="button"
                  onClick={() => setShowCreateJob(false)}
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

export default HRDashboard
