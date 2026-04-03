import { useState, useEffect } from 'react'
import { useQuery, useMutation } from 'react-query'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import { jobService } from '../api/services'
import { Button } from '../components/ui/Button'
import { Card, CardContent } from '../components/ui/Card'
import { Input } from '../components/ui/Input'
import { Skeleton } from '../components/ui/Skeleton'
import { cn } from '../lib/utils'
import { 
  ArrowLeft, 
  Download, 
  Trash2, 
  Edit3, 
  ExternalLink, 
  User, 
  Calendar, 
  CheckCircle2,
  AlertCircle,
  Briefcase,
  Copy,
  Plus
} from 'lucide-react'

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

  const { data: job, isLoading: isLoadingJob, refetch: refetchJob } = useQuery(['job', jobId], () =>
    jobService.get(jobId).then(res => res.data)
  )

  const { data: candidates, isLoading: isLoadingCandidates, refetch: refetchCandidates } = useQuery(['candidates', jobId], () =>
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

  const deleteCandidateMutation = useMutation(
    (candidateId) => jobService.deleteCandidate(candidateId),
    { 
      onSuccess: () => { 
        refetchCandidates()
        setDeleteConfirm(null)
        toast.success('Candidate profile removed.')
      } 
    }
  )

  const deleteJobMutation = useMutation(
    () => jobService.delete(jobId),
    {
      onSuccess: () => {
        toast.success('Job opportunity deleted.')
        navigate('/dashboard')
      },
      onError: (err) => toast.error('Failed to delete job: ' + (err.response?.data?.detail || err.message))
    }
  )

  const updateJobMutation = useMutation(
    (formData) => jobService.update(jobId, formData),
    {
      onSuccess: () => { 
        refetchJob()
        setShowEditJob(false)
        toast.success('Job details updated successfully!') 
      },
      onError: (err) => toast.error('Failed to update job: ' + (err.response?.data?.detail || err.message))
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

  const copyJobCode = () => {
    if (job?.job_code) {
      navigator.clipboard.writeText(job.job_code)
      toast.info('Job code copied to clipboard!')
    }
  }

  const handleDownloadResume = async (candidateId, candidateName) => {
    try {
      const response = await jobService.downloadResume(candidateId)
      const url = window.URL.createObjectURL(new Blob([response.data]))
      const link = document.createElement('a')
      link.href = url
      link.setAttribute('download', `${candidateName.replace(/\s+/g, '_')}_resume.pdf`)
      document.body.appendChild(link)
      link.click()
      link.remove()
      toast.success('Downloading resume...')
    } catch (err) {
      console.error('Download error:', err)
      toast.error('Failed to download resume')
    }
  }

  if (isLoadingJob) {
    return (
      <div className="max-w-7xl mx-auto px-6 py-10 space-y-8 animate-reveal-up">
        <Skeleton className="h-10 w-48 rounded-lg" />
        <Skeleton className="h-64 w-full rounded-2xl" />
        <Skeleton className="h-96 w-full rounded-2xl" />
      </div>
    )
  }

  if (!job) return null

  const getInterviewStatus = (candidate) => {
    if (candidate?.interview_status) return candidate.interview_status
    return candidate?.final_score !== null && candidate?.final_score !== undefined ? 'completed' : 'pending'
  }

  return (
    <div className="max-w-7xl mx-auto px-6 py-10 animate-reveal-up">
      {/* Back & Actions */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
        <div className="flex items-center gap-6">
          <Link to="/dashboard">
             <Button variant="outline" size="sm" className="w-10 h-10 p-0 rounded-xl border-stone-200 hover:bg-stone-50">
                <ArrowLeft className="w-5 h-5 text-stone-600" />
             </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-display font-bold text-stone-900 mb-1">{job.title}</h1>
            <div className="flex items-center gap-2">
              <span className="text-xs text-stone-400 font-bold uppercase tracking-widest pl-1">Job Code:</span>
              <button 
                onClick={copyJobCode}
                className="group flex items-center gap-2 bg-orange-50 border border-orange-100 rounded-lg px-2 py-0.5"
              >
                <code className="text-xs font-mono text-primary font-bold">{job.job_code}</code>
                <Copy className="w-3 h-3 text-primary/50 group-hover:text-primary transition-colors" />
              </button>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <Button 
            onClick={() => setShowEditJob(true)}
            variant="outline" 
            className="border-stone-200 hover:bg-stone-50 h-12 text-stone-600 font-bold"
          >
            <Edit3 className="mr-2 w-4 h-4" />
            Edit Opportunity
          </Button>
          <Button 
            onClick={() => setDeleteJobConfirm(true)}
            variant="destructive" 
            className="bg-red-50 text-red-600 hover:bg-red-600 hover:text-white border border-red-100 h-12 font-bold"
          >
            <Trash2 className="mr-2 w-4 h-4" />
            Delete Role
          </Button>
        </div>
      </div>

      {/* Main Content Info */}
      <div className="grid lg:grid-cols-3 gap-8 mb-12">
        <div className="lg:col-span-2 space-y-8">
           <Card className="bg-white border-stone-100 h-full shadow-sm">
             <CardContent className="p-8">
                <h3 className="text-xl font-bold text-stone-900 mb-6 flex items-center gap-2">
                   <Briefcase className="w-5 h-5 text-primary" />
                   Role Overview
                </h3>
                <div className="space-y-6">
                   <div>
                     <p className="text-xs font-bold text-stone-400 uppercase tracking-widest mb-2">Description</p>
                     <p className="text-stone-600 leading-relaxed text-sm whitespace-pre-wrap font-medium">{job.jd_raw_text}</p>
                   </div>
                   <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      <div>
                        <p className="text-xs font-bold text-stone-400 uppercase tracking-widest mb-3">Requirement Stack</p>
                        <div className="flex flex-wrap gap-2">
                           {job.must_have_skills?.map((s, i) => (
                             <span key={i} className="px-3 py-1 bg-primary/5 text-primary text-xs font-bold rounded-lg border border-primary/10">
                                {s}
                             </span>
                           ))}
                        </div>
                      </div>
                      <div>
                        <p className="text-xs font-bold text-stone-400 uppercase tracking-widest mb-3">Bonus Profile</p>
                        <div className="flex flex-wrap gap-2">
                           {job.good_to_have_skills?.map((s, i) => (
                             <span key={i} className="px-3 py-1 bg-secondary/5 text-secondary text-xs font-bold rounded-lg border border-secondary/10">
                                {s}
                             </span>
                           ))}
                        </div>
                      </div>
                   </div>
                </div>
             </CardContent>
           </Card>
        </div>

        <div>
           <Card className="bg-white border-stone-100 shadow-sm">
             <CardContent className="p-8">
                <h3 className="text-xl font-bold text-stone-900 mb-6">Stats Summary</h3>
                <div className="space-y-6">
                   <div className="flex items-center justify-between p-4 rounded-xl bg-stone-50 border border-stone-100">
                      <div className="flex items-center gap-3">
                        <Users className="w-4 h-4 text-primary" />
                        <span className="text-sm text-stone-600 font-medium">Total Applicants</span>
                      </div>
                      <span className="text-xl font-bold text-stone-900">{candidates?.length || 0}</span>
                   </div>
                   <div className="flex items-center justify-between p-4 rounded-xl bg-stone-50 border border-stone-100">
                      <div className="flex items-center gap-3">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                        <span className="text-sm text-stone-600 font-medium">Interviews Completed</span>
                      </div>
                      <span className="text-xl font-bold text-stone-900">
                        {candidates?.filter(candidate => getInterviewStatus(candidate) === 'completed').length || 0}
                      </span>
                   </div>
                   <div className="pt-6 border-t border-stone-100">
                      <p className="text-xs text-stone-400 italic text-center font-bold uppercase tracking-widest">
                        Active since {new Date(job.created_at).toLocaleDateString()}
                      </p>
                   </div>
                </div>
             </CardContent>
           </Card>
        </div>
      </div>

      {/* Candidates List Section */}
      <div className="mb-12">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-2xl font-bold text-stone-900">Applicants Analytics</h2>
          <div className="text-[10px] font-bold text-stone-400 uppercase tracking-[0.2em] bg-stone-50 px-4 py-2 rounded-lg border border-stone-100 shadow-sm">
            Real-time Evaluation
          </div>
        </div>

        {isLoadingCandidates ? (
          <Skeleton className="h-96 w-full rounded-2xl" />
        ) : candidates?.length === 0 ? (
          <Card className="border-dashed border-stone-200 bg-transparent py-20 text-center shadow-none">
             <div className="w-16 h-16 bg-stone-50 rounded-full flex items-center justify-center mx-auto mb-6 border border-stone-100">
                <User className="w-8 h-8 text-stone-300" />
             </div>
             <p className="text-stone-500 italic font-medium">No candidates have applied to this role yet.</p>
          </Card>
        ) : (
          <Card className="bg-white border-stone-100 overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-stone-100 bg-stone-50/50">
                    <th className="px-8 py-5 text-xs font-bold text-stone-400 uppercase tracking-widest font-display">Candidate</th>
                    <th className="px-8 py-5 text-xs font-bold text-stone-400 uppercase tracking-widest font-display">Experience</th>
                    <th className="px-8 py-5 text-xs font-bold text-stone-400 uppercase tracking-widest font-display">Status</th>
                    <th className="px-8 py-5 text-xs font-bold text-stone-400 uppercase tracking-widest font-display text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100 font-sans">
                  {candidates.map((candidate) => (
                    <tr key={candidate.id} className="hover:bg-stone-50/50 transition-colors group">
                      <td className="px-8 py-6">
                        <div>
                          <p className="text-stone-900 font-bold mb-1">{candidate.name}</p>
                          <p className="text-xs text-stone-500 font-medium">{candidate.email}</p>
                        </div>
                      </td>
                      <td className="px-8 py-6">
                          <p className="text-stone-700 text-sm font-bold">{candidate.experience_years ?? 0} Years</p>
                        <p className="text-[10px] text-stone-400 uppercase font-bold tracking-tight">Relevant Domain</p>
                      </td>
                      <td className="px-8 py-6">
                        <div className={cn(
                          "inline-flex items-center gap-2 px-3 py-1 rounded-full text-[10px] font-bold uppercase border shadow-sm",
                          getInterviewStatus(candidate) === 'completed' 
                            ? "bg-emerald-50 text-emerald-600 border-emerald-100" 
                            : "bg-amber-50 text-amber-600 border-amber-100"
                        )}>
                          <span className={cn("w-1.5 h-1.5 rounded-full", getInterviewStatus(candidate) === 'completed' ? "bg-emerald-500" : "bg-amber-500")} />
                          {getInterviewStatus(candidate)}
                        </div>
                      </td>
                      <td className="px-8 py-6">
                        <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          {getInterviewStatus(candidate) === 'completed' && candidate.interview_session_id && (
                            <Link to={`/results/${candidate.interview_session_id}`}>
                              <Button variant="outline" size="sm" className="h-9 rounded-lg border-stone-200 hover:bg-white text-primary font-bold">
                                Results
                                <ExternalLink className="ml-2 w-3 h-3" />
                              </Button>
                            </Link>
                          )}
                          <Button 
                            onClick={() => handleDownloadResume(candidate.id, candidate.name)}
                            variant="outline" 
                            size="sm" 
                            className="h-9 w-9 p-0 rounded-lg border-stone-200 hover:bg-white text-stone-500 hover:text-stone-900"
                          >
                            <Download className="w-3.5 h-3.5" />
                          </Button>
                          <Button 
                            onClick={() => setDeleteConfirm(candidate.id)}
                            variant="destructive" 
                            size="sm" 
                            className="h-9 w-9 p-0 rounded-lg bg-red-50 text-red-600 hover:bg-red-600 hover:text-white border border-red-100"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        )}
      </div>

      {/* MODALS */}

      {/* Delete Candidate Confirmation */}
      {deleteConfirm && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-6 bg-stone-900/20 backdrop-blur-sm">
          <Card className="w-full max-w-md border-stone-200 animate-reveal-up overflow-hidden relative shadow-2xl bg-white">
            <div className="absolute top-0 inset-x-0 h-1 bg-red-500" />
            <CardContent className="p-8 text-center">
              <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-6 border border-red-100">
                 <AlertCircle className="w-8 h-8 text-red-500" />
              </div>
              <h3 className="text-xl font-bold text-stone-900 mb-2">Remove Candidate?</h3>
              <p className="text-stone-500 text-sm mb-8 leading-relaxed font-medium">
                This will permanently delete this candidate&apos;s data and interview results. This action cannot be undone.
              </p>
              <div className="flex gap-4">
                <Button 
                  onClick={() => setDeleteConfirm(null)}
                  variant="outline" 
                  className="flex-1 h-12 border-stone-200 text-stone-600 font-bold"
                >
                  Cancel
                </Button>
                <Button 
                  onClick={() => deleteCandidateMutation.mutate(deleteConfirm)}
                  variant="destructive" 
                  className="flex-1 h-12"
                >
                  Delete
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Delete Job Confirmation */}
      {deleteJobConfirm && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-6 bg-stone-900/20 backdrop-blur-sm">
          <Card className="w-full max-w-md border-stone-200 animate-reveal-up overflow-hidden relative shadow-2xl bg-white">
            <div className="absolute top-0 inset-x-0 h-1 bg-red-500" />
            <CardContent className="p-8 text-center">
              <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-6 border border-red-100">
                 <Trash2 className="w-8 h-8 text-red-500" />
              </div>
              <h3 className="text-xl font-bold text-stone-900 mb-2">Delete Job Opportunity?</h3>
              <p className="text-stone-500 text-sm mb-8 leading-relaxed font-medium">
                Deleting this job will also remove ALL associated candidate data and interview records. Are you absolutely sure?
              </p>
              <div className="flex gap-4">
                <Button 
                  onClick={() => setDeleteJobConfirm(false)}
                  variant="outline" 
                  className="flex-1 h-12 border-stone-200 text-stone-600 font-bold"
                >
                  Cancel
                </Button>
                <Button 
                  onClick={() => deleteJobMutation.mutate()}
                  variant="destructive" 
                  className="flex-1 h-12"
                >
                  Yes, Delete All
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Edit Job Modal */}
      {showEditJob && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-stone-900/20 backdrop-blur-sm">
          <div className="w-full max-w-2xl animate-reveal-up">
            <Card className="border-stone-200 shadow-2xl bg-white">
              <CardContent className="p-8">
                <div className="flex justify-between items-center mb-8">
                  <h2 className="text-2xl font-bold text-stone-900">Update Job Details</h2>
                  <button onClick={() => setShowEditJob(false)} className="text-stone-400 hover:text-stone-900 transition-colors">
                    <Plus className="w-6 h-6 rotate-45" />
                  </button>
                </div>
                
                <form onSubmit={handleEditJob} className="space-y-6">
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-stone-400 uppercase tracking-widest pl-1">Job Title</label>
                    <Input 
                      required
                      value={editFormData.title}
                      onChange={(e) => setEditFormData({...editFormData, title: e.target.value})}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-stone-400 uppercase tracking-widest pl-1">Job Description</label>
                    <textarea 
                      required
                      rows={6}
                      className="w-full bg-stone-50 border border-stone-200 rounded-xl p-4 text-stone-900 placeholder:text-stone-400 focus:border-primary/50 focus:ring-0 transition-all outline-none resize-none font-sans font-medium"
                      value={editFormData.jd_raw_text}
                      onChange={(e) => setEditFormData({...editFormData, jd_raw_text: e.target.value})}
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-stone-400 uppercase tracking-widest pl-1">Must Have Skills</label>
                      <Input 
                        value={editFormData.must_have_skills}
                        onChange={(e) => setEditFormData({...editFormData, must_have_skills: e.target.value})}
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-stone-400 uppercase tracking-widest pl-1">Bonus Skills</label>
                      <Input 
                        value={editFormData.good_to_have_skills}
                        onChange={(e) => setEditFormData({...editFormData, good_to_have_skills: e.target.value})}
                      />
                    </div>
                  </div>

                  <div className="flex gap-4 pt-6">
                    <Button 
                      type="button"
                      variant="outline" 
                      className="flex-1 h-14 border-stone-200 text-stone-600 font-bold" 
                      onClick={() => setShowEditJob(false)}
                    >
                      Cancel
                    </Button>
                    <Button 
                      type="submit"
                      variant="premium" 
                      className="flex-1 h-14"
                      disabled={updateJobMutation.isLoading}
                    >
                      {updateJobMutation.isLoading ? "Saving..." : "Save Changes"}
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </div>
        </div>
      )}
    </div>
  )
}

export default JobDetails
