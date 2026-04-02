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
      color: 'from-blue-50 to-cyan-50',
      border: 'hover:border-blue-200'
    },
    {
      id: 'aarushi',
      name: 'Ms. Aarushi',
      role: 'Product & Culture Specialist',
      description: 'Expert in Frontend, UX and Behavioral traits. Values creativity and problem-solving.',
      avatar: '👩‍💼',
      color: 'from-purple-50 to-pink-50',
      border: 'hover:border-purple-200'
    }
  ]

  return (
    <div className="animate-reveal-up max-w-4xl mx-auto py-12">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-display font-bold text-stone-900 mb-4">Choose Your Interviewer</h1>
        <p className="text-stone-500 text-lg font-medium">Select the AI persona that will conduct your technical assessment</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {interviewers.map((interviewer) => (
          <Card 
            key={interviewer.id}
            onClick={() => onSelect(interviewer.id)}
            className={cn(
              "relative cursor-pointer transition-all duration-500 border-stone-200 overflow-hidden group bg-white shadow-sm",
              interviewer.border,
              selectedInterviewer === interviewer.id && "border-primary ring-4 ring-primary/10 scale-[1.03] shadow-xl shadow-primary/5"
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
                    <h3 className="text-2xl font-bold text-stone-900">{interviewer.name}</h3>
                    <p className="text-primary font-bold tracking-tight">{interviewer.role}</p>
                  </div>
                  {selectedInterviewer === interviewer.id && (
                    <div className="bg-primary text-white p-2 rounded-full shadow-lg">
                      <User className="w-5 h-5" />
                    </div>
                  )}
                </div>
                <p className="text-stone-500 leading-relaxed mb-6 font-medium">
                  {interviewer.description}
                </p>
                <Button 
                  variant={selectedInterviewer === interviewer.id ? "premium" : "outline"}
                  className={cn("w-full h-12 shadow-sm font-bold", selectedInterviewer === interviewer.id ? "shadow-primary/20" : "border-stone-200")}
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
