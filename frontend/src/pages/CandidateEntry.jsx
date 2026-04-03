import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { jobService } from '../api/services'
import { Button } from '../components/ui/Button'
import { Input } from '../components/ui/Input'
import { Card, CardContent } from '../components/ui/Card'
import { toast } from 'sonner'
import { Mic, ArrowRight, ArrowLeft, Info, Sparkles } from 'lucide-react'

const CandidateEntry = () => {
  const navigate = useNavigate()
  const [jobCode, setJobCode] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)

    try {
      const response = await jobService.getByCode(jobCode.toUpperCase())
      toast.success('Job found!', {
        description: `Preparing application for ${response.data.title}`
      })
      navigate(`/candidate/apply/${response.data.id}`)
    } catch (err) {
      const errorMsg = err.response?.data?.detail || 'Job not found. Please check the code.'
      toast.error(errorMsg)
    } finally {
      setLoading(false)
    }
  }

  const demoJobs = [
    { code: 'PY2024', title: 'Senior Python Developer' },
    { code: 'JS2024', title: 'Full Stack JS Developer' },
    { code: 'DS2024', title: 'Data Scientist - ML' },
  ]

  return (
    <div className="animate-reveal-up max-w-lg mx-auto">
      <Card className="border-white/10 overflow-hidden">
        <CardContent className="pt-8">
          {/* Header */}
          <div className="text-center mb-10">
            <div className="w-20 h-20 bg-gradient-accent rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-glow-accent hover:scale-110 transition-transform">
              <Mic className="w-10 h-10 text-white" />
            </div>
            <h1 className="text-4xl font-display font-bold text-white mb-3">Join Interview</h1>
            <p className="text-slate-400 text-lg">Enter your unique job code to begin</p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-8">
            <div className="space-y-4">
              <label className="block text-sm font-bold text-slate-300 text-center uppercase tracking-widest">
                Job Code
              </label>
              <Input
                type="text"
                value={jobCode}
                onChange={(e) => setJobCode(e.target.value.toUpperCase())}
                className="text-center text-3xl font-mono tracking-[0.5em] uppercase h-20 border-2 focus:ring-accent/50 focus:border-accent/50"
                placeholder="XXXXXX"
                maxLength={6}
                required
              />
              <p className="text-xs text-slate-500 text-center italic">
                The 6-character code provided in your invitation
              </p>
            </div>

            <Button
              type="submit"
              disabled={loading || jobCode.length < 6}
              variant="secondary"
              size="xl"
              className="w-full py-8 text-xl bg-gradient-accent border-none shadow-glow-accent"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-3">
                  <div className="animate-spin w-6 h-6 border-2 border-white/30 border-t-white rounded-full" />
                  Finding Job...
                </span>
              ) : (
                <span className="flex items-center gap-3">
                  Check Job Code
                  <ArrowRight className="w-6 h-6" />
                </span>
              )}
            </Button>
          </form>

          {/* Instructions */}
          <div className="mt-10 p-5 rounded-2xl bg-white/5 border border-white/10">
            <h3 className="text-sm font-bold text-slate-300 mb-4 flex items-center gap-2">
              <Info className="w-4 h-4 text-accent" />
              Before you begin:
            </h3>
            <ul className="grid grid-cols-1 gap-3">
              <li className="flex items-center gap-3 text-xs text-slate-400">
                <div className="w-1.5 h-1.5 rounded-full bg-accent" />
                Find a quiet, well-lit environment
              </li>
              <li className="flex items-center gap-3 text-xs text-slate-400">
                <div className="w-1.5 h-1.5 rounded-full bg-accent" />
                Ensure your microphone and camera work
              </li>
            </ul>
          </div>

          {/* Demo Job Codes */}
          <div className="mt-6 p-5 rounded-2xl bg-accent/5 border border-accent/20 border-dashed">
            <h3 className="text-xs font-bold text-accent mb-4 flex items-center gap-2 uppercase tracking-wider">
              <Sparkles className="w-3 h-3" />
              Demo Job Codes
            </h3>
            <div className="grid grid-cols-1 gap-2">
              {demoJobs.map((job) => (
                <button
                  key={job.code}
                  type="button"
                  onClick={() => setJobCode(job.code)}
                  className="flex items-center justify-between p-3 rounded-xl bg-dark/40 hover:bg-dark/80 border border-white/5 hover:border-accent/40 transition-all group"
                >
                  <span className="text-xs text-slate-400 group-hover:text-slate-300 truncate mr-2">{job.title}</span>
                  <span className="font-mono text-sm font-bold text-accent group-hover:text-white">{job.code}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Back link */}
          <div className="mt-8 text-center pt-4">
            <Link to="/" className="text-sm text-slate-500 hover:text-slate-300 transition-colors flex items-center justify-center gap-2">
              <ArrowLeft className="w-4 h-4" />
              Back to Home
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default CandidateEntry
