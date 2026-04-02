import { useState, useEffect, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useUserMedia } from '../hooks/useUserMedia'
import { useInterviewRecorder } from '../hooks/useInterviewRecorder'
import { useInterviewSession } from '../hooks/useInterviewSession'
import { interviewService } from '../api/services'
import { toast } from 'sonner'

// Sub-components
import InterviewerSelection from '../components/interview/InterviewerSelection'
import InterviewSetup from '../components/interview/InterviewSetup'
import InterviewActive from '../components/interview/InterviewActive'
import InterviewComplete from '../components/interview/InterviewComplete'

const InterviewRoom = () => {
  const { sessionId } = useParams()
  const navigate = useNavigate()

  // State for flow management
  const [showInterviewerSelection, setShowInterviewerSelection] = useState(true)
  const [selectedInterviewer, setSelectedInterviewer] = useState(null)
  
  // Custom Hooks
  const { stream, isReady, error: mediaError, requestPermissions, stopStream } = useUserMedia()
  const { 
    avatarState, setAvatarState, subtitle, setSubtitle, status, setStatus,
    interviewStarted, setInterviewStarted, interviewComplete, setInterviewComplete,
    showCodeEditor, getNextQuestion, submitAnswer, startInterview: apiStartInterview, audioRef
  } = useInterviewSession(sessionId)
  
  const { 
    isVideoRecording, isAudioRecording, startVideoRecording, stopAndUploadVideo, 
    startAudioRecording, stopAudioRecording 
  } = useInterviewRecorder(sessionId, stream)

  const currentAudioStreamRef = useRef(null)

  // Initial session recovery
  useEffect(() => {
    const recoverSession = async () => {
      try {
        const response = await interviewService.getSession(sessionId)
        if (response.data.status === 'in_progress') {
          setShowInterviewerSelection(false)
          setInterviewStarted(true)
          // Since it's in progress, we should fetch the first question or wait for user interaction
          // For now, let's just trigger next question logic
          await handleNextQuestion()
        } else if (response.data.status === 'completed') {
          setShowInterviewerSelection(false)
          setInterviewComplete(true)
        }
      } catch (err) {
        console.error('Session recovery failed:', err)
      }
    }
    recoverSession()
  }, [sessionId])

  const handleInterviewerSelect = (id, confirmed = false) => {
    setSelectedInterviewer(id)
    if (confirmed) {
      setShowInterviewerSelection(false)
      requestPermissions()
    }
  }

  const handleStartInterview = async () => {
    try {
      await apiStartInterview(selectedInterviewer)
      startVideoRecording()
      await handleNextQuestion()
    } catch (err) {
      toast.error('Failed to start interview.')
    }
  }

  const handleNextQuestion = async () => {
    const result = await getNextQuestion(async (question) => {
      if (question.audio_url) {
        await playQuestionAudio(question.audio_url)
      } else {
        // Fallback if no audio URL is provided
        startUserResponse()
      }
    })

    if (result.complete) {
      await playGoodbye(result.text)
    }
  }

  const playQuestionAudio = async (url) => {
    setAvatarState('speaking')
    setStatus('Interviewer speaking...')
    
    const baseUrl = (import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000').replace(/\/$/, '')
    const fullUrl = url.startsWith('http') ? url : `${baseUrl}${url.startsWith('/') ? '' : '/'}${url}`
    
    const audio = new Audio(fullUrl)
    audio.onended = () => startUserResponse()
    audio.onerror = () => startUserResponse()
    await audio.play().catch(() => startUserResponse())
  }

  const playGoodbye = async (text) => {
    try {
      const speaker = selectedInterviewer === 'aarushi' ? 'anushka' : 'abhilash'
      const response = await interviewService.generateGreetingAudio(text, speaker)
      const url = URL.createObjectURL(new Blob([response.data], { type: 'audio/wav' }))
      
      const audio = new Audio(url)
      audio.onended = () => {
        URL.revokeObjectURL(url)
        finalizeInterview()
      }
      await audio.play()
    } catch (err) {
      finalizeInterview()
    }
  }

  const startUserResponse = async () => {
    setAvatarState('listening')
    setStatus('Interviewer listening...')
    try {
      const audioStream = await startAudioRecording()
      currentAudioStreamRef.current = audioStream
    } catch (err) {
      console.error('Failed to start audio recording:', err)
    }
  }

  const handleDoneSpeaking = async () => {
    const audioBlob = await stopAudioRecording(currentAudioStreamRef.current)
    if (!audioBlob) {
      toast.warning('Audio too short. Please try again.')
      await startUserResponse()
      return
    }

    try {
      const result = await submitAnswer(audioBlob)
      if (result.spoken_response) {
        await playInterviewerFeedback(result)
      } else {
        await handleNextQuestion()
      }
    } catch (err) {
      toast.error('Submission failed. Retrying...')
      await startUserResponse()
    }
  }

  const playInterviewerFeedback = async (result) => {
    setAvatarState('speaking')
    setSubtitle(result.spoken_response)
    
    if (result.audio_base64) {
      const audioData = atob(result.audio_base64)
      const audioArray = new Uint8Array(audioData.length)
      for (let i = 0; i < audioData.length; i++) audioArray[i] = audioData.charCodeAt(i)
      const url = URL.createObjectURL(new Blob([audioArray], { type: 'audio/wav' }))
      
      audioRef.current.src = url
      audioRef.current.onended = async () => {
        URL.revokeObjectURL(url)
        if (result.next_action === 'end_interview' || result.is_interview_complete) {
          finalizeInterview()
        } else {
          await handleNextAction(result)
        }
      }
      await audioRef.current.play()
    } else {
      // Fallback if no audio feedback
      setTimeout(async () => {
        if (result.next_action === 'end_interview' || result.is_interview_complete) {
          finalizeInterview()
        } else {
          await handleNextAction(result)
        }
      }, 3000)
    }
  }

  const handleNextAction = async (result) => {
    // If result already contains the next question text from conversation API
    if (result.next_question_text) {
      setSubtitle(result.next_question_text)
      if (result.next_question_audio_base64) {
        // Play embedded next question audio
        const audioData = atob(result.next_question_audio_base64)
        const audioArray = new Uint8Array(audioData.length)
        for (let i = 0; i < audioData.length; i++) audioArray[i] = audioData.charCodeAt(i)
        const url = URL.createObjectURL(new Blob([audioArray], { type: 'audio/wav' }))
        
        const audio = new Audio(url)
        audio.onended = () => {
          URL.revokeObjectURL(url)
          setAvatarState('listening')
          setStatus('Your turn to answer')
          startUserResponse()
        }
        setAvatarState('speaking')
        setStatus('Interviewer speaking...')
        await audio.play()
      } else {
        await playQuestionAudio(result.next_question_text) // This might not work if it's text, need specialized handler or fetch from server
        // Better to just fetch next question normally to be safe if embedded audio is missing
        await handleNextQuestion()
      }
    } else {
      await handleNextQuestion()
    }
  }

  const finalizeInterview = async () => {
    setInterviewComplete(true)
    setStatus('Finalizing...')
    await stopAndUploadVideo()
    stopStream()
    toast.success('Interview saved successfully!')
  }

  // --- RENDER LOGIC ---
  if (interviewComplete) return <InterviewComplete />

  if (showInterviewerSelection) {
    return (
      <div className="min-h-screen bg-stone-50 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-mesh opacity-40" />
        <InterviewerSelection 
          selectedInterviewer={selectedInterviewer}
          onSelect={handleInterviewerSelect}
        />
      </div>
    )
  }

  if (!interviewStarted) {
    return (
      <div className="min-h-screen bg-stone-50 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-mesh opacity-40" />
        <InterviewSetup 
          stream={stream}
          isReady={isReady}
          error={mediaError}
          onStart={handleStartInterview}
          requestPermissions={requestPermissions}
        />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-stone-50 relative overflow-hidden p-8 flex flex-col items-center justify-center">
      <div className="absolute inset-0 bg-gradient-mesh opacity-20" />
      <InterviewActive 
        stream={stream}
        avatarState={avatarState}
        status={status}
        subtitle={subtitle}
        isRecording={isAudioRecording}
        onDone={handleDoneSpeaking}
        onEnd={() => {
           if (window.confirm('Are you sure you want to end the interview? Progress will be saved.')) {
             finalizeInterview()
           }
        }}
        showCodeEditor={showCodeEditor}
        recordingStatus={isVideoRecording ? "🔴 Recording Session" : ""}
        showRecordingAlert={isVideoRecording}
      />
    </div>
  )
}

export default InterviewRoom
