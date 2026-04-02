import { Card, CardContent } from '../ui/Card'
import { Button } from '../ui/Button'
import { CheckCircle, Home, FileText, Star, Trophy } from 'lucide-react'
import { Link } from 'react-router-dom'

const InterviewComplete = () => {
  return (
    <div className="animate-reveal-up max-w-2xl mx-auto py-16 px-6">
      <Card className="border-stone-200 bg-white shadow-xl shadow-stone-200/40 overflow-hidden relative">
        <div className="absolute top-0 inset-x-0 h-2 bg-gradient-primary" />
        <CardContent className="pt-16 pb-12 px-10 text-center">
          <div className="w-24 h-24 bg-emerald-50 rounded-full flex items-center justify-center mx-auto mb-8 ring-8 ring-emerald-50/50">
            <Trophy className="w-12 h-12 text-emerald-500" />
          </div>
          
          <h1 className="text-4xl font-display font-bold text-stone-900 mb-4">Interview Completed!</h1>
          <p className="text-stone-500 text-lg mb-10 font-medium">
            Great job! Your responses and video session have been successfully recorded and submitted for evaluation.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-12">
            <div className="p-4 rounded-2xl bg-stone-50 border border-stone-100 text-left shadow-sm">
              <div className="p-2 h-fit w-fit rounded-lg bg-primary/5 text-primary border border-primary/10 mb-3">
                <Star className="w-4 h-4" />
              </div>
              <p className="text-stone-900 font-bold text-sm">Next Steps</p>
              <p className="text-xs text-stone-500 mt-1 font-medium">HR will review your technical and behavioral assessment results.</p>
            </div>
            <div className="p-4 rounded-2xl bg-stone-50 border border-stone-100 text-left shadow-sm">
              <div className="p-2 h-fit w-fit rounded-lg bg-primary/5 text-primary border border-primary/10 mb-3">
                <FileText className="w-4 h-4" />
              </div>
              <p className="text-stone-900 font-bold text-sm">Review Timeline</p>
              <p className="text-xs text-stone-500 mt-1 font-medium">Expect feedback within 3-5 business days via your registered email.</p>
            </div>
          </div>

          <div className="space-y-4">
            <Link to="/">
              <Button variant="premium" size="xl" className="w-full shadow-lg shadow-primary/20 hover:scale-[1.02] transition-transform">
                <Home className="mr-3 w-6 h-6" />
                Return to Homepage
              </Button>
            </Link>
          </div>
          
          <p className="mt-10 text-xs text-stone-400 italic font-medium">
            Thank you for using InterviewAI. Good luck with your application!
          </p>
        </CardContent>
      </Card>
    </div>
  )
}

export default InterviewComplete
