import { Card, CardContent } from '../ui/Card'
import { Button } from '../ui/Button'
import { User, Users } from 'lucide-react'
import { cn } from '../../lib/utils'

const InterviewerSelection = ({ onSelect, selectedInterviewer }) => {
  const interviewers = [
    {
      id: 'aarush',
      name: 'Dr. Aarush',
      role: 'Senior Technical Lead',
      description: 'Expert in Algorithms and System Design. Focuses on deep technical understanding.',
      avatar: '👨‍💼',
      color: 'from-blue-500/20 to-cyan-500/20',
      border: 'hover:border-blue-500/50'
    },
    {
      id: 'aarushi',
      name: 'Ms. Aarushi',
      role: 'Product & Culture Specialist',
      description: 'Expert in Frontend, UX and Behavioral traits. Values creativity and problem-solving.',
      avatar: '👩‍💼',
      color: 'from-purple-500/20 to-pink-500/20',
      border: 'hover:border-purple-500/50'
    }
  ]

  return (
    <div className="animate-reveal-up max-w-4xl mx-auto py-12">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-display font-bold text-white mb-4">Choose Your Interviewer</h1>
        <p className="text-slate-400 text-lg">Select the AI persona that will conduct your technical assessment</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {interviewers.map((interviewer) => (
          <Card 
            key={interviewer.id}
            onClick={() => onSelect(interviewer.id)}
            className={cn(
              "relative cursor-pointer transition-all duration-300 border-white/5 overflow-hidden group",
              interviewer.border,
              selectedInterviewer === interviewer.id && "border-primary/50 ring-2 ring-primary/20 scale-[1.02]"
            )}
          >
            <CardContent className="p-0">
              <div className={cn("h-32 w-full bg-gradient-to-br", interviewer.color)}>
                <div className="h-full w-full flex items-center justify-center text-6xl">
                  {interviewer.avatar}
                </div>
              </div>
              <div className="p-8">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-2xl font-bold text-white">{interviewer.name}</h3>
                    <p className="text-primary-light font-medium">{interviewer.role}</p>
                  </div>
                  {selectedInterviewer === interviewer.id && (
                    <div className="bg-primary/20 text-primary-light p-2 rounded-full">
                      <User className="w-5 h-5" />
                    </div>
                  )}
                </div>
                <p className="text-slate-400 leading-relaxed mb-6">
                  {interviewer.description}
                </p>
                <Button 
                  variant={selectedInterviewer === interviewer.id ? "premium" : "outline"}
                  className="w-full"
                >
                  {selectedInterviewer === interviewer.id ? "Selected" : "Select Interviewer"}
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="mt-12 text-center">
        <Button 
          disabled={!selectedInterviewer}
          onClick={() => onSelect(selectedInterviewer, true)}
          size="xl"
          variant="premium"
          className="px-16"
        >
          Confirm & Continue
          <ArrowRight className="ml-3 w-6 h-6" />
        </Button>
      </div>
    </div>
  )
}

import { ArrowRight } from 'lucide-react'
export default InterviewerSelection
