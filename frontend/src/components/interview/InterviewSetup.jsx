import { useRef, useEffect } from 'react'
import { Card, CardContent } from '../ui/Card'
import { Button } from '../ui/Button'
import { Camera, Mic, Info, Play, ShieldCheck, AlertCircle } from 'lucide-react'
import { cn } from '../../lib/utils'

const InterviewSetup = ({ stream, isReady, error, onStart, requestPermissions }) => {
  const videoRef = useRef(null)

  useEffect(() => {
    if (videoRef.current && stream) {
      videoRef.current.srcObject = stream
      videoRef.current.play().catch(e => console.error('Video preview error:', e))
    }
  }, [stream])

  return (
    <div className="animate-reveal-up max-w-5xl mx-auto py-12 px-6">
      <div className="text-center mb-10">
        <h1 className="text-4xl font-display font-bold text-stone-900 mb-4">Technical Readiness Check</h1>
        <p className="text-stone-500 text-lg font-medium">Ensure your camera and microphone are working for the best experience</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        {/* Video Preview */}
        <div className="lg:col-span-2 space-y-6">
          <Card className="border-stone-200 overflow-hidden aspect-video bg-stone-900 relative shadow-2xl">
            <video 
              ref={videoRef}
              autoPlay
              muted
              playsInline
              className="w-full h-full object-cover mirror"
            />
            {!isReady && !error && (
              <div className="absolute inset-0 flex flex-col items-center justify-center bg-stone-50/90 backdrop-blur-sm">
                <Camera className="w-16 h-16 text-stone-300 mb-4 animate-pulse" />
                <p className="text-stone-600 font-bold">Waiting for camera access...</p>
                <Button 
                  onClick={requestPermissions}
                  variant="outline"
                  className="mt-6 border-stone-200"
                >
                  Enable Permissions
                </Button>
              </div>
            )}
            {error && (
              <div className="absolute inset-0 flex flex-col items-center justify-center bg-red-50/95 backdrop-blur-md px-10 text-center">
                <AlertCircle className="w-16 h-16 text-red-500 mb-4" />
                <h3 className="text-xl font-bold text-red-900 mb-2">Permissions Blocked</h3>
                <p className="text-red-600/70 mb-6 font-medium">{error}</p>
                <Button 
                  onClick={requestPermissions}
                  variant="destructive"
                  className="shadow-lg shadow-red-200"
                >
                  Try Again
                </Button>
              </div>
            )}
            {isReady && (
              <div className="absolute top-4 right-4 bg-green-500/20 text-green-400 px-3 py-1 rounded-full text-xs font-bold flex items-center gap-2 border border-green-500/30 backdrop-blur-md">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                System Ready
              </div>
            )}
          </Card>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-4 rounded-2xl bg-white border border-stone-200 flex items-center gap-4 shadow-sm">
              <div className={cn(
                "p-3 rounded-xl",
                isReady ? "bg-emerald-50 text-emerald-600 border border-emerald-100" : "bg-stone-50 text-stone-300 border border-stone-100"
              )}>
                <Camera className="w-6 h-6" />
              </div>
              <div>
                <p className="text-stone-900 font-bold text-sm">Visual Check</p>
                <p className="text-xs text-stone-500 font-medium">{isReady ? "Camera active" : "Checking camera..."}</p>
              </div>
            </div>
            <div className="p-4 rounded-2xl bg-white border border-stone-200 flex items-center gap-4 shadow-sm">
              <div className={cn(
                "p-3 rounded-xl",
                isReady ? "bg-emerald-50 text-emerald-600 border border-emerald-100" : "bg-stone-50 text-stone-300 border border-stone-100"
              )}>
                <Mic className="w-6 h-6" />
              </div>
              <div>
                <p className="text-stone-900 font-bold text-sm">Audio Check</p>
                <p className="text-xs text-stone-500 font-medium">{isReady ? "Microphone active" : "Checking microphone..."}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Sidebar - Instructions */}
        <div className="space-y-6">
          <Card className="border-stone-200 bg-white shadow-xl shadow-stone-200/40">
            <CardContent className="p-8">
              <h3 className="text-xl font-bold text-stone-900 mb-6 flex items-center gap-3">
                <Info className="w-5 h-5 text-primary" />
                Interview Guidelines
              </h3>
              <ul className="space-y-6">
                {[
                  { icon: ShieldCheck, text: "Ensure your face is clearly visible in the frame.", title: "Visual Recognition" },
                  { icon: Mic, text: "Speak clearly and wait for the interviewer to finish talking.", title: "Voice Interaction" },
                  { icon: AlertCircle, text: "The interview will take about 15-20 mins. Stay focused.", title: "Session Length" }
                ].map((item, i) => (
                  <li key={i} className="flex gap-4">
                    <div className="p-2 h-fit rounded-lg bg-primary/5 text-primary border border-primary/10">
                      <item.icon className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="text-stone-900 font-bold text-sm">{item.title}</p>
                      <p className="text-xs text-stone-400 leading-relaxed mt-1 font-medium">{item.text}</p>
                    </div>
                  </li>
                ))}
              </ul>

              <div className="mt-10 pt-8 border-t border-stone-100">
                <Button 
                  onClick={onStart}
                  disabled={!isReady}
                  size="xl"
                  variant="premium"
                  className="w-full flex items-center gap-3 group shadow-lg shadow-primary/20 h-16 text-lg font-bold"
                >
                  <Play className="w-6 h-6 group-hover:scale-110 transition-transform fill-current" />
                  Start My Interview
                </Button>
                <p className="text-[10px] text-stone-400 text-center mt-4 uppercase tracking-[0.2em] font-bold">
                  By starting, you agree to video recording for evaluation
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

export default InterviewSetup
