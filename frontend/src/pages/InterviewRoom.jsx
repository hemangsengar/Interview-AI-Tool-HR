import { useState, useEffect, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import ProfessionalVideoAvatar from '../components/ProfessionalVideoAvatar'
import CodeEditor from '../components/CodeEditor'
import { interviewService } from '../api/services'

const InterviewRoom = () => {
  const { sessionId } = useParams()
  const navigate = useNavigate()
  
  const [avatarState, setAvatarState] = useState('idle')
  const [subtitle, setSubtitle] = useState('')
  const [status, setStatus] = useState('Not Started')
  const [currentQuestion, setCurrentQuestion] = useState(null)
  const [isRecording, setIsRecording] = useState(false)
  const [interviewStarted, setInterviewStarted] = useState(false)
  const [interviewComplete, setInterviewComplete] = useState(false)
  const [error, setError] = useState('')
  const [showEndConfirm, setShowEndConfirm] = useState(false)
  const [videoStream, setVideoStream] = useState(null)
  const [showCodeEditor, setShowCodeEditor] = useState(false)
  const [recordingStatus, setRecordingStatus] = useState('')
  const [showRecordingAlert, setShowRecordingAlert] = useState(false)
  const [isVideoRecording, setIsVideoRecording] = useState(false)
  const [showInterviewerSelection, setShowInterviewerSelection] = useState(true)
  const [selectedInterviewer, setSelectedInterviewer] = useState(null) // 'aarush' or 'aarushi'
  
  const mediaRecorderRef = useRef(null)
  const audioChunksRef = useRef([])
  const audioRef = useRef(new Audio())
  const transcriptChunksRef = useRef([]) // Store transcripts from each chunk
  const recordingStartTimeRef = useRef(null) // Track when recording started
  const audioContextRef = useRef(null) // For WAV conversion
  const mediaStreamRef = useRef(null) // Store media stream
  const videoRef = useRef(null) // For welcome screen preview
  const interviewVideoRef = useRef(null) // For interview screen
  const videoRecorderRef = useRef(null)
  const videoChunksRef = useRef([])
  const recordedVideoBlob = useRef(null)

  useEffect(() => {
    // Request microphone and camera permission on mount
    const initMedia = async () => {
      try {
        console.log('Requesting camera and microphone access...')
        const stream = await navigator.mediaDevices.getUserMedia({ 
          audio: true, 
          video: {
            width: { ideal: 1280, min: 640 },
            height: { ideal: 720, min: 480 },
            facingMode: 'user'
          }
        })
        console.log('Media stream obtained:', stream.id)
        console.log('Video tracks:', stream.getVideoTracks().length)
        
        setVideoStream(stream)
        
        // Set video stream immediately and after delay
        if (videoRef.current) {
          console.log('Setting video srcObject')
          videoRef.current.srcObject = stream
          videoRef.current.onloadedmetadata = () => {
            console.log('Video metadata loaded')
            videoRef.current.play()
              .then(() => console.log('Video playing'))
              .catch(e => console.error('Video play error:', e))
          }
        }
        
        // Also try after delay
        setTimeout(() => {
          if (videoRef.current && stream) {
            console.log('Setting video srcObject (delayed)')
            videoRef.current.srcObject = stream
            videoRef.current.play().catch(e => console.log('Video play error (delayed):', e))
          }
        }, 500)
      } catch (err) {
        console.error('Media error:', err)
        setError('Camera/Microphone access denied. Please enable them for an authentic interview experience.')
      }
    }
    initMedia()

    return () => {
      // Cleanup video stream on unmount
      if (videoStream) {
        videoStream.getTracks().forEach(track => track.stop())
      }
    }
  }, [])
  
  // Cleanup on interview complete
  useEffect(() => {
    if (interviewComplete && videoStream) {
      videoStream.getTracks().forEach(track => track.stop())
      setVideoStream(null)
      if (videoRef.current) {
        videoRef.current.srcObject = null
      }
      if (interviewVideoRef.current) {
        interviewVideoRef.current.srcObject = null
      }
    }
  }, [interviewComplete, videoStream])

  useEffect(() => {
    if (videoRef.current && videoStream) {
      console.log('Video ref and stream available, setting srcObject')
      videoRef.current.srcObject = videoStream
      videoRef.current.onloadedmetadata = () => {
        console.log('Video metadata loaded in effect')
        videoRef.current.play()
          .then(() => console.log('Video playing in effect'))
          .catch(e => console.error('Video play error in effect:', e))
      }
    }
  }, [videoStream])
  
  // Set stream on interview video when interview starts
  useEffect(() => {
    if (interviewStarted && interviewVideoRef.current && videoStream) {
      console.log('Setting stream on interview video')
      interviewVideoRef.current.srcObject = videoStream
      interviewVideoRef.current.play()
        .then(() => console.log('Interview video playing'))
        .catch(e => console.error('Interview video play error:', e))
    }
  }, [interviewStarted, videoStream])

  // SIMPLIFIED VIDEO RECORDING - Start
  const startVideoRecording = () => {
    console.log('🎬 START VIDEO RECORDING CALLED')
    console.log('Video stream exists:', !!videoStream)
    console.log('Session ID:', sessionId)
    
    if (!videoStream) {
      console.error('❌ NO VIDEO STREAM - Cannot start recording')
      return false
    }
    
    console.log('✅ Video stream available, creating recorder...')
    
    try {
      // Simple options - use browser default if needed
      let options = { videoBitsPerSecond: 250000, audioBitsPerSecond: 64000 }
      
      // Try to use webm
      if (MediaRecorder.isTypeSupported('video/webm')) {
        options.mimeType = 'video/webm'
        console.log('✅ Using video/webm')
      } else {
        console.log('⚠️ Using browser default codec')
      }
      
      const recorder = new MediaRecorder(videoStream, options)
      videoChunksRef.current = []
      
      recorder.ondataavailable = (e) => {
        if (e.data && e.data.size > 0) {
          videoChunksRef.current.push(e.data)
          console.log(`📹 Chunk ${videoChunksRef.current.length}: ${e.data.size} bytes`)
        }
      }
      
      recorder.onstop = () => {
        console.log('⏹️ RECORDER STOPPED')
        console.log(`Total chunks: ${videoChunksRef.current.length}`)
        
        if (videoChunksRef.current.length > 0) {
          const blob = new Blob(videoChunksRef.current, { type: 'video/webm' })
          recordedVideoBlob.current = blob
          console.log(`✅ VIDEO BLOB CREATED: ${(blob.size / 1024 / 1024).toFixed(2)} MB`)
        } else {
          console.error('❌ NO CHUNKS COLLECTED')
        }
      }
      
      recorder.onerror = (e) => {
        console.error('❌ RECORDER ERROR:', e)
      }
      
      recorder.start(1000) // Collect data every second
      videoRecorderRef.current = recorder
      setIsVideoRecording(true)
      
      console.log('✅ RECORDING STARTED - State:', recorder.state)
      
      // Show alert
      setRecordingStatus('🔴 Video Recording in Progress')
      setShowRecordingAlert(true)
      setTimeout(() => setShowRecordingAlert(false), 5000)
      
      return true
    } catch (err) {
      console.error('❌ START RECORDING ERROR:', err)
      return false
    }
  }
  
  // SIMPLIFIED VIDEO RECORDING - Stop and Upload
  const stopAndUploadVideo = async () => {
    console.log('🛑 STOPPING VIDEO RECORDING')
    console.log('Recorder exists:', !!videoRecorderRef.current)
    console.log('Recorder state:', videoRecorderRef.current?.state)
    console.log('Chunks collected so far:', videoChunksRef.current.length)
    
    if (!videoRecorderRef.current) {
      console.error('❌ NO RECORDER FOUND - Recording never started!')
      return false
    }
    
    if (videoRecorderRef.current.state === 'inactive') {
      console.log('⚠️ Recorder already stopped')
      // Try to upload anyway if we have chunks
      if (videoChunksRef.current.length > 0) {
        console.log('⚠️ But we have chunks, creating blob manually...')
        const blob = new Blob(videoChunksRef.current, { type: 'video/webm' })
        recordedVideoBlob.current = blob
        console.log(`✅ Manual blob created: ${(blob.size / 1024 / 1024).toFixed(2)} MB`)
      } else {
        console.error('❌ No chunks to upload')
        return false
      }
    } else {
      // Stop the recorder
      console.log('Stopping recorder...')
      videoRecorderRef.current.stop()
      setIsVideoRecording(false)
    }
    
    // Show paused alert
    setRecordingStatus('⏸️ Video Recording Paused - Saving...')
    setShowRecordingAlert(true)
    
    return new Promise((resolve) => {
      // Wait for onstop to fire and blob to be created
      setTimeout(async () => {
        console.log('Checking for blob after wait...')
        console.log('Blob exists:', !!recordedVideoBlob.current)
        console.log('Chunks available:', videoChunksRef.current.length)
        
        // If no blob but we have chunks, create it manually
        if (!recordedVideoBlob.current && videoChunksRef.current.length > 0) {
          console.log('⚠️ Creating blob manually from chunks...')
          const blob = new Blob(videoChunksRef.current, { type: 'video/webm' })
          recordedVideoBlob.current = blob
          console.log(`✅ Manual blob: ${(blob.size / 1024 / 1024).toFixed(2)} MB`)
        }
        
        if (!recordedVideoBlob.current) {
          console.error('❌ NO VIDEO BLOB CREATED')
          console.error('This means no video data was recorded!')
          setRecordingStatus('❌ Video recording failed - no data')
          setTimeout(() => setShowRecordingAlert(false), 3000)
          resolve(false)
          return
        }
        
        const blob = recordedVideoBlob.current
        const sizeMB = (blob.size / 1024 / 1024).toFixed(2)
        console.log('📤 UPLOADING VIDEO:', sizeMB, 'MB')
        console.log('Session ID:', sessionId)
        console.log('Blob size:', blob.size, 'bytes')
        
        if (blob.size === 0) {
          console.error('❌ BLOB IS EMPTY!')
          resolve(false)
          return
        }
        
        try {
          console.log('Creating FormData...')
          const formData = new FormData()
          formData.append('video_file', blob, `interview_${sessionId}.webm`)
          console.log('FormData created, calling upload API...')
          
          const response = await interviewService.uploadVideo(sessionId, formData)
          console.log('✅ UPLOAD SUCCESS:', response.data)
          console.log('Response:', JSON.stringify(response.data, null, 2))
          
          // Show success alert
          const path = response.data.path || 'backend/uploads'
          setRecordingStatus(`✅ Video Saved`)
          setTimeout(() => setShowRecordingAlert(false), 3000)
          
          resolve(true)
        } catch (err) {
          console.error('❌ UPLOAD FAILED:', err)
          console.error('Error details:', err.response?.data)
          console.error('Error status:', err.response?.status)
          setRecordingStatus('❌ Upload failed')
          setTimeout(() => setShowRecordingAlert(false), 3000)
          resolve(false)
        }
      }, 2000) // Wait 2 seconds for blob creation
    })
  }

  const startInterview = async () => {
    try {
      setStatus('Starting interview...')
      setInterviewStarted(true)
      
      // Start video recording
      const recordingStarted = startVideoRecording()
      if (!recordingStarted) {
        console.error('❌ Failed to start video recording')
        // Continue anyway
      }
      
      // Get candidate info first
      let candidateName = 'there'
      try {
        const sessionInfo = await interviewService.getSession(sessionId)
        candidateName = sessionInfo.data.candidate_name || 'there'
        console.log('Candidate name:', candidateName)
      } catch (err) {
        console.error('Failed to get candidate name:', err)
      }
      
      // Determine speaker based on selected interviewer
      console.log('selectedInterviewer:', selectedInterviewer)
      const speaker = selectedInterviewer === 'aarushi' ? 'anushka' : 'abhilash'
      console.log('Computed speaker:', speaker)
      console.log('Sending speaker to backend:', speaker)
      
      // Start interview with speaker preference
      const interviewStartPromise = interviewService.start(sessionId, speaker)
      console.log('Interview start called with speaker:', speaker)
      
      // Show greeting with actual candidate name
      const greetingText = `Hello ${candidateName}! Welcome to your interview. I'm your interviewer today. I'll be asking you questions about your skills and experience. Please take your time with each answer and speak clearly. Let's begin!`
      setAvatarState('speaking')
      setSubtitle(greetingText)
      setStatus('Greeting...')
      console.log('Greeting text:', greetingText)
      
      // Generate greeting audio using Sarvam TTS with selected voice
      try {
        const greetingAudioResponse = await interviewService.generateGreetingAudio(greetingText, speaker)
        const audioBlob = new Blob([greetingAudioResponse.data], { type: 'audio/wav' })
        const audioUrl = URL.createObjectURL(audioBlob)
        
        const audio = new Audio(audioUrl)
        audio.play().catch(e => console.log('Audio play error:', e))
        
        audio.onended = async () => {
          setAvatarState('idle')
          URL.revokeObjectURL(audioUrl)
          // Wait for interview start to complete
          await interviewStartPromise
          // Immediately get first question
          await getNextQuestion()
        }
        
        audio.onerror = async () => {
          console.log('Audio error, using delay fallback')
          await new Promise(resolve => setTimeout(resolve, 5000))
          setAvatarState('idle')
          await interviewStartPromise
          await getNextQuestion()
        }
      } catch (err) {
        console.log('TTS error, using delay fallback')
        await new Promise(resolve => setTimeout(resolve, 5000))
        setAvatarState('idle')
        await interviewStartPromise
        await getNextQuestion()
      }
    } catch (err) {
      setError('Failed to start interview')
    }
  }

  const getNextQuestion = async () => {
    try {
      setAvatarState('thinking')
      setStatus('Preparing next question...')
      setSubtitle('')
      
      const response = await interviewService.getNextQuestion(sessionId)
      const question = response.data
      
      // Check if interview is complete (question_id = 0 and is_last = true)
      if (question.is_last && question.question_id === 0) {
        console.log('Interview completed - showing completion message')
        
        // Show completion message
        setSubtitle(question.question_text)
        setAvatarState('speaking')
        setStatus('🎉 Interview Complete!')
        
        // Use Sarvam TTS for completion message with selected voice
        const speaker = selectedInterviewer === 'aarushi' ? 'anushka' : 'abhilash'
        try {
          console.log('Generating goodbye audio...')
          const audioResponse = await interviewService.generateGreetingAudio(question.question_text, speaker)
          const audioBlob = new Blob([audioResponse.data], { type: 'audio/wav' })
          const audioUrl = URL.createObjectURL(audioBlob)
          
          const audio = new Audio(audioUrl)
          console.log('Playing goodbye message...')
          audio.play().catch(e => console.log('Audio play error:', e))
          
          audio.onended = () => {
            console.log('Goodbye audio finished playing')
            setAvatarState('idle')
            URL.revokeObjectURL(audioUrl)
            // Wait 1 second after audio ends, then start finalization
            setTimeout(() => {
              handleInterviewComplete()
            }, 1000)
          }
          
          audio.onerror = () => {
            console.log('Audio error for completion message')
            setAvatarState('idle')
            // Still complete even if audio fails
            setTimeout(() => {
              handleInterviewComplete()
            }, 2000)
          }
        } catch (err) {
          console.log('TTS error for completion message:', err)
          setAvatarState('idle')
          // Still complete even if TTS fails
          setTimeout(() => {
            handleInterviewComplete()
          }, 2000)
        }
        return
      }
      
      setCurrentQuestion(question)
      setSubtitle(question.question_text)
      
      // Check if this is a coding question
      const isCodingQuestion = question.question_text.toLowerCase().includes('write') && 
                               (question.question_text.toLowerCase().includes('code') || 
                                question.question_text.toLowerCase().includes('function') ||
                                question.question_text.toLowerCase().includes('program'))
      setShowCodeEditor(isCodingQuestion)
      
      // Play audio from backend (Sarvam TTS)
      if (question.audio_url) {
        console.log('🔊 Playing audio:', question.audio_url)
        setAvatarState('speaking')
        setStatus('Speaking...')
        
        const fullUrl = question.audio_url.startsWith('http') 
          ? question.audio_url 
          : `${import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000'}${question.audio_url}`
        
        console.log('🔊 Full audio URL:', fullUrl)
        
        const audio = new Audio(fullUrl)
        
        audio.onloadeddata = () => {
          console.log('✅ Audio loaded successfully')
        }
        
        audio.play()
          .then(() => console.log('✅ Audio playing'))
          .catch(e => {
            console.error('❌ Audio play error:', e)
            setAvatarState('idle')
            setStatus('Your turn to answer')
          })
        
        audio.onended = () => {
          console.log('✅ Audio ended')
          setAvatarState('idle')
          setStatus('Your turn to answer')
        }
        
        audio.onerror = (e) => {
          console.error('❌ Audio error:', e)
          setAvatarState('idle')
          setStatus('Your turn to answer')
        }
      } else {
        console.log('⚠️ No audio URL provided')
        setAvatarState('idle')
        setStatus('Your turn to answer')
      }
    } catch (err) {
      console.log('Error getting next question:', err)
      console.log('Error response:', err.response)
      
      // Check if it's a completion scenario
      if (err.response?.status === 200 || 
          err.response?.data?.detail === "Interview completed" ||
          err.response?.data?.is_interview_complete) {
        console.log('Interview completed via error handler')
        handleInterviewComplete()
      } else {
        console.error('Failed to get next question:', err)
        setError('Failed to get next question. The interview may be complete.')
        setAvatarState('idle')
        // Still try to complete gracefully
        setTimeout(() => {
          handleInterviewComplete()
        }, 3000)
      }
    }
  }

  const handleInterviewComplete = async () => {
    console.log('🏁 INTERVIEW COMPLETE - STARTING FINALIZATION')
    console.log('Session ID:', sessionId)
    console.log('Video recorder exists:', !!videoRecorderRef.current)
    console.log('Video stream exists:', !!videoStream)
    console.log('Is recording:', isVideoRecording)
    
    setInterviewComplete(true)
    setStatus('Finalizing interview...')
    
    // Stop and upload video
    console.log('Calling stopAndUploadVideo()...')
    const uploadSuccess = await stopAndUploadVideo()
    console.log('stopAndUploadVideo() returned:', uploadSuccess)
    
    if (uploadSuccess) {
      console.log('✅ Video saved successfully')
    } else {
      console.log('⚠️ Video save had issues')
    }
    
    // Stop video stream
    if (videoStream) {
      console.log('🎥 Stopping camera stream')
      videoStream.getTracks().forEach(track => track.stop())
      setVideoStream(null)
      if (videoRef.current) {
        videoRef.current.srcObject = null
      }
    }
    
    setStatus('Interview Complete! Redirecting...')
    
    // Redirect after delay
    setTimeout(() => {
      console.log('🏠 Redirecting to home')
      navigate('/')
    }, 5000) // Increased to 5 seconds to see alerts
  }

  // Convert WebM audio to WAV format
  const convertToWav = async (webmBlob) => {
    try {
      console.log('🔄 Converting WebM to WAV...')
      console.log('Input blob size:', webmBlob.size, 'bytes')
      console.log('Input blob type:', webmBlob.type)
      
      // Create audio context
      const audioContext = new (window.AudioContext || window.webkitAudioContext)()
      console.log('Audio context created, sample rate:', audioContext.sampleRate)
      
      // Read webm as array buffer
      const arrayBuffer = await webmBlob.arrayBuffer()
      console.log('Array buffer size:', arrayBuffer.byteLength, 'bytes')
      
      // Decode audio data
      console.log('Decoding audio data...')
      const audioBuffer = await audioContext.decodeAudioData(arrayBuffer)
      console.log('Audio decoded successfully!')
      console.log('Duration:', audioBuffer.duration, 'seconds')
      console.log('Channels:', audioBuffer.numberOfChannels)
      console.log('Sample rate:', audioBuffer.sampleRate)
      
      // Convert to WAV
      console.log('Converting to WAV format...')
      const wavBuffer = audioBufferToWav(audioBuffer)
      const wavBlob = new Blob([wavBuffer], { type: 'audio/wav' })
      
      console.log('✅ Converted to WAV:', wavBlob.size, 'bytes')
      console.log('WAV blob type:', wavBlob.type)
      
      // Verify WAV header
      const headerCheck = new Uint8Array(wavBuffer.slice(0, 12))
      const riff = String.fromCharCode(...headerCheck.slice(0, 4))
      const wave = String.fromCharCode(...headerCheck.slice(8, 12))
      console.log('WAV header check - RIFF:', riff, 'WAVE:', wave)
      
      return wavBlob
    } catch (err) {
      console.error('❌ WAV conversion failed:', err)
      console.error('Error name:', err.name)
      console.error('Error message:', err.message)
      console.error('Stack:', err.stack)
      throw err // Don't return original, throw error so we know it failed
    }
  }

  // Helper: Convert AudioBuffer to WAV format
  const audioBufferToWav = (audioBuffer) => {
    const numChannels = audioBuffer.numberOfChannels
    const sampleRate = audioBuffer.sampleRate
    const format = 1 // PCM
    const bitDepth = 16
    
    const bytesPerSample = bitDepth / 8
    const blockAlign = numChannels * bytesPerSample
    
    const data = []
    for (let i = 0; i < audioBuffer.numberOfChannels; i++) {
      data.push(audioBuffer.getChannelData(i))
    }
    
    const interleaved = interleave(data)
    const dataLength = interleaved.length * bytesPerSample
    const buffer = new ArrayBuffer(44 + dataLength)
    const view = new DataView(buffer)
    
    // WAV header
    writeString(view, 0, 'RIFF')
    view.setUint32(4, 36 + dataLength, true)
    writeString(view, 8, 'WAVE')
    writeString(view, 12, 'fmt ')
    view.setUint32(16, 16, true)
    view.setUint16(20, format, true)
    view.setUint16(22, numChannels, true)
    view.setUint32(24, sampleRate, true)
    view.setUint32(28, sampleRate * blockAlign, true)
    view.setUint16(32, blockAlign, true)
    view.setUint16(34, bitDepth, true)
    writeString(view, 36, 'data')
    view.setUint32(40, dataLength, true)
    
    // Write audio data
    floatTo16BitPCM(view, 44, interleaved)
    
    return buffer
  }

  const interleave = (channelData) => {
    const length = channelData[0].length
    const result = new Float32Array(length * channelData.length)
    let offset = 0
    for (let i = 0; i < length; i++) {
      for (let channel = 0; channel < channelData.length; channel++) {
        result[offset++] = channelData[channel][i]
      }
    }
    return result
  }

  const writeString = (view, offset, string) => {
    for (let i = 0; i < string.length; i++) {
      view.setUint8(offset + i, string.charCodeAt(i))
    }
  }

  const floatTo16BitPCM = (view, offset, input) => {
    for (let i = 0; i < input.length; i++, offset += 2) {
      const s = Math.max(-1, Math.min(1, input[i]))
      view.setInt16(offset, s < 0 ? s * 0x8000 : s * 0x7FFF, true)
    }
  }

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      
      // Use webm format (browser native)
      let mimeType = 'audio/webm'
      if (MediaRecorder.isTypeSupported('audio/webm;codecs=opus')) {
        mimeType = 'audio/webm;codecs=opus'
      }
      
      console.log('🎤 Recording with:', mimeType)
      
      mediaRecorderRef.current = new MediaRecorder(stream, { mimeType })
      audioChunksRef.current = []
      
      mediaRecorderRef.current.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data)
        }
      }
      
      mediaRecorderRef.current.onstop = async () => {
        console.log('🎤 Recording stopped, processing audio...')
        
        // Create blob from chunks
        const webmBlob = new Blob(audioChunksRef.current, { type: mimeType })
        console.log(`📦 WebM blob: ${webmBlob.size} bytes, type: ${webmBlob.type}`)
        
        // Send WebM directly to backend - backend will convert to WAV using ffmpeg
        console.log('📤 Sending WebM to backend for conversion and transcription...')
        await submitAnswer(webmBlob)
        stream.getTracks().forEach(track => track.stop())
      }
      
      mediaRecorderRef.current.start()
      setIsRecording(true)
      setAvatarState('listening')
      setStatus('Recording your answer...')
      
    } catch (err) {
      setError('Failed to start recording. Please check microphone permissions.')
    }
  }

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop()
      setIsRecording(false)
    }
  }

  const submitAnswer = async (audioBlob) => {
    try {
      setAvatarState('thinking')
      setStatus('Evaluating your answer...')
      setSubtitle('')
      setShowCodeEditor(false)
      
      const response = await interviewService.submitAnswer(sessionId, audioBlob)
      const evaluation = response.data
      
      if (evaluation.is_interview_complete) {
        handleInterviewComplete()
      } else {
        await getNextQuestion()
      }
    } catch (err) {
      setError('Failed to submit answer')
      setAvatarState('idle')
      setStatus('Error - Please try again')
    }
  }

  const submitTranscript = async (transcriptText) => {
    try {
      setAvatarState('thinking')
      setStatus('Evaluating your answer...')
      setSubtitle('')
      setShowCodeEditor(false)
      
      // Submit transcript as text answer
      const response = await interviewService.submitTextAnswer(sessionId, transcriptText)
      const evaluation = response.data
      
      if (evaluation.is_interview_complete) {
        handleInterviewComplete()
      } else {
        await getNextQuestion()
      }
    } catch (err) {
      setError('Failed to submit answer')
      setAvatarState('idle')
      setStatus('Error - Please try again')
    }
  }



  const handleCodeSubmit = async (code) => {
    try {
      setAvatarState('thinking')
      setStatus('Evaluating your code...')
      setSubtitle('')
      setShowCodeEditor(false)
      
      // Submit code as text answer
      const response = await interviewService.submitCodeAnswer(sessionId, code)
      const evaluation = response.data
      
      if (evaluation.is_interview_complete) {
        handleInterviewComplete()
      } else {
        await getNextQuestion()
      }
    } catch (err) {
      setError('Failed to submit code')
      setAvatarState('idle')
      setStatus('Error - Please try again')
    }
  }

  const handleEndInterview = () => {
    setShowEndConfirm(true)
  }

  const confirmEndInterview = async () => {
    setShowEndConfirm(false)
    setAvatarState('thinking')
    setStatus('Finalizing interview...')
    
    try {
      // End interview early via API
      await interviewService.endEarly(sessionId)
      handleInterviewComplete()
    } catch (err) {
      console.error('Error ending interview:', err)
      // Still complete on frontend
      handleInterviewComplete()
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-600 via-indigo-600 to-blue-600 flex items-center justify-center p-4">
      <div className="bg-white/95 backdrop-blur-sm rounded-3xl shadow-2xl max-w-6xl w-full p-8">
        {error && (
          <div className="mb-4 p-4 bg-red-100 border border-red-300 text-red-700 rounded-xl">
            {error}
          </div>
        )}

        {!interviewStarted ? (
          <div className="text-center">
            <div className="w-20 h-20 bg-gradient-to-r from-purple-500 to-indigo-500 rounded-full flex items-center justify-center mx-auto mb-6">
              <span className="text-4xl">🎤</span>
            </div>
            <h1 className="text-4xl font-bold mb-4 text-gray-800">Welcome to Your Interview</h1>
            <p className="text-gray-600 mb-6 text-lg max-w-2xl mx-auto">
              You'll be interviewed by an AI avatar. The interview will cover your skills and experience. 
              Your video will be recorded for authenticity. Speak clearly and take your time with each answer.
            </p>
            
            {/* Interviewer Selection */}
            {showInterviewerSelection && !selectedInterviewer && (
              <div className="mb-8 max-w-2xl mx-auto">
                <h2 className="text-2xl font-bold mb-4 text-gray-800">Choose Your Interviewer</h2>
                <p className="text-gray-600 mb-6">Who would you like to be interviewed by?</p>
                <div className="grid md:grid-cols-2 gap-6">
                  {/* Aarush - Male */}
                  <button
                    onClick={() => {
                      setSelectedInterviewer('aarush')
                      setShowInterviewerSelection(false)
                    }}
                    className="group relative bg-gradient-to-br from-blue-50 to-indigo-50 hover:from-blue-100 hover:to-indigo-100 border-2 border-blue-300 hover:border-blue-500 rounded-2xl p-6 transition-all transform hover:scale-105 shadow-lg"
                  >
                    <div className="text-6xl mb-3">👨‍💼</div>
                    <h3 className="text-2xl font-bold text-blue-800 mb-2">Aarush</h3>
                    <p className="text-gray-600 text-sm">Male Interviewer</p>
                    <div className="mt-3 text-xs text-gray-500">Professional & Friendly</div>
                  </button>
                  
                  {/* Aarushi - Female */}
                  <button
                    onClick={() => {
                      setSelectedInterviewer('aarushi')
                      setShowInterviewerSelection(false)
                    }}
                    className="group relative bg-gradient-to-br from-pink-50 to-purple-50 hover:from-pink-100 hover:to-purple-100 border-2 border-pink-300 hover:border-pink-500 rounded-2xl p-6 transition-all transform hover:scale-105 shadow-lg"
                  >
                    <div className="text-6xl mb-3">👩‍💼</div>
                    <h3 className="text-2xl font-bold text-pink-800 mb-2">Aarushi</h3>
                    <p className="text-gray-600 text-sm">Female Interviewer</p>
                    <div className="mt-3 text-xs text-gray-500">Professional & Friendly</div>
                  </button>
                </div>
              </div>
            )}
            
            {selectedInterviewer && (
              <div className="mb-6 p-4 bg-green-50 border-2 border-green-300 rounded-xl max-w-md mx-auto">
                <p className="text-green-800 font-semibold">
                  ✅ You'll be interviewed by {selectedInterviewer === 'aarush' ? 'Aarush 👨‍💼' : 'Aarushi 👩‍💼'}
                </p>
              </div>
            )}
            
            {/* Video Preview */}
            <div className="mb-6 flex justify-center">
              <div className="relative bg-gray-900 rounded-xl overflow-hidden shadow-lg">
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  muted
                  className="w-64 h-48 object-cover"
                  style={{ transform: 'scaleX(-1)' }}
                />
                <div className="absolute bottom-2 left-2 px-2 py-1 bg-red-600 text-white text-xs rounded-full flex items-center space-x-1">
                  <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
                  <span>Camera Active</span>
                </div>
                {!videoStream && (
                  <div className="absolute inset-0 flex items-center justify-center bg-gray-900">
                    <div className="text-center text-white text-xs">
                      <div className="text-2xl mb-1">📹</div>
                      <p>Loading...</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
            
            {selectedInterviewer && (
              <button
                onClick={startInterview}
                className="px-10 py-4 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-xl font-bold hover:from-purple-700 hover:to-indigo-700 text-xl shadow-lg hover:shadow-xl transition-all"
              >
                Start Interview
              </button>
            )}
          </div>
        ) : (
          <div className="grid md:grid-cols-2 gap-8">
            {/* Left: Avatar */}
            <div>
              <div className="mb-4">
                <h2 className="text-2xl font-bold text-gray-800">
                  {selectedInterviewer === 'aarushi' ? 'Aarushi 👩‍💼' : 'Aarush 👨‍💼'}
                </h2>
                <p className="text-sm text-gray-500">Your AI Interviewer</p>
              </div>
              <ProfessionalVideoAvatar 
                state={avatarState} 
                subtitle={subtitle} 
                avatarType={selectedInterviewer === 'aarushi' ? 'female' : 'male'}
              />
            </div>

            {/* Right: Candidate Video & Controls */}
            <div>
              <div className="mb-4">
                <h2 className="text-2xl font-bold text-gray-800">You</h2>
              </div>
              
              {/* Candidate Video */}
              {!interviewComplete ? (
                <div className="relative mb-6 bg-gray-900 rounded-2xl overflow-hidden shadow-lg" style={{ minHeight: '320px' }}>
                  <video
                    ref={interviewVideoRef}
                    autoPlay
                    playsInline
                    muted
                    key="interview-video"
                    className="w-full h-80 object-cover"
                    style={{ transform: 'scaleX(-1)', backgroundColor: '#000' }}
                  />
                  <div className="absolute top-4 right-4 px-3 py-1.5 bg-red-600 text-white text-sm rounded-full flex items-center space-x-2 font-semibold shadow-lg">
                    <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
                    <span>Recording</span>
                  </div>
                  {!videoStream && (
                    <div className="absolute inset-0 flex items-center justify-center bg-gray-900">
                      <div className="text-center text-white">
                        <div className="text-4xl mb-2">📹</div>
                        <p>Initializing camera...</p>
                      </div>
                    </div>
                  )}
                  {videoStream && (
                    <div className="absolute bottom-4 left-4 px-2 py-1 bg-green-600 text-white text-xs rounded-full">
                      Stream Active
                    </div>
                  )}
                </div>
              ) : (
                <div className="relative mb-6 h-80 bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl flex items-center justify-center border-2 border-green-200">
                  <div className="text-center">
                    <div className="text-6xl mb-4">✅</div>
                    <p className="text-xl font-bold text-green-800">Recording Stopped</p>
                    <p className="text-sm text-green-600 mt-2">Camera and microphone turned off</p>
                  </div>
                </div>
              )}

              {/* Status */}
              <div className="mb-6 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-200">
                <p className="font-bold text-lg text-gray-800">{status}</p>
              </div>

              {/* Code Editor for coding questions */}
              {showCodeEditor && !interviewComplete && (
                <div className="mb-6">
                  <CodeEditor onSubmit={handleCodeSubmit} />
                </div>
              )}

              {/* Controls */}
              {!interviewComplete && avatarState !== 'speaking' && avatarState !== 'thinking' && (
                <div className="space-y-3">
                  {!isRecording ? (
                    <>
                      {!showCodeEditor && (
                        <button
                          onClick={startRecording}
                          className="w-full px-8 py-4 bg-gradient-to-r from-red-600 to-pink-600 text-white rounded-xl font-bold hover:from-red-700 hover:to-pink-700 text-lg shadow-lg flex items-center justify-center space-x-2"
                        >
                          <span className="text-2xl">🎤</span>
                          <span>Start Voice Answer</span>
                        </button>
                      )}
                      <button
                        onClick={handleEndInterview}
                        className="w-full px-6 py-3 bg-gray-200 text-gray-700 rounded-xl font-semibold hover:bg-gray-300 transition-colors"
                      >
                        End Interview Early
                      </button>
                    </>
                  ) : (
                    <button
                      onClick={stopRecording}
                      className="w-full px-8 py-4 bg-gradient-to-r from-gray-700 to-gray-900 text-white rounded-xl font-bold hover:from-gray-800 hover:to-black text-lg animate-pulse shadow-lg flex items-center justify-center space-x-2"
                    >
                      <span className="text-2xl">⏹️</span>
                      <span>Stop & Submit</span>
                    </button>
                  )}
                </div>
              )}

              {interviewComplete && (
                <div className="p-6 bg-gradient-to-r from-green-50 to-emerald-50 rounded-2xl border-2 border-green-200">
                  <h3 className="text-2xl font-bold text-green-800 mb-3 flex items-center space-x-2">
                    <span>✅</span>
                    <span>Interview Completed!</span>
                  </h3>
                  <p className="text-gray-700 text-lg">
                    Thank you for your time. The HR team will review your interview and get back to you soon.
                  </p>
                </div>
              )}

              {isRecording && (
                <div className="mt-4 flex justify-center">
                  <div className="flex space-x-2">
                    <div className="w-3 h-3 bg-red-600 rounded-full animate-bounce"></div>
                    <div className="w-3 h-3 bg-red-600 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                    <div className="w-3 h-3 bg-red-600 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* End Interview Confirmation Modal */}
      {showEndConfirm && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl p-8 max-w-md w-full shadow-2xl">
            <h3 className="text-2xl font-bold text-gray-800 mb-4">End Interview Early?</h3>
            <p className="text-gray-600 mb-6">
              Are you sure you want to end the interview now? Your progress will be evaluated based on the questions answered so far.
            </p>
            <div className="flex space-x-4">
              <button
                onClick={confirmEndInterview}
                className="flex-1 py-3 bg-red-600 text-white rounded-xl hover:bg-red-700 transition-colors font-semibold"
              >
                Yes, End Now
              </button>
              <button
                onClick={() => setShowEndConfirm(false)}
                className="flex-1 py-3 bg-gray-200 text-gray-700 rounded-xl hover:bg-gray-300 transition-colors font-semibold"
              >
                Continue Interview
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default InterviewRoom
