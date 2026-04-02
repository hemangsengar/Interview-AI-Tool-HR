import { Link, useParams } from 'react-router-dom'
import { Button } from '../components/ui/Button'
import { CheckCircle, ArrowRight, Share2, Globe } from 'lucide-react'
import { Card, CardContent } from '../components/ui/Card'
import { toast } from 'sonner'

const InterviewSuccess = () => {
  const { sessionId } = useParams()

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.origin)
    toast.success('Platform link copied to clipboard!')
  }

  return (
    <div className="min-h-screen bg-stone-50 flex flex-col items-center justify-center p-6 text-center font-sans overflow-hidden">
      {/* Background patterns */}
      <div className="absolute inset-0 bg-gradient-mesh opacity-40" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[60rem] h-[60rem] bg-orange-100 rounded-full blur-[160px]" />
      
      <div className="relative z-10 w-full max-w-2xl animate-reveal-up">
        {/* Success Icon Animation container */}
        <div className="mb-12 relative flex justify-center">
           <div className="absolute inset-0 bg-emerald-100 rounded-full blur-3xl animate-pulse" />
           <div className="relative w-24 h-24 bg-emerald-50 rounded-full flex items-center justify-center ring-8 ring-emerald-50/50 shadow-sm border border-emerald-100">
              <CheckCircle className="w-12 h-12 text-emerald-500" />
           </div>
        </div>

        <h1 className="text-5xl font-display font-black text-stone-900 mb-6">Congratulations!</h1>
        <p className="text-xl text-stone-500 font-medium mb-12 max-w-lg mx-auto leading-relaxed">
          Your interview has been successfully completed and submitted. Our AI engine is currently processing your performance metrics and recruiter ready insights.
        </p>

        <Card className="bg-white border-stone-200 shadow-xl shadow-stone-200/40 mb-12 overflow-hidden">
           <CardContent className="p-10">
              <div className="flex flex-col md:flex-row items-center gap-8 text-left">
                 <div className="w-16 h-16 bg-gradient-primary rounded-2xl flex items-center justify-center text-3xl font-bold border border-white shadow-lg shadow-primary/20">
                    AI
                 </div>
                 <div className="flex-1">
                    <h3 className="text-xl font-bold text-stone-900 mb-2">Next Steps</h3>
                    <p className="text-sm text-stone-500 leading-relaxed font-medium capitalize">
                       The hiring team has been notified. You will receive an email update once they have reviewed the AI-generated evaluation report.
                    </p>
                 </div>
              </div>
           </CardContent>
        </Card>

        <div className="flex flex-col sm:flex-row gap-6 justify-center">
          <Link to="/">
            <Button variant="premium" size="xl" className="px-12 h-16 shadow-lg shadow-primary/20 hover:scale-[1.02] transition-transform">
              Return Home
              <ArrowRight className="ml-3 w-6 h-6" />
            </Button>
          </Link>
          <Button 
            onClick={handleShare}
            variant="outline" 
            size="xl" 
            className="px-10 h-16 border-stone-200 hover:bg-stone-50 text-stone-700 bg-white font-bold shadow-sm hover:scale-[1.02] transition-transform"
          >
            <Share2 className="mr-3 w-5 h-5" />
            Share Platform
          </Button>
        </div>

        {/* Footer Area - Creator plug */}
        <div className="mt-24 pt-12 border-t border-stone-100 flex flex-col items-center">
           <p className="text-[10px] font-bold text-stone-400 uppercase tracking-[0.2em] mb-6 px-4 py-1.5 rounded-full border border-stone-100 bg-white shadow-sm">
              Powered by GenAI Hiring Engine
           </p>
           <div className="flex gap-4">
              <a href="https://github.com/hemangsengar" target="_blank" rel="noreferrer" className="text-stone-500 hover:text-primary transition-colors font-bold text-sm flex items-center gap-2">
                <Globe className="w-4 h-4" /> GitHub
              </a>
              <a href="https://linkedin.com/in/hemangsengar" target="_blank" rel="noreferrer" className="text-stone-500 hover:text-primary transition-colors font-bold text-sm flex items-center gap-2">
                LinkedIn
              </a>
           </div>
        </div>
      </div>
    </div>
  )
}

export default InterviewSuccess
