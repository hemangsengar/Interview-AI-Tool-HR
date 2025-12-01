import { useState } from 'react'
import { useQuery } from 'react-query'
import { Link } from 'react-router-dom'
import { jobService } from '../api/services'
import { useAuthStore } from '../store/authStore'

const HRDashboard = () => {
  const logout = useAuthStore(state => state.logout)
  const token = localStorage.getItem('token')
  
  if (!token) {
    window.location.href = '/hr/login'
    return null
  }
  
  const [showCreateJob, setShowCreateJob] = useState(false)
  const [formData, setFormData] = useState({
    title: '',
    jd_raw_text: '',
    must_have_skills: '',
    good_to_have_skills: ''
  })

  const { data: jobs, isLoading, refetch } = useQuery('jobs', () => 
    jobService.list().then(res => res.data)
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
      
      // Show success message with job code
      if (response.data.job_code) {
        alert(`Job created successfully! Job Code: ${response.data.job_code}\n\nShare this code with candidates.`)
      }
    } catch (err) {
      console.error('Job creation error:', err)
      const errorMsg = err.response?.data?.detail || err.message || 'Failed to create job. Please try again.'
      alert(errorMsg)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      <nav className="bg-white/80 backdrop-blur-md shadow-lg border-b border-white/20 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
                <span className="text-white font-bold text-xl">HR</span>
              </div>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">
                  HR Dashboard
                </h1>
                <p className="text-sm text-gray-500">Manage jobs and candidates</p>
              </div>
            </div>
            <button
              onClick={logout}
              className="px-5 py-2.5 text-red-600 hover:bg-red-50 rounded-xl transition-colors flex items-center space-x-2 font-medium"
            >
              <span>🚪</span>
              <span>Logout</span>
            </button>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 border border-white/40 shadow-xl hover:shadow-2xl transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-gray-600 uppercase tracking-wide">Total Jobs</p>
                <p className="text-4xl font-bold text-gray-900 mt-2">{jobs?.length || 0}</p>
              </div>
              <div className="w-16 h-16 bg-gradient-to-br from-blue-100 to-blue-200 rounded-2xl flex items-center justify-center shadow-lg">
                <span className="text-3xl">💼</span>
              </div>
            </div>
          </div>
          
          <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 border border-white/40 shadow-xl hover:shadow-2xl transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-gray-600 uppercase tracking-wide">Total Candidates</p>
                <p className="text-4xl font-bold text-gray-900 mt-2">
                  {jobs?.reduce((sum, job) => sum + (job.candidate_count || 0), 0) || 0}
                </p>
              </div>
              <div className="w-16 h-16 bg-gradient-to-br from-green-100 to-green-200 rounded-2xl flex items-center justify-center shadow-lg">
                <span className="text-3xl">👥</span>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-8 border border-white/40 shadow-xl">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-3xl font-bold text-gray-800">Your Jobs</h2>
            <button
              onClick={() => setShowCreateJob(true)}
              className="px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all duration-300 shadow-lg hover:shadow-xl flex items-center space-x-2 font-semibold"
            >
              <span className="text-xl">✨</span>
              <span>Create New Job</span>
            </button>
          </div>

          {isLoading ? (
            <div className="text-center py-16">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-blue-600 border-t-transparent"></div>
              <p className="mt-4 text-gray-600 font-medium">Loading jobs...</p>
            </div>
          ) : jobs?.length === 0 ? (
            <div className="text-center py-16">
              <div className="text-7xl mb-6">📋</div>
              <h3 className="text-2xl font-bold text-gray-700 mb-3">No jobs yet</h3>
              <p className="text-gray-500 mb-8 text-lg">Create your first job to start interviewing candidates</p>
              <button
                onClick={() => setShowCreateJob(true)}
                className="px-8 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all duration-300 shadow-lg text-lg font-semibold"
              >
                Create First Job
              </button>
            </div>
          ) : (
            <div className="grid gap-6">
              {jobs?.map(job => (
                <div
                  key={job.id}
                  className="bg-gradient-to-r from-white to-blue-50/30 rounded-2xl p-6 border border-blue-100 shadow-lg hover:shadow-2xl transition-all duration-300 group"
                >
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-3">
                        <h3 className="text-2xl font-bold text-gray-800 group-hover:text-blue-600 transition-colors">
                          {job.title}
                        </h3>
                        <span className="px-4 py-1.5 bg-gradient-to-r from-blue-500 to-indigo-500 text-white rounded-full text-sm font-bold shadow-md">
                          {job.job_code || 'N/A'}
                        </span>
                        {job.is_active && (
                          <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-semibold">
                            Active
                          </span>
                        )}
                      </div>
                      <p className="text-gray-600 text-sm mb-4 line-clamp-2 leading-relaxed">
                        {job.jd_raw_text.substring(0, 200)}...
                      </p>
                      
                      {job.must_have_skills?.length > 0 && (
                        <div className="flex flex-wrap gap-2 mb-4">
                          {job.must_have_skills?.slice(0, 5).map((skill, i) => (
                            <span key={i} className="px-3 py-1 bg-green-100 text-green-800 rounded-lg text-xs font-medium">
                              ✓ {skill}
                            </span>
                          ))}
                          {job.must_have_skills?.length > 5 && (
                            <span className="px-3 py-1 bg-gray-100 text-gray-600 rounded-lg text-xs font-medium">
                              +{job.must_have_skills.length - 5} more
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                    <div className="flex items-center space-x-6 text-sm text-gray-600">
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
                      className="px-6 py-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors flex items-center space-x-2 font-semibold shadow-md hover:shadow-lg"
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

      {showCreateJob && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-3xl p-8 max-w-3xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-gray-100">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                Create New Job
              </h3>
              <button
                onClick={() => setShowCreateJob(false)}
                className="w-10 h-10 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors text-gray-600 font-bold"
              >
                ✕
              </button>
            </div>
            
            <form onSubmit={handleCreateJob} className="space-y-6">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Job Title *</label>
                <input
                  type="text"
                  required
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  placeholder="e.g., Senior Python Developer"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                />
              </div>
              
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Job Description *</label>
                <textarea
                  required
                  rows={6}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all resize-none"
                  placeholder="Describe the role, responsibilities, and requirements..."
                  value={formData.jd_raw_text}
                  onChange={(e) => setFormData({ ...formData, jd_raw_text: e.target.value })}
                />
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
                    value={formData.must_have_skills}
                    onChange={(e) => setFormData({ ...formData, must_have_skills: e.target.value })}
                  />
                  <p className="text-xs text-gray-500 mt-2">Separate with commas</p>
                </div>
                
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Good-to-Have Skills</label>
                  <input
                    type="text"
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    placeholder="Docker, AWS, Kubernetes"
                    value={formData.good_to_have_skills}
                    onChange={(e) => setFormData({ ...formData, good_to_have_skills: e.target.value })}
                  />
                  <p className="text-xs text-gray-500 mt-2">Separate with commas</p>
                </div>
              </div>
              
              <div className="flex space-x-4 pt-6">
                <button
                  type="submit"
                  className="flex-1 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all duration-300 font-bold text-lg shadow-lg hover:shadow-xl"
                >
                  Create Job & Generate Code
                </button>
                <button
                  type="button"
                  onClick={() => setShowCreateJob(false)}
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

export default HRDashboard
