import { useQuery } from 'react-query'
import { useParams, Link } from 'react-router-dom'
import { toast } from 'sonner'
import { interviewService } from '../api/services'
import { Button } from '../components/ui/Button'
import { Card, CardContent } from '../components/ui/Card'
import { Skeleton } from '../components/ui/Skeleton'
import { 
  ArrowLeft, 
  Video, 
  Download, 
  User, 
  Mail, 
  Briefcase, 
  Star, 
  CheckCircle, 
  AlertCircle,
  BarChart,
  MessageSquare,
  Award
} from 'lucide-react'
import { cn } from '../lib/utils'

const InterviewResults = () => {
  const { sessionId } = useParams()
  
  const { data: results, isLoading } = useQuery(['interview-results', sessionId], () =>
    interviewService.getResults(sessionId).then(res => res.data)
  )

  const handleDownloadVideo = async () => {
    try {
      const response = await interviewService.downloadVideo(sessionId)
      const url = window.URL.createObjectURL(new Blob([response.data]))
      const link = document.createElement('a')
      link.href = url
      link.setAttribute('download', `interview_${results?.candidate_name?.replace(/\s+/g, '_') || sessionId}.webm`)
      document.body.appendChild(link)
      link.click()
      link.remove()
      window.URL.revokeObjectURL(url)
      toast.success('Downloading interview recording...')
    } catch (err) {
      console.error('Download error:', err)
      toast.error('Failed to download video. It may still be processing.')
    }
  }

  const getScoreColor = (score) => {
    if (score >= 8) return 'text-emerald-600'
    if (score >= 6) return 'text-amber-600'
    return 'text-red-600'
  }

  const getRecommendationBadge = (rec) => {
    switch (rec?.toLowerCase()) {
      case 'strong': return 'bg-emerald-50 text-emerald-600 border-emerald-100 shadow-sm'
      case 'medium': return 'bg-amber-50 text-amber-600 border-amber-100 shadow-sm'
      case 'weak': return 'bg-orange-50 text-orange-600 border-orange-100 shadow-sm'
      default: return 'bg-stone-50 text-stone-600 border-stone-100'
    }
  }

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-6 py-10 space-y-8 animate-reveal-up">
        <Skeleton className="h-40 w-full rounded-3xl" />
        <Skeleton className="h-64 w-full rounded-3xl" />
        <Skeleton className="h-[500px] w-full rounded-3xl" />
      </div>
    )
  }

  if (!results) {
    return (
      <div className="max-w-7xl mx-auto px-6 py-32 text-center animate-reveal-up">
        <AlertCircle className="w-16 h-16 text-stone-200 mx-auto mb-6" />
        <h2 className="text-2xl font-bold text-stone-900 mb-2">Evaluation Not Found</h2>
        <p className="text-stone-500 mb-8">The requested interview results could not be retrieved.</p>
        <Link to="/dashboard">
          <Button variant="premium">Return to Dashboard</Button>
        </Link>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-6 py-10 animate-reveal-up">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
        <div className="flex items-center gap-6">
          <Link to={`/job/${results.job_id || ''}`}>
             <Button variant="outline" size="sm" className="w-10 h-10 p-0 rounded-xl border-stone-200 hover:bg-stone-50">
                <ArrowLeft className="w-5 h-5 text-stone-600" />
             </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-display font-bold text-stone-900 mb-1">Interview Assessment</h1>
            <p className="text-sm text-stone-500 font-medium">Detailed performance report and AI evaluation</p>
          </div>
        </div>

        <Button 
          onClick={handleDownloadVideo}
          variant="premium" 
          size="lg"
          className="h-12 px-6"
        >
          <Video className="mr-2 w-5 h-5" />
          Download Recording
        </Button>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Left Column: Summary & Report */}
        <div className="lg:col-span-2 space-y-8">
          {/* Candidate Profile Card */}
          <Card className="bg-white border-stone-100 overflow-hidden shadow-sm">
            <CardContent className="p-8">
              <div className="flex flex-col md:flex-row justify-between gap-8">
                <div className="flex gap-6">
                  <div className="w-20 h-20 bg-gradient-primary rounded-3xl flex items-center justify-center text-3xl shadow-lg border border-white/20">
                    {results.candidate_name?.charAt(0)}
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-stone-900 mb-2">{results.candidate_name}</h2>
                    <div className="space-y-1">
                      <p className="text-sm text-stone-500 font-medium flex items-center gap-2">
                        <Mail className="w-3.5 h-3.5 text-primary" />
                        {results.candidate_email}
                      </p>
                      <p className="text-sm text-stone-500 font-medium flex items-center gap-2">
                        <Briefcase className="w-3.5 h-3.5 text-secondary" />
                        {results.job_title}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="text-center md:text-right flex flex-col justify-center items-center md:items-end">
                   <p className="text-[10px] font-bold text-stone-400 uppercase tracking-widest mb-2">Overall Score</p>
                   <div className="text-6xl font-display font-black text-primary flex items-baseline">
                      {results.final_score || '0'}
                      <span className="text-xl text-stone-300 ml-1">/100</span>
                   </div>
                   {results.final_recommendation && (
                     <div className={cn(
                       "mt-4 px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest border",
                       getRecommendationBadge(results.final_recommendation)
                     )}>
                       {results.final_recommendation} Recommendation
                     </div>
                   )}
                </div>
              </div>

              {results.final_report ? (
                <div className="mt-10 p-6 rounded-2xl bg-orange-50 border border-orange-100 relative shadow-sm">
                  <Award className="absolute -top-3 -left-3 w-8 h-8 text-primary bg-white border border-orange-100 shadow-md rounded-full p-1.5" />
                  <h3 className="text-[10px] font-bold text-primary uppercase tracking-[0.2em] mb-3">AI Executive Summary</h3>
                  <p className="text-stone-700 leading-relaxed italic font-medium">"{results.final_report}"</p>
                </div>
              ) : (
                <div className="mt-10 p-6 rounded-2xl bg-amber-50 border border-amber-100 flex items-start gap-4 shadow-sm">
                  <AlertCircle className="w-5 h-5 text-amber-600 mt-1" />
                  <div>
                    <p className="text-amber-600 font-bold text-sm">Evaluation Pending</p>
                    <p className="text-xs text-stone-500 mt-1 italic font-medium">The final report is still being generated by the AI agent.</p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Transcript Section */}
          <div className="space-y-6">
            <h3 className="text-xl font-bold text-stone-900 flex items-center gap-3 pl-2">
               <MessageSquare className="w-5 h-5 text-primary" />
               Interview Transcript & Intelligence
            </h3>
            
            {results.questions_and_answers?.map((qa, index) => (
              <Card key={index} className="bg-white border-stone-100 group hover:border-primary/20 transition-all shadow-sm">
                <CardContent className="p-8">
                  <div className="flex flex-col md:flex-row justify-between gap-6 mb-8">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-3">
                        <span className="w-8 h-8 bg-stone-50 border border-stone-100 rounded-lg flex items-center justify-center text-xs font-bold text-stone-400 group-hover:text-primary transition-colors">
                          {index + 1}
                        </span>
                        <span className="text-[10px] font-bold text-stone-400 uppercase tracking-widest px-2 py-1 bg-stone-50 border border-stone-100 rounded">
                          {qa.question_type} {qa.skill && `• ${qa.skill}`}
                        </span>
                      </div>
                      <p className="text-lg font-bold text-stone-700 italic leading-relaxed">
                        "{qa.question_text}"
                      </p>
                    </div>

                    {qa.correctness_score !== null && (
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:min-w-[320px]">
                        {[
                          { label: 'Correctness', val: qa.correctness_score },
                          { label: 'Depth', val: qa.depth_score },
                          { label: 'Clarity', val: qa.clarity_score },
                          { label: 'Relevance', val: qa.relevance_score }
                        ].map(m => (
                          <div key={m.label} className="text-center p-2 rounded-xl bg-stone-50/50 border border-stone-100 shadow-sm">
                             <p className={cn("text-lg font-bold", getScoreColor(m.val))}>{(m.val * 2).toFixed(0)}</p>
                             <p className="text-[8px] text-stone-400 font-bold uppercase tracking-tighter">{m.label}</p>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {qa.answer_transcript && (
                    <div className="p-5 rounded-2xl bg-stone-50 border border-stone-100 overflow-hidden relative shadow-inner">
                      <div className="absolute top-0 left-0 w-1 h-full bg-primary/20" />
                      <p className="text-[10px] font-bold text-stone-400 uppercase tracking-widest mb-2">Candidate Output</p>
                      <p className="text-sm text-stone-600 leading-relaxed font-sans font-medium">{qa.answer_transcript}</p>
                    </div>
                  )}

                  {qa.comment && (
                    <div className="mt-4 flex items-start gap-3 px-2">
                       <BarChart className="w-4 h-4 text-primary mt-0.5" />
                       <p className="text-xs text-stone-500 leading-relaxed italic font-medium">{qa.comment}</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Right Column: Profile & Metadata */}
        <div className="space-y-8">
           <Card className="bg-white border-stone-100 shadow-sm">
              <CardContent className="p-8">
                 <h3 className="text-lg font-bold text-stone-900 mb-6 flex items-center gap-2">
                    <User className="w-5 h-5 text-primary" />
                    Resume Insights
                 </h3>
                 <div className="space-y-8">
                    <div>
                       <p className="text-[10px] font-bold text-stone-400 uppercase tracking-widest mb-3">Extracted Skills</p>
                       <div className="flex flex-wrap gap-2">
                          {results.resume_summary?.skills?.map((skill, i) => (
                            <span key={i} className="px-3 py-1 bg-stone-50 text-stone-600 text-[10px] font-bold rounded-lg border border-stone-100 shadow-sm">
                               {skill}
                            </span>
                          ))}
                       </div>
                    </div>
                    <div>
                       <p className="text-[10px] font-bold text-stone-400 uppercase tracking-widest mb-1">Experience Level</p>
                       <p className="text-2xl font-bold text-stone-900">
                          {results.resume_summary?.experience_years || '0'} Years
                       </p>
                    </div>
                    <div className="pt-6 border-t border-stone-100">
                       <Button 
                         variant="outline" 
                         className="w-full border-stone-200 hover:bg-stone-50 text-stone-600 font-bold"
                         onClick={async () => {
                            try {
                              const response = await jobService.downloadResume(results.candidate_id)
                              const url = window.URL.createObjectURL(new Blob([response.data]))
                              const link = document.createElement('a')
                              link.href = url
                              link.setAttribute('download', `${results.candidate_name}_resume.pdf`)
                              link.click()
                              toast.success('Downloading original resume...')
                            } catch (e) {
                              toast.error('Failed to download resume.')
                            }
                         }}
                        >
                          <Download className="mr-2 w-4 h-4" />
                          View Full Resume
                       </Button>
                    </div>
                 </div>
              </CardContent>
           </Card>

           <Card className="bg-gradient-to-br from-orange-50 to-transparent border-orange-100 shadow-sm">
              <CardContent className="p-8">
                 <h3 className="text-lg font-bold text-stone-900 mb-4">Recruiter Checklist</h3>
                 <ul className="space-y-4">
                    {[
                      'Review the full video session',
                      'Analyze AI correctness scores',
                      'Verify experience claims',
                      'Move to next hiring stage'
                    ].map((item, i) => (
                      <li key={i} className="flex items-center gap-3">
                         <div className="w-5 h-5 rounded-full border border-primary/20 flex items-center justify-center bg-white">
                            <span className="w-2 h-2 bg-primary rounded-full shadow-sm" />
                         </div>
                         <span className="text-sm text-stone-500 font-medium">{item}</span>
                      </li>
                    ))}
                 </ul>
              </CardContent>
           </Card>
        </div>
      </div>
    </div>
  )
}

export default InterviewResults
