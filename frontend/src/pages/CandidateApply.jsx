import { useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { jobService } from '../api/services'
import { Button } from '../components/ui/Button'
import { Input } from '../components/ui/Input'
import { Card, CardContent } from '../components/ui/Card'
import { toast } from 'sonner'
import { FileText, ArrowRight, ArrowLeft, Lightbulb, UploadCloud } from 'lucide-react'

const CandidateApply = () => {
  const { jobId } = useParams()
  const navigate = useNavigate()
  const [formData, setFormData] = useState({ name: '', email: '' })
  const [resumeFile, setResumeFile] = useState(null)
  const [resumeText, setResumeText] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
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
        toast.error('Please upload a resume or paste resume text')
        setLoading(false)
        return
      }

      const response = await jobService.registerCandidate(jobId, data)
      const sessionId = response.data.interview_session_id
      toast.success('Profile created!', {
        description: 'You are now ready to start the interview.'
      })
      navigate(`/interview/${sessionId}`)
    } catch (err) {
      const errorMsg = err.response?.data?.detail || 'Failed to register. Please try again.'
      toast.error(errorMsg)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="animate-reveal-up max-w-2xl mx-auto">
      <Card className="border-white/10 overflow-hidden">
        <CardContent className="pt-8">
          {/* Header */}
          <div className="text-center mb-10">
            <div className="w-20 h-20 bg-gradient-primary rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-glow-primary hover:rotate-3 transition-transform">
              <FileText className="w-10 h-10 text-white" />
            </div>
            <h1 className="text-4xl font-display font-bold text-white mb-3">Complete Your Profile</h1>
            <p className="text-slate-400 text-lg">Tell us a bit about yourself to start the AI interview</p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-300 ml-1">Full Name</label>
                <Input
                  type="text"
                  required
                  placeholder="John Doe"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-300 ml-1">Email Address</label>
                <Input
                  type="email"
                  required
                  placeholder="john@email.com"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                />
              </div>
            </div>

            <div className="space-y-4">
              <label className="text-sm font-medium text-slate-300 ml-1">Resume Submission</label>
              
              <div className="grid grid-cols-1 gap-6">
                {/* Upload Section */}
                <div className="relative group">
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
                    className="flex flex-col items-center justify-center gap-4 w-full p-8 rounded-2xl border-2 border-dashed border-white/10 
                      bg-white/5 hover:bg-white/10 hover:border-primary/50 cursor-pointer transition-all duration-300 group"
                  >
                    <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                      <UploadCloud className="w-6 h-6 text-primary-light" />
                    </div>
                    <div className="text-center">
                      <p className="text-white font-medium">
                        {resumeFile ? resumeFile.name : 'Drop your resume here'}
                      </p>
                      <p className="text-slate-500 text-xs mt-1">PDF or DOCX up to 10MB</p>
                    </div>
                  </label>
                </div>

                <div className="relative flex items-center py-2">
                  <div className="flex-grow border-t border-white/5"></div>
                  <span className="flex-shrink mx-4 text-slate-600 text-xs font-bold uppercase tracking-widest">OR</span>
                  <div className="flex-grow border-t border-white/5"></div>
                </div>

                {/* Text Area Section */}
                <div className="space-y-2">
                  <p className="text-xs text-slate-500 ml-1 mb-2 italic">Paste your resume content manually</p>
                  <textarea
                    rows={6}
                    className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all resize-none"
                    placeholder="Experience, Skills, Education..."
                    value={resumeText}
                    onChange={(e) => {
                      setResumeText(e.target.value)
                      setResumeFile(null)
                    }}
                  />
                </div>
              </div>
            </div>

            <Button
              type="submit"
              disabled={loading}
              variant="premium"
              size="xl"
              className="w-full py-8 text-xl"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-3">
                  <div className="animate-spin w-6 h-6 border-2 border-white/30 border-t-white rounded-full" />
                  Preparing Your Interview...
                </span>
              ) : (
                <span className="flex items-center gap-3">
                  Start AI Interview
                  <ArrowRight className="w-6 h-6" />
                </span>
              )}
            </Button>
          </form>

          {/* Tips Section */}
          <div className="mt-10 p-6 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm">
            <h3 className="text-base font-bold text-primary-light mb-4 flex items-center gap-2">
              <Lightbulb className="w-5 h-5" />
              Before you start
            </h3>
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="flex items-start gap-3">
                <div className="mt-1 w-5 h-5 rounded-full bg-green-500/20 flex items-center justify-center flex-shrink-0">
                  <span className="text-green-500 text-[10px]">✓</span>
                </div>
                <p className="text-xs text-slate-400">Stable internet & working microphone</p>
              </div>
              <div className="flex items-start gap-3">
                <div className="mt-1 w-5 h-5 rounded-full bg-green-500/20 flex items-center justify-center flex-shrink-0">
                  <span className="text-green-500 text-[10px]">✓</span>
                </div>
                <p className="text-xs text-slate-400">Quiet environment for 15-20 mins</p>
              </div>
            </div>
          </div>

          <div className="mt-8 text-center pt-4">
            <Link to="/candidate" className="text-sm text-slate-500 hover:text-slate-300 transition-colors flex items-center justify-center gap-2">
              <ArrowLeft className="w-4 h-4" />
              Back to Job Code Entry
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default CandidateApply
