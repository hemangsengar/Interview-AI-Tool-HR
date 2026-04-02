import { useState, useEffect } from 'react'
import { useQuery, useMutation } from 'react-query'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import { jobService } from '../api/services'
import { Button } from '../components/ui/Button'
import { Card, CardContent } from '../components/ui/Card'
import { Input } from '../components/ui/Input'
import { Skeleton } from '../components/ui/Skeleton'
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

  return (
    <div className="max-w-7xl mx-auto px-6 py-10 animate-reveal-up">
      {/* Back & Actions */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
        <div className="flex items-center gap-6">
          <Link to="/dashboard">
             <Button variant="outline" size="sm" className="w-10 h-10 p-0 rounded-xl border-white/10 hover:bg-white/5">
                <ArrowLeft className="w-5 h-5" />
             </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-display font-bold text-white mb-1">{job.title}</h1>
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-500 font-bold uppercase tracking-widest pl-1">Job Code:</span>
              <button 
                onClick={copyJobCode}
                className="group flex items-center gap-2 bg-primary/10 border border-primary/20 rounded-lg px-2 py-0.5"
              >
                <code className="text-xs font-mono text-primary-light">{job.job_code}</code>
                <Copy className="w-3 h-3 text-primary-light/50 group-hover:text-primary-light transition-colors" />
              </button>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <Button 
            onClick={() => setShowEditJob(true)}
            variant="outline" 
            className="border-white/10 hover:bg-white/5 h-12"
          >
            <Edit3 className="mr-2 w-4 h-4" />
            Edit Opportunity
          </Button>
          <Button 
            onClick={() => setDeleteJobConfirm(true)}
            variant="destructive" 
            className="bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white border-none h-12"
          >
            <Trash2 className="mr-2 w-4 h-4" />
            Delete Role
          </Button>
        </div>
      </div>

      {/* Main Content Info */}
      <div className="grid lg:grid-cols-3 gap-8 mb-12">
        <div className="lg:col-span-2 space-y-8">
           <Card className="bg-white/5 border-white/5 h-full">
             <CardContent className="p-8">
                <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                   <Briefcase className="w-5 h-5 text-primary" />
                   Role Overview
                </h3>
                <div className="space-y-6">
                   <div>
                     <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Description</p>
                     <p className="text-slate-300 leading-relaxed text-sm whitespace-pre-wrap">{job.jd_raw_text}</p>
                   </div>
                   <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      <div>
                        <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-3">Requirement Stack</p>
                        <div className="flex flex-wrap gap-2">
                           {job.must_have_skills?.map((s, i) => (
                             <span key={i} className="px-3 py-1 bg-primary/10 text-primary-light text-xs font-bold rounded-lg border border-primary/20">
                                {s}
                             </span>
                           ))}
                        </div>
                      </div>
                      <div>
                        <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-3">Bonus Profile</p>
                        <div className="flex flex-wrap gap-2">
                           {job.good_to_have_skills?.map((s, i) => (
                             <span key={i} className="px-3 py-1 bg-secondary/10 text-secondary-light text-xs font-bold rounded-lg border border-secondary/20">
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
           <Card className="bg-white/5 border-white/5">
             <CardContent className="p-8">
                <h3 className="text-xl font-bold text-white mb-6">Stats Summary</h3>
                <div className="space-y-6">
                   <div className="flex items-center justify-between p-4 rounded-xl bg-black/20 border border-white/5">
                      <div className="flex items-center gap-3">
                        <Users className="w-4 h-4 text-primary-light" />
                        <span className="text-sm text-slate-300">Total Applicants</span>
                      </div>
                      <span className="text-xl font-bold text-white">{candidates?.length || 0}</span>
                   </div>
                   <div className="flex items-center justify-between p-4 rounded-xl bg-black/20 border border-white/5">
                      <div className="flex items-center gap-3">
                        <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                        <span className="text-sm text-slate-300">Interviews Completed</span>
                      </div>
                      <span className="text-xl font-bold text-white">
                        {candidates?.filter(c => c.interview_status === 'completed').length || 0}
                      </span>
                   </div>
                   <div className="pt-6 border-t border-white/5">
                      <p className="text-xs text-slate-500 italic text-center">
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
          <h2 className="text-2xl font-bold text-white">Applicants Analytics</h2>
          <div className="text-xs font-bold text-slate-500 uppercase tracking-widest bg-white/5 px-4 py-2 rounded-lg border border-white/5">
            Real-time Evaluation
          </div>
        </div>

        {isLoadingCandidates ? (
          <Skeleton className="h-96 w-full rounded-2xl" />
        ) : candidates?.length === 0 ? (
          <Card className="border-dashed border-white/10 bg-transparent py-20 text-center">
             <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-6">
                <User className="w-8 h-8 text-slate-600" />
             </div>
             <p className="text-slate-400 italic">No candidates have applied to this role yet.</p>
          </Card>
        ) : (
          <Card className="bg-white/5 border-white/5 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-white/10 bg-white/5">
                    <th className="px-8 py-5 text-xs font-bold text-slate-500 uppercase tracking-widest font-display">Candidate</th>
                    <th className="px-8 py-5 text-xs font-bold text-slate-500 uppercase tracking-widest font-display">Experience</th>
                    <th className="px-8 py-5 text-xs font-bold text-slate-500 uppercase tracking-widest font-display">Status</th>
                    <th className="px-8 py-5 text-xs font-bold text-slate-500 uppercase tracking-widest font-display text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5 font-sans">
                  {candidates.map((candidate) => (
                    <tr key={candidate.id} className="hover:bg-white/5 transition-colors group">
                      <td className="px-8 py-6">
                        <div>
                          <p className="text-white font-bold mb-1">{candidate.name}</p>
                          <p className="text-xs text-slate-400">{candidate.email}</p>
                        </div>
                      </td>
                      <td className="px-8 py-6">
                        <p className="text-slate-300 text-sm font-medium">{candidate.experience_years} Years</p>
                        <p className="text-[10px] text-slate-500 uppercase">Relevant Domain</p>
                      </td>
                      <td className="px-8 py-6">
                        <div className={cn(
                          "inline-flex items-center gap-2 px-3 py-1 rounded-full text-[10px] font-bold uppercase border",
                          candidate.interview_status === 'completed' 
                            ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" 
                            : "bg-amber-500/10 text-amber-400 border-amber-500/20"
                        )}>
                          <span className={cn("w-1.5 h-1.5 rounded-full", candidate.interview_status === 'completed' ? "bg-emerald-400" : "bg-amber-400")} />
                          {candidate.interview_status}
                        </div>
                      </td>
                      <td className="px-8 py-6">
                        <div className="flex items-center justify-end gap-2 opacity-50 group-hover:opacity-100 transition-opacity">
                          {candidate.interview_status === 'completed' && (
                            <Link to={`/results/${candidate.id}`}>
                              <Button variant="outline" size="sm" className="h-9 rounded-lg border-white/10 hover:bg-white/5">
                                Results
                                <ExternalLink className="ml-2 w-3 h-3 text-primary-light" />
                              </Button>
                            </Link>
                          )}
                          <Button 
                            onClick={() => handleDownloadResume(candidate.id, candidate.name)}
                            variant="outline" 
                            size="sm" 
                            className="h-9 w-9 p-0 rounded-lg border-white/10 hover:bg-white/5"
                          >
                            <Download className="w-3.5 h-3.5" />
                          </Button>
                          <Button 
                            onClick={() => setDeleteConfirm(candidate.id)}
                            variant="destructive" 
                            size="sm" 
                            className="h-9 w-9 p-0 rounded-lg bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white border-none"
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
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-6 bg-black/60 backdrop-blur-md">
          <Card className="w-full max-w-md border-white/10 animate-reveal-up overflow-hidden relative">
            <div className="absolute top-0 inset-x-0 h-1 bg-red-500" />
            <CardContent className="p-8 text-center">
              <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-6">
                 <AlertCircle className="w-8 h-8 text-red-500" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">Remove Candidate?</h3>
              <p className="text-slate-400 text-sm mb-8 leading-relaxed">
                This will permanently delete this candidate&apos;s data and interview results. This action cannot be undone.
              </p>
              <div className="flex gap-4">
                <Button 
                  onClick={() => setDeleteConfirm(null)}
                  variant="outline" 
                  className="flex-1 h-12 border-white/10"
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
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-6 bg-black/60 backdrop-blur-md">
          <Card className="w-full max-w-md border-white/10 animate-reveal-up overflow-hidden relative">
            <div className="absolute top-0 inset-x-0 h-1 bg-red-500" />
            <CardContent className="p-8 text-center">
              <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-6">
                 <Trash2 className="w-8 h-8 text-red-500" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">Delete Job Opportunity?</h3>
              <p className="text-slate-400 text-sm mb-8 leading-relaxed">
                Deleting this job will also remove ALL associated candidate data and interview records. Are you absolutely sure?
              </p>
              <div className="flex gap-4">
                <Button 
                  onClick={() => setDeleteJobConfirm(false)}
                  variant="outline" 
                  className="flex-1 h-12 border-white/10"
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-black/60 backdrop-blur-md">
          <div className="w-full max-w-2xl animate-reveal-up">
            <Card className="border-white/10 shadow-2xl">
              <CardContent className="p-8">
                <div className="flex justify-between items-center mb-8">
                  <h2 className="text-2xl font-bold text-white">Update Job Details</h2>
                  <button onClick={() => setShowEditJob(false)} className="text-slate-500 hover:text-white transition-colors">
                    <Plus className="w-6 h-6 rotate-45" />
                  </button>
                </div>
                
                <form onSubmit={handleEditJob} className="space-y-6">
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-widest pl-1">Job Title</label>
                    <Input 
                      required
                      value={editFormData.title}
                      onChange={(e) => setEditFormData({...editFormData, title: e.target.value})}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-widest pl-1">Job Description</label>
                    <textarea 
                      required
                      rows={6}
                      className="w-full bg-black/20 border border-white/5 rounded-xl p-4 text-white placeholder:text-slate-600 focus:border-primary/50 focus:ring-0 transition-all outline-none resize-none font-sans"
                      value={editFormData.jd_raw_text}
                      onChange={(e) => setEditFormData({...editFormData, jd_raw_text: e.target.value})}
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-slate-500 uppercase tracking-widest pl-1">Must Have Skills</label>
                      <Input 
                        value={editFormData.must_have_skills}
                        onChange={(e) => setEditFormData({...editFormData, must_have_skills: e.target.value})}
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-slate-500 uppercase tracking-widest pl-1">Bonus Skills</label>
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
                      className="flex-1 h-14 border-white/10" 
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
