import { useRef, useEffect } from 'react'
import AudioVisualizer from '../AudioVisualizer'
import CodeEditor from '../CodeEditor'
import { Card, CardContent } from '../ui/Card'
import { Button } from '../ui/Button'
import { Mic, CheckCircle, Video, Terminal, MessageSquare, AlertCircle } from 'lucide-react'
import { cn } from '../../lib/utils'

const InterviewActive = ({ 
  stream, 
  avatarState, 
  status, 
  subtitle, 
  isRecording, 
  onDone, 
  onEnd,
  showCodeEditor,
  recordingStatus,
  showRecordingAlert
}) => {
  const videoRef = useRef(null)

  useEffect(() => {
    if (videoRef.current && stream) {
      videoRef.current.srcObject = stream
      videoRef.current.play().catch(e => console.error('Video playing error:', e))
    }
  }, [stream])

  return (
    <div className="flex flex-col h-[calc(100vh-100px)] animate-reveal-up max-w-[1600px] mx-auto w-full">
      {/* Top Bar - Status & Recording */}
      <div className="flex items-center justify-between mb-6 px-4">
        <div className="flex items-center gap-4">
          <div className="bg-white border border-stone-200 shadow-sm px-4 py-2 rounded-xl flex items-center gap-3">
            <div className={cn(
              "w-2 h-2 rounded-full",
              isRecording ? "bg-red-500 animate-pulse" : "bg-green-500"
            )} />
            <span className="text-stone-900 text-sm font-bold uppercase tracking-wider">{status}</span>
          </div>
          {recordingStatus && showRecordingAlert && (
            <div className="animate-in fade-in slide-in-from-left duration-300 bg-red-50 border border-red-200 px-4 py-2 rounded-xl flex items-center gap-2 text-red-600 text-xs font-bold shadow-sm">
              <Video className="w-4 h-4 animate-pulse" />
              {recordingStatus}
            </div>
          )}
        </div>

        <Button 
          variant="destructive" 
          size="sm" 
          onClick={onEnd}
          className="border border-red-100 bg-red-50 text-red-600 hover:bg-red-600 hover:text-white hover:border-red-600 transition-all font-bold px-6 shadow-sm"
        >
          End Interview
        </Button>
      </div>

      {/* Main Content Area */}
      <div className={cn(
        "grid gap-6 flex-1 min-h-0",
        showCodeEditor ? "grid-cols-1 lg:grid-cols-2" : "grid-cols-1"
      )}>
        {/* Left Side - Avatar & Video */}
        <div className="flex flex-col gap-6 min-h-0">
          <Card className="flex-1 bg-white border-stone-200 overflow-hidden flex flex-col relative shadow-xl shadow-stone-200/40">
            <CardContent className="p-0 flex-1 flex flex-col items-center justify-center relative">
              {/* Interviewer Avatar */}
              <div className="absolute inset-x-0 top-0 h-full flex flex-col items-center justify-center">
                 <AudioVisualizer state={avatarState} className="w-[300px] h-[300px] scale-125" />
              </div>

              {/* Subtitles Overlay */}
              <div className="absolute bottom-0 inset-x-0 p-8 bg-gradient-to-t from-white/95 via-white/80 to-transparent backdrop-blur-sm">
                <div className="max-w-2xl mx-auto flex gap-4">
                  <div className="mt-1 p-2 h-fit rounded-lg bg-primary/10 text-primary border border-primary/20 bg-white">
                    <MessageSquare className="w-5 h-5" />
                  </div>
                  <p className="text-xl md:text-2xl font-bold text-stone-800 leading-relaxed drop-shadow-sm italic">
                    {subtitle || "..."}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Controls Bar */}
          <Card className="bg-white border-stone-200 shadow-xl shadow-stone-200/40">
            <CardContent className="p-4 flex items-center justify-between gap-6">
               <div className="flex items-center gap-4 flex-1">
                 {/* Video Preview Small */}
                 <div className="w-32 aspect-video bg-stone-900 rounded-xl overflow-hidden border border-stone-200 ring-2 ring-stone-100 relative shadow-inner">
                   <video ref={videoRef} autoPlay muted playsInline className="w-full h-full object-cover mirror" />
                   <div className="absolute top-1 right-1">
                      <div className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
                   </div>
                 </div>

                 {/* Wave visualizer placeholder */}
                 <div className="flex-1 h-12 flex items-center justify-center gap-1">
                    {Array.from({length: 20}).map((_, i) => (
                      <div 
                        key={i} 
                        className={cn(
                          "w-1 bg-primary/50 rounded-full transition-all duration-300",
                          isRecording ? "h-6 animate-pulse" : "h-2"
                        )}
                        style={{ animationDelay: `${i * 0.05}s` }}
                      />
                    ))}
                 </div>
               </div>

               <Button 
                 onClick={onDone}
                 variant="premium"
                 size="xl"
                 className={cn(
                   "px-10 h-16 text-xl rounded-2xl group transition-all duration-500 shadow-xl",
                   isRecording ? "scale-105 shadow-primary/20 border-primary" : "opacity-50 grayscale scale-95"
                 )}
               >
                 <Mic className={cn("mr-3 w-6 h-6", isRecording && "animate-pulse")} />
                 {isRecording ? "Done Speaking" : "Interviewer Speaking"}
                 <CheckCircle className="ml-3 w-6 h-6 group-hover:scale-110 transition-transform" />
               </Button>
            </CardContent>
          </Card>
        </div>

        {/* Right Side - Code Editor (Conditional) */}
        {showCodeEditor && (
          <div className="flex flex-col h-full min-h-0 animate-in slide-in-from-right duration-500">
             <Card className="flex-1 border-stone-200 bg-[#1e1e1e] overflow-hidden flex flex-col shadow-xl shadow-stone-200/40">
               <CardContent className="p-0 flex-1 flex flex-col h-full min-h-0">
                  <div className="p-3 border-b border-stone-700 flex items-center gap-3 bg-black/40">
                    <Terminal className="w-4 h-4 text-primary" />
                    <span className="text-xs font-bold text-stone-400 uppercase tracking-widest">Collaborative Code Editor</span>
                  </div>
                  <div className="flex-1 min-h-0">
                    <CodeEditor />
                  </div>
               </CardContent>
             </Card>
             <div className="mt-4 p-4 rounded-xl bg-primary/5 border border-primary/20 flex items-start gap-3 shadow-sm bg-white">
               <AlertCircle className="w-5 h-5 text-primary flex-shrink-0" />
               <p className="text-xs text-stone-600 italic font-medium">
                 Explain your logic as you code. The interviewer can see your keystrokes in real-time.
               </p>
             </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default InterviewActive
